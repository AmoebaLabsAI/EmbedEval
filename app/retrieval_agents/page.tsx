"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { useState } from "react";

export default function AgentsPage() {
  const [embeddingModel, setEmbeddingModel] = useState("huggingface");
  const [chatModel, setChatModel] = useState("openai");

  function handleEmbeddingChange(e: string) {
    setEmbeddingModel(e);
  }

  function handleModdelChange(e: string) {
    setChatModel(e);
  }

  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">Retrieval Agent</h1>
      <h3>Choose Embedding Model</h3>
      <select
        name="cars"
        id="cars"
        onChange={(e) => handleEmbeddingChange(e.target.value)}
        className="bg-black"
      >
        <option value="huggingface">HuggingFaceInference</option>
        <option value="openai">OpenAI</option>
        <option value="cohere">Cohere</option>
        <option value="mistral">Mistral</option>
        <option value="nomic">Nomic</option>
        <option value="voyage">VoyageAI</option>
      </select>
      <p>embeddingmodel: {embeddingModel}</p>

      <h3>Choose Chat Model</h3>
      <select
        name="cars"
        id="cars"
        onChange={(e) => handleModdelChange(e.target.value)}
        className="bg-black"
      >
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
      </select>
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

  return (
    <ChatWindow
      endpoint={`api/chat/retrieval_agents?embeddingModel=${embeddingModel}&chatModel=${chatModel}`}
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
