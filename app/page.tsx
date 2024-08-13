export default function Home() {
  return (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">Embedding Model Evaluator</h1>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This website allows you to embed data using different embedding
            models and chat with that data using different LLMs.
          </span>
        </li>
      </ul>
    </div>
  );
}
