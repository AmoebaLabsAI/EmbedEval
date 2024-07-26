import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        Nick News Production ChatBot
      </h1>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This website features a an integration with OpenAI's ChatGPT AI
            Assistant.
          </span>
        </li>
      </ul>
    </div>
  );
}
