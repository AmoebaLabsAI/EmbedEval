import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { NomicEmbeddings } from "@langchain/nomic";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

export const runtime = "edge";

// Before running, follow set-up instructions at
// https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/recursive_text_splitter
 * https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;
  const { searchParams } = new URL(req.url);
  const embeddingModel = searchParams.get("embeddingModel");

  if (embeddingModel === null) {
    return NextResponse.json(
      {
        error:
          "Must provide embedding model as URL parameter to /api/retrieval/ingest",
      },
      { status: 500 },
    );
  }

  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.json(
      {
        error: [
          "Ingest is not supported in demo mode.",
          "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
        ].join("\n"),
      },
      { status: 403 },
    );
  }

  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);

    let model: EmbeddingsInterface = new OpenAIEmbeddings();

    if (embeddingModel === "nomic") {
      model = new NomicEmbeddings();
    }

    if (embeddingModel === "voyage") {
      model = new VoyageEmbeddings({
        apiKey: process.env.VOYAGEAI_API_KEY,
        inputType: "document",
      });
    }

    if (embeddingModel === "mistral") {
      model = new MistralAIEmbeddings({ apiKey: process.env.MISTRAL_API_KEY });
    }

    if (embeddingModel === "BAAI/bge-m3") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "BAAI/bge-m3",
      });
    }

    if (embeddingModel === "all-MiniLM-L6-v2") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "sentence-transformers/all-MiniLM-L6-v2",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-m") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-m",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-l") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-l",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-m-long") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-m-long",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-xs") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-xs",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-s") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-s",
      });
    }

    if (embeddingModel === "snowflake-arctic-embed-m-v1.5") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "Snowflake/snowflake-arctic-embed-m-v1.5",
      });
    }

    if (embeddingModel === "LaBSE") {
      model = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINFACEHUB_API_KEY,
        model: "sentence-transformers/LaBSE",
      });
    }

    if (embeddingModel === "embed-english-v3.0") {
      model = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY,
        batchSize: 48,
        model: "embed-english-v3.0",
      });
    }

    if (embeddingModel === "text-embedding-ada-002") {
      model = new OpenAIEmbeddings();
    }

    if (embeddingModel === "text-embedding-3-large") {
      model = new OpenAIEmbeddings({ modelName: "text-embedding-3-large" });
    }

    if (embeddingModel === "text-embedding-3-small") {
      model = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });
    }

    const vectorStore = await QdrantVectorStore.fromDocuments(
      splitDocuments,
      model,
      {
        client,
        url: process.env.QDRANT_URL,
        collectionName: embeddingModel === null ? "default" : embeddingModel,
      },
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
