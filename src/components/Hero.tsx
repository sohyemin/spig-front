export default function Hero() {
  return (
    <section
      id="top"
      className="bg-gradient-to-b from-brand-pink-light to-white px-6 py-20 text-center"
    >
      <span className="inline-block rounded-full bg-brand-green-light px-4 py-1 text-sm font-semibold text-brand-green-dark">
        BETA
      </span>
      <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold text-gray-900 sm:text-5xl">
        친구를 사귀며 배우는
        <br />
        <span className="text-brand-pink-dark">외국어 회화</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
        Spig는 화상채팅으로 대화하고, AI와 함께 표현을 학습하는 언어 교환
        서비스예요. 지금은 베타 단계로, AI 챗봇 기능을 먼저 만나보실 수
        있어요.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <a
          href="#chatbot"
          className="rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-brand-pink-dark"
        >
          AI 챗봇 체험하기
        </a>
        <a
          href="#features"
          className="rounded-full border border-brand-green px-6 py-3 font-semibold text-brand-green-dark transition hover:bg-brand-green-light"
        >
          기능 살펴보기
        </a>
      </div>
    </section>
  )
}
