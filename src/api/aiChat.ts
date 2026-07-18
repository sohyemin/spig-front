const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class AiChatError extends Error {}

export async function askAi(question: string): Promise<string> {
  const res = await fetch(
    `${API_BASE_URL}/api/ai/ask?question=${encodeURIComponent(question)}`,
  )

  if (!res.ok) {
    throw new AiChatError(`요청이 실패했습니다 (status: ${res.status})`)
  }

  const data = (await res.json()) as { message: string }
  return data.message
}
