const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class AdminApiError extends Error {}

export interface AuthToken {
  accessToken: string
  tokenType: string
}

export async function uploadTrainingFile(file: File, token: AuthToken): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/api/admin/learning/files`, {
    method: 'POST',
    headers: {
      Authorization: `${token.tokenType} ${token.accessToken}`,
    },
    body: formData,
  })

  if (!res.ok) {
    if (res.status === 403) {
      throw new AdminApiError('관리자 권한이 없어요.')
    }
    throw new AdminApiError(`파일 업로드에 실패했어요 (status: ${res.status})`)
  }
}
