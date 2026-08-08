import { useState, type FormEvent } from "react";
import type { ChatMessage } from "../types/chat";
import { askAi, AiChatError } from "../api/aiChat";

interface ChatPanelProps {
  className?: string;
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  isChatChannelOpen: boolean;
}

type Tab = "general" | "ai";

export default function ChatPanel({
  className = "",
  chatMessages,
  onSendChatMessage,
  isChatChannelOpen,
}: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div
      className={`${className} overflow-hidden rounded-2xl border border-brand-pink-light bg-white shadow-lg`}
    >
      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={
            activeTab === "general"
              ? "flex-1 border-b-2 border-brand-pink py-3 text-sm font-semibold text-brand-pink-dark"
              : "flex-1 py-3 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
          }
        >
          일반채팅
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={
            activeTab === "ai"
              ? "flex-1 border-b-2 border-brand-green py-3 text-sm font-semibold text-brand-green-dark"
              : "flex-1 py-3 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
          }
        >
          AI 챗봇
        </button>
      </div>

      <div
        className={
          activeTab === "general"
            ? "flex min-h-0 flex-1 flex-col"
            : "hidden min-h-0 flex-1 flex-col"
        }
      >
        <GeneralChatTab
          messages={chatMessages}
          onSend={onSendChatMessage}
          isChannelOpen={isChatChannelOpen}
        />
      </div>

      <div
        className={
          activeTab === "ai"
            ? "flex min-h-0 flex-1 flex-col"
            : "hidden min-h-0 flex-1 flex-col"
        }
      >
        <AiChatTab />
      </div>
    </div>
  );
}

function GeneralChatTab({
  messages,
  onSend,
  isChannelOpen,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isChannelOpen: boolean;
}) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    onSend(draft);
    setDraft("");
  };

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {!isChannelOpen && messages.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            상대방과 채팅 연결을 기다리는 중이에요...
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.sender === "me" ? "flex justify-end" : "flex justify-start"}
          >
            <p
              className={
                message.sender === "me"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-pink px-3 py-2 text-sm text-white"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-pink-light px-3 py-2 text-sm text-gray-800"
              }
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={!isChannelOpen}
          placeholder={isChannelOpen ? "메시지를 입력하세요" : "연결 중..."}
          className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={!isChannelOpen || !draft.trim()}
          className="rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </>
  );
}

interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

function AiChatTab() {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    { role: "assistant", content: "궁금한 표현이나 문법을 물어보세요!" },
  ]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    setError(null);
    setIsLoading(true);

    try {
      const answer = await askAi(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(
        err instanceof AiChatError
          ? err.message
          : "챗봇 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <p
              className={
                message.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-pink px-3 py-2 text-sm text-white"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-green-light px-3 py-2 text-sm text-gray-800"
              }
            >
              {message.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-green-light px-3 py-2 text-sm text-gray-500">
              답변을 생각하는 중...
            </p>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="궁금한 표현을 물어보세요"
          disabled={isLoading}
          className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </>
  );
}
