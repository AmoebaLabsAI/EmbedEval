"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { useState } from "react";

export default function AgentsPage() {
  const [embeddingModel, setEmbeddingModel] = useState("bge-m3");
  const [chatModel, setChatModel] = useState("openai");

  function handleEmbeddingChange(e: string) {
    setEmbeddingModel(e);
  }

  function handleModdelChange(e: string) {
    setChatModel(e);
  }

  const InfoCard = (
    <div className="rounded bg-[#25252d] w-full max-h-[85%] margin-auto">
      <h1 className="text-3xl md:text-4xl mb-4">EmbedEval</h1>
      <h2>Step 1: Choose an Embedding Model</h2>
      <select
        name="cars"
        id="cars"
        onChange={(e) => handleEmbeddingChange(e.target.value)}
        className="bg-black"
      >
        <option value="bge-m3">BAAI/bge-m3</option>
        <option value="text-embedding-ada-002">
          OpenAI/text-embedding-ada-002
        </option>
        <option value="text-embedding-3-large">
          OpenAI/text-embedding-3-large
        </option>
        <option value="text-embedding-3-small">
          OpenAI/text-embedding-3-small
        </option>
        <option value="embed-english-v3.0">Cohere/embed-english-v3.0</option>
        <option value="snowflake-arctic-embed-m">
          Snowflake/snowflake-arctic-embed-m
        </option>
        {/*

        <option value="snowflake-arctic-embed-l">
          Snowflake/snowflake-arctic-embed-l
        </option>
        <option value="snowflake-arctic-embed-m-long">
          Snowflake/snowflake-arctic-embed-m-long
        </option>
        <option value="snowflake-arctic-embed-xs">
          Snowflake/snowflake-arctic-embed-xs
        </option>
        <option value="snowflake-arctic-embed-s">
          Snowflake/snowflake-arctic-embed-s
        </option>
        <option value="snowflake-arctic-embed-m-v1.5">
          Snowflake/snowflake-arctic-embed-m-v1.5
        </option>
          */}
        <option value="LaBSE">sentence-transformers/LaBSE</option>
        <option value="all-MiniLM-L6-v2">
          sentence-transformers/all-MiniLM-L6-v2
        </option>
        <option value="mistral">Mistral</option>
        <option value="nomic">Nomic</option>
        <option value="voyage">VoyageAI</option>
      </select>
      <br />
      <br />
      {embeddingModel === "bge-m3" ? (
        <ul>
          <li>
            Developed by researchers at the{" "}
            <a href="https://www.baai.ac.cn/english.html">
              Beijing Academy of Artificial Intelligence
            </a>
          </li>
          <li>Dimensions: 1024</li>
          <li>
            <a href="https://huggingface.co/BAAI/bge-m3" target="_blank">
              Learn More
            </a>
          </li>
          <br />
        </ul>
      ) : null}
      {embeddingModel === "text-embedding-ada-002" ? (
        <ul>
          <li>
            Developed by researchers at{" "}
            <a href="https://www.openai.com" target="_blank">
              OpenAI
            </a>
          </li>
          <li>Dimensions: 1024</li>
          <li>
            <a
              href="https://openai.com/index/new-and-improved-embedding-model/"
              target="_blank"
            >
              Learn More
            </a>
          </li>
        </ul>
      ) : null}
      {embeddingModel === "text-embedding-3-large" ? (
        <ul>
          <li>
            Developed by researchers at{" "}
            <a href="https://www.openai.com" target="_blank">
              OpenAI
            </a>
          </li>
          <li>Dimensions: 3072</li>
          <li>
            <a
              href="https://openai.com/index/new-embedding-models-and-api-updates/"
              target="_blank"
            >
              Learn More
            </a>
          </li>
        </ul>
      ) : null}
      {embeddingModel === "text-embedding-3-small" ? (
        <ul>
          <li>
            Developed by researchers at{" "}
            <a href="https://www.openai.com" target="_blank">
              OpenAI
            </a>
          </li>
          <li>Dimensions: 1536</li>
          <li>
            <a
              href="https://openai.com/index/new-embedding-models-and-api-updates/"
              target="_blank"
            >
              Learn More
            </a>
          </li>
        </ul>
      ) : null}

      <h2>Step 2: Choose Chat Model</h2>
      <select
        name="cars"
        id="cars"
        onChange={(e) => handleModdelChange(e.target.value)}
        className="bg-black"
      >
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
      </select>
      <br />
      <br />
      <h2>Step 3: Upload Your Data</h2>
      <h2>Step 4: Chat with your data</h2>
    </div>
  );

  return (
    <ChatWindow
      endpoint={`api/chat/evaluate?embeddingModel=${embeddingModel}&chatModel=${chatModel}`}
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
      placeholder={'Ask, "Who is the compliance manager at MTV?"'}
      emoji="🤖"
      embeddingModel={embeddingModel}
    />
  );
}
