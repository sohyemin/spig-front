import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const categories = [
  { label: '문법', accent: true },
  { label: '단어', accent: false },
  { label: '표현', accent: true },
  { label: '어휘', accent: false },
  { label: '대화', accent: true },
]

export default function Features() {
  const { isLoggedIn } = useAuth()

  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold text-gray-900">
        무엇을 할 수 있나요?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
        Spig는 화상채팅으로 대화하고, AI와 함께 학습하는 언어 교환 서비스예요.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-pink-light bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-pink-dark">
            화상채팅으로 대화하기
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            전 세계 친구들과 화상으로 대화하며 언어를 교환해요. 로그인 후
            바로 시작할 수 있어요.
          </p>
          <Link
            to={isLoggedIn ? '/room' : '/login'}
            className="mt-4 inline-block rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
          >
            화상채팅 시작하기
          </Link>
        </div>

        <div className="rounded-2xl border border-brand-pink-light bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            AI 챗봇 학습 도우미
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            궁금한 표현이나 문법을 물어보면 AI가 학습 자료를 바탕으로 답해줘요.
            지금 바로 체험할 수 있어요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.label}
                className={
                  c.accent
                    ? 'rounded-full bg-brand-pink-light px-3 py-1 text-xs font-medium text-brand-pink-dark'
                    : 'rounded-full bg-brand-green-light px-3 py-1 text-xs font-medium text-brand-green-dark'
                }
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
