const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class AuthError extends Error {}

export type UserRole = 'USER' | 'ADMIN'

export interface LoginResult {
  accessToken: string
  tokenType: string
  userRole: UserRole
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_id: email, password }),
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    throw new AuthError(`로그인 요청이 실패했습니다 (status: ${res.status})`)
  }

  return (await res.json()) as LoginResult
}

export interface SignupParams {
  email: string
  password: string
  name: string
}

export async function signup(params: SignupParams): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login_id: params.email,
      password: params.password,
      name: params.name,
    }),
  })

  if (!res.ok) {
    if (res.status === 409) {
      throw new AuthError('이미 사용 중인 이메일이에요.')
    }
    throw new AuthError(`회원가입 요청이 실패했습니다 (status: ${res.status})`)
  }
}
