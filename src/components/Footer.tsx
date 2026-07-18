export default function Footer() {
  return (
    <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-500">
      <p>Spig · 베타 서비스 운영 중이에요. 의견은 언제든 환영합니다.</p>
      <p className="mt-1">© {new Date().getFullYear()} Spig. All rights reserved.</p>
    </footer>
  )
}
