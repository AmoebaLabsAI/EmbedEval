import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { CohereEmbeddings } from "@langchain/cohere";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { NomicEmbeddings } from "@langchain/nomic";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { createRetrieverTool } from "langchain/tools/retriever";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const runtime = "edge";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

const AGENT_SYSTEM_TEMPLATE = `You are a helpful production assistant at a major network television studio. 

Always use the provided tool to look up an answer to a question, before relying on ChatGPT's large language model.

When replying, make sure to include whether or not you used a tool in the reply, and describe how you used the tool. If you retrieved a document, cite it in the response.`;

/**
 * This handler initializes and calls an tool caling ReAct agent.
 * See the docs for more information:
 *
 * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
 * https://js.langchain.com/docs/use_cases/question_answering/conversational_retrieval_agents
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const embeddingModel = searchParams.get("embeddingModel");
    const model = searchParams.get("chatModel");
    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);
    const returnIntermediateSteps = body.show_intermediate_steps;

    const chatModel =
      model === "openai"
        ? new ChatOpenAI({
            model: "gpt-4o",
            temperature: 0.2,
          })
        : new ChatAnthropic({
            model: "claude-3-5-sonnet-20240620",
            temperature: 0,
            maxTokens: undefined,
            maxRetries: 2,
          });

    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddingModel === "nomic"
        ? new NomicEmbeddings()
        : embeddingModel === "voyage"
        ? new VoyageEmbeddings({
            apiKey: process.env.VOYAGEAI_API_KEY,
            inputType: "document",
          })
        : embeddingModel === "mistral"
        ? new MistralAIEmbeddings({ apiKey: process.env.MISTRAL_API_KEY })
        : embeddingModel === "huggingface"
        ? new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINFACEHUB_API_KEY,
            model: "BAAI/bge-m3",
          })
        : embeddingModel === "cohere"
        ? new CohereEmbeddings({
            apiKey: process.env.COHERE_API_KEY,
            batchSize: 48,
            model: "embed-english-v3.0",
          })
        : new OpenAIEmbeddings(),
      {
        client,
        url: process.env.QDRANT_URL,
        collectionName:
          embeddingModel === "nomic"
            ? "nomic_collection"
            : embeddingModel === "voyage"
            ? "voyage_collection"
            : embeddingModel === "mistral"
            ? "mistral_collection"
            : embeddingModel === "huggingface"
            ? "huggingface_collection"
            : embeddingModel === "cohere"
            ? "cohere_collection"
            : embeddingModel === "openai"
            ? "openai_collection"
            : "default_collection",
      },
    );

    const retriever = vectorStore.asRetriever();

    /**
     * Wrap the retriever in a tool to present it to the agent in a
     * usable form.
     */
    const tool = createRetrieverTool(retriever, {
      name: "vector_database_retrieval",
      description:
        "Retrieves documents from a vector database that are relevant to the user query",
    });

    /**
     * Use a prebuilt LangGraph agent.
     */
    const agent = await createReactAgent({
      llm: chatModel,
      tools: [tool],
      /**
       * Modify the stock prompt in the prebuilt agent. See docs
       * for how to customize your agent:
       *
       * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
       */
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    if (!returnIntermediateSteps) {
      /**
       * Stream back all generated tokens and steps from their runs.
       *
       * We do some filtering of the generated events and only stream back
       * the final response as a string.
       *
       * For this specific type of tool calling ReAct agents with OpenAI, we can tell when
       * the agent is ready to stream back final output when it no longer calls
       * a tool and instead streams back content.
       *
       * See: https://langchain-ai.github.io/langgraphjs/how-tos/stream-tokens/
       */
      const eventStream = await agent.streamEvents(
        {
          messages,
        },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              // Intermediate chat model generations will contain tool calls and no content
              if (!!data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream);
    } else {
      /**
       * We could also pick intermediate steps out from `streamEvents` chunks, but
       * they are generated as JSON objects, so streaming and displaying them with
       * the AI SDK is more complicated.
       */
      const result = await agent.invoke({ messages });
      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
