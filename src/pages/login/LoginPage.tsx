import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as loginApi, AuthError } from '../../api/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const { accessToken, tokenType, userRole } = await loginApi(email, password)
      login(email, { accessToken, tokenType, userRole })
      navigate('/')
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-pink-light/40 px-6 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Spig에 오신 것을 환영해요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@spig.com"
              disabled={isLoading}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-brand-pink-dark hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
