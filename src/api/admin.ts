import type { ChunkUploadInitResponse, } from '../types/upload'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class AdminApiError extends Error {}

export interface AuthToken {
  accessToken: string
  tokenType: string
}

// 일반 파일 업로드 API
export async function uploadTrainingFile(
  file: File,
  token: AuthToken,
  onProgress?: (progress: number) => void,
): Promise<void> {
  onProgress?.(0)

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/api/admin/learning/files`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })

  if (!res.ok) {
    if (res.status === 403) {
      throw new AdminApiError('관리자 권한이 없어요.')
    }
    throw new AdminApiError(`파일 업로드에 실패했어요 (status: ${res.status})`)
  }

  onProgress?.(100)
}

function authHeaders(token: AuthToken): HeadersInit {
  return { Authorization: `${token.tokenType} ${token.accessToken}` }
}

// 청크 업로드 초기화 API
export async function initChunkUpload(
  file: File,
  token: AuthToken,
): Promise<ChunkUploadInitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/learning/files/uploads`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      "Content-Type":"application/json"  
    },
    body: JSON.stringify({
      originalName: file.name,
      contentType:
        file.type || "application/octet-stream",
      totalSize: file.size,
    }),
  })
  
  if (!res.ok) {
    if (res.status === 403) {
      throw new AdminApiError('관리자 권한이 없어요.')
    }
    throw new AdminApiError(`파일 업로드에 실패했어요 (status: ${res.status})`)
  }

  console.log(res.json())

  return await res.json() as ChunkUploadInitResponse;
}

const CHUNK_MAX_RETRIES = 2

async function uploadChunkWithRetry(
  uploadId: string,
  chunkIndex: number,
  chunk: Blob,
  token: AuthToken,
): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt <= CHUNK_MAX_RETRIES; attempt++) {
    try {
      const formData = new FormData()
      formData.append('chunk', chunk)

      const res = await fetch(
        `${API_BASE_URL}/api/admin/learning/files/uploads/${uploadId}/chunks/${chunkIndex}`,
        {
          method: 'PUT',
          headers: {
            ...authHeaders(token),
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        },
      )

      if (!res.ok) {
        if (res.status === 403) {
          throw new AdminApiError('관리자 권한이 없어요.')
        }
        throw new AdminApiError(
          `청크 업로드에 실패했어요 (status: ${res.status})`,
        )
      }

      return
    } catch (err) {
      lastError = err
      if (err instanceof AdminApiError && err.message === '관리자 권한이 없어요.') {
        throw err
      }
    }
  }

  throw lastError instanceof AdminApiError
    ? lastError
    : new AdminApiError('청크 업로드에 실패했어요.')
}

// 청크 업로드 API (백엔드 구현 중 — 테스트용). 계약:
// 1) POST /api/admin/learning/files/init            { uploadId, fileName, fileSize, totalChunks }
// 2) POST /api/admin/learning/files/{uploadId}/chunks/{chunkIndex}   multipart: { chunk }
// 3) POST /api/admin/learning/files/{uploadId}/complete
export async function uploadTrainingFileChunked(
  file: File,
  token: AuthToken,
  onProgress?: (progress: number) => void,
): Promise<void> {
  onProgress?.(0)

  // 1. init 요청
  const {
    uploadId,
    chunkSize,
    totalChunks,
  } = await initChunkUpload(
    file,
    token,
  );

  console.log({
    uploadId,
    chunkSize,
    totalChunks,
  });

  // 2. 백엔드가 알려준 크기로 파일 분할
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(
      start + chunkSize,
      file.size,
    );

    const chunk = file.slice(start, end);

    console.log({
      uploadId,
      chunkNumber: chunkIndex,
      chunkSize: chunk.size,
    });

    // 이후 uploadChunk()를 여기에 연결
    await uploadChunkWithRetry(uploadId, chunkIndex, chunk, token)

    onProgress?.(Math.round(((chunkIndex + 1) / totalChunks) * 99))
  }

  const completeRes = await fetch(
    `${API_BASE_URL}/api/admin/learning/files/uploads/${uploadId}/complete`,
    {
      method: 'PUT',
      headers: authHeaders(token),
    },
  )

  if (!completeRes.ok) {
    if (completeRes.status === 403) {
      throw new AdminApiError('관리자 권한이 없어요.')
    }
    throw new AdminApiError(
      `업로드 완료 처리에 실패했어요 (status: ${completeRes.status})`,
    )
  }

  onProgress?.(100);
}
