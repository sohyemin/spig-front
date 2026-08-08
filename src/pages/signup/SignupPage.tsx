import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim() || !passwordConfirm.trim() || !nickname.trim()) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // api 연결
      console.log('TODO: 회원가입 요청', { email, password, nickname })
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-pink-light/40 px-6 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">회원가입</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Spig와 함께 시작해보세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={isLoading}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
          </div>

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

          <div>
            <label
              htmlFor="passwordConfirm"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
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
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-brand-pink-dark hover:underline">
            로그인하러 가기
          </Link>
        </p>
      </div>
    </div>
  )
}
