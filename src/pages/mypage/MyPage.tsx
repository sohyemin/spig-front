import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorScreen from '../../components/common/ErrorScreen'

export default function MyPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  if (!isLoggedIn || !user) {
    return (
      <ErrorScreen
        title="로그인이 필요해요"
        message="마이페이지는 로그인 후 이용할 수 있어요."
        onRetry={() => navigate('/login')}
        retryLabel="로그인하러 가기"
      />
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-pink-light/40 px-6 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">마이페이지</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Spig 계정 정보를 확인할 수 있어요.
        </p>

        <div className="mt-8 rounded-2xl bg-brand-pink-light/40 p-4">
          <p className="text-xs font-medium text-gray-500">이메일</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{user.email}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
