"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { useState } from "react";

export default function AgentsPage() {
  const [embeddingModel, setEmbeddingModel] = useState("huggingface");

  function handleChange(e: string) {
    setEmbeddingModel(e);
  }

  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">Retrieval Agent</h1>
      <h3>Choose Embedding Model</h3>
      <h4>Each embedding model puts data in a separate collection.</h4>
      <select
        name="cars"
        id="cars"
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="huggingface">HuggingFaceInference</option>

        <option value="openai">OpenAI</option>
        <option value="cohere">Cohere</option>
        <option value="mistral">Mistral</option>
      </select>
      <p>embeddingmodel: {embeddingModel}</p>
      <ul>
        <li className="hidden text-l md:block">
          🤝
          <span className="ml-2">
            Upload unstructured data into a vector database, then chat with the
            bot and ask questions!{" "}
          </span>
        </li>
      </ul>
    </div>
  );

  let url = "";

  if (embeddingModel == "openai") {
    url = "/api/chat/retrieval_agents_openai";
  }

  if (embeddingModel == "huggingface") {
    url = "api/chat/retrieval_agents";
  }

  if (embeddingModel == "cohere") {
    url = "api/chat/retrieval_agents_cohere";
  }

  if (embeddingModel == "mistral") {
    url = "api/chat/retrieval_agents_mistral";
  }

  return (
    <ChatWindow
      endpoint={url}
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
      placeholder={'Ask, "Who is the compliance manager at MTV?"'}
      emoji="🤖"
      titleText="Robbie the Retrieval Robot"
      embeddingModel={embeddingModel}
    />
  );
}
