const categories = [
  { label: '문법', accent: true },
  { label: '단어', accent: false },
  { label: '표현', accent: true },
  { label: '어휘', accent: false },
  { label: '대화', accent: true },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold text-gray-900">
        무엇을 할 수 있나요?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
        Spig는 학습과 대화를 함께 제공하는 서비스를 목표로 하고 있어요.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-pink-light bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-pink-dark">
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

        <div className="rounded-2xl border border-dashed border-brand-green-light bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              화상채팅으로 대화하기
            </h3>
            <span className="rounded-full bg-brand-green-light px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
              준비 중
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            전 세계 친구들과 화상으로 대화하며 언어를 교환하는 기능을 곧
            선보일 예정이에요.
          </p>
        </div>
      </div>
    </section>
  )
}
