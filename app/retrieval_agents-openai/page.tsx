import { ChatWindow } from "@/components/ChatWindowOpenAI";

export default function AgentsPage() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        Retrieval Agent Using OpenAI Embeddings
      </h1>
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
      endpoint="api/chat/retrieval_agents_openai"
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
      placeholder={'Ask, "Who is the compliance manager at MTV?"'}
      emoji="🤖"
      titleText="Robbie the Retrieval Robot"
    />
  );
}
