export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-pink-light bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-xl font-bold text-brand-pink-dark">
          Spig
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#features" className="transition hover:text-brand-pink-dark">
            기능 소개
          </a>
          <a href="#chatbot" className="transition hover:text-brand-pink-dark">
            챗봇 체험
          </a>
          <a
            href="#chatbot"
            className="rounded-full bg-brand-pink px-4 py-2 text-white transition hover:bg-brand-pink-dark"
          >
            베타 체험하기
          </a>
        </nav>
      </div>
    </header>
  )
}
