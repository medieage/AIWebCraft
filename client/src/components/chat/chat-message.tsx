import { MessageRole } from "@shared/schema";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  provider?: string;
}

export function ChatMessage({ role, content, provider = "GEMINI" }: ChatMessageProps) {
  if (role === "system") {
    return (
      <div className="mb-4 p-3 rounded-lg bg-opacity-30 bg-blue-900 border border-purple-600">
        <p className="text-xs text-gray-400">СИСТЕМА</p>
        <p className="text-sm text-gray-300">{content}</p>
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[80%] p-3 rounded-lg bg-opacity-50 bg-purple-900">
          <p className="text-xs text-gray-400 mb-1">ВЫ</p>
          <p className="text-sm text-white">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex">
      <div className="max-w-[80%] p-3 rounded-lg relative overflow-hidden bg-[rgba(26,27,75,0.25)] border border-[rgba(255,255,255,0.1)]">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-[rgba(0,179,255,0.2)] to-[rgba(159,0,255,0.2)] z-[-1]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[rgba(255,255,255,0)] via-[rgba(255,255,255,0.2)] to-[rgba(255,255,255,0)] transform rotate-30 animate-holographic pointer-events-none z-[-1]" />
        <p className="text-xs text-blue-400 mb-1 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {provider.toUpperCase()}
        </p>
        <div className="text-sm text-white whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
