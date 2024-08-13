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

    const vectorStore = await QdrantVectorStore.fromDocuments(
      splitDocuments,
      (
        (embeddingModel === "nomic") ? new NomicEmbeddings() : 
        (embeddingModel === "voyage") ? new VoyageEmbeddings({apiKey: process.env.VOYAGEAI_API_KEY, inputType: "document"}) : 
        (embeddingModel === "mistral") ? new MistralAIEmbeddings({apiKey: process.env.MISTRAL_API_KEY}) : 
        (embeddingModel === "huggingface") ? new HuggingFaceInferenceEmbeddings({ apiKey: process.env.HUGGINFACEHUB_API_KEY, model: "BAAI/bge-m3"}) : 
        (embeddingModel === "cohere") ? new CohereEmbeddings({apiKey: process.env.COHERE_API_KEY, batchSize: 48, model: "embed-english-v3.0"}) : 
        (embeddingModel === "openai" ? new OpenAIEmbeddings() : new OpenAIEmbeddings) 
      ),
      {
        client,
        url: process.env.QDRANT_URL,
        collectionName: (
          (embeddingModel === "nomic") ? "nomic_collection" : 
          (embeddingModel === "voyage") ? "voyage_collection" : 
          (embeddingModel === "mistral") ? "mistral_collection" : 
          (embeddingModel === "huggingface") ? "huggingface_collection" : 
          (embeddingModel === "cohere") ? "cohere_collection" :
          (embeddingModel === "openai") ? "openai_collection" : "default_collection" 
        ),
      }
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
