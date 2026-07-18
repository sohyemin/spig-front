import { useState, type FormEvent } from 'react'
import { askAi, AiChatError } from '../api/aiChat'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 궁금한 표현이나 문법을 물어보세요. 예: "안부를 묻는 표현 알려줘"',
    },
  ])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setQuestion('')
    setError(null)
    setIsLoading(true)

    try {
      const answer = await askAi(trimmed)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(
        err instanceof AiChatError
          ? err.message
          : '챗봇 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="chatbot" className="bg-brand-green-light/40 px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          AI 챗봇 체험하기
        </h2>
        <p className="mt-3 text-center text-gray-600">
          베타 기능이에요. 학습 자료 범위 내에서 답변해드려요.
        </p>

        <div className="mt-8 flex h-[28rem] flex-col rounded-2xl border border-brand-green-light bg-white shadow-lg">
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }
              >
                <p
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-brand-pink px-4 py-2 text-sm text-white'
                      : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-green-light px-4 py-2 text-sm text-gray-800'
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-green-light px-4 py-2 text-sm text-gray-500">
                  답변을 생각하는 중...
                </p>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-100 p-3"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="궁금한 표현을 물어보세요"
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              전송
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
