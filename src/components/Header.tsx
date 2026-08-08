import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { isLoggedIn, isAdmin, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-brand-pink-light bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-xl font-bold text-brand-pink-dark">
          Spig
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#features" className="transition hover:text-brand-pink-dark">
            소개
          </a>
          <Link
            to={isLoggedIn ? '/room' : '/login'}
            className="transition hover:text-brand-pink-dark"
          >
            화상채팅
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="transition hover:text-brand-pink-dark">
                마이페이지
              </Link>
              {isAdmin && (
                <Link to="/admin" className="transition hover:text-brand-pink-dark">
                  관리자
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-brand-pink px-4 py-2 text-white transition hover:bg-brand-pink-dark"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="transition hover:text-brand-pink-dark">
                로그인
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brand-pink px-4 py-2 text-white transition hover:bg-brand-pink-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
