import { useRef, useState, type DragEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorScreen from '../../components/common/ErrorScreen'
import { uploadTrainingFile, AdminApiError } from '../../api/admin'

interface UploadItem {
  id: string
  file: File
  status: 'uploading' | 'success' | 'error'
  errorMessage?: string
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)

  if (!isAdmin || !user) {
    return (
      <ErrorScreen
        title="권한이 없어요"
        message="관리자만 접근할 수 있는 페이지예요."
        onRetry={() => navigate('/')}
        retryLabel="홈으로"
      />
    )
  }

  const uploadFiles = (files: FileList | File[]) => {
    const token = { accessToken: user.accessToken, tokenType: user.tokenType }

    Array.from(files).forEach((file) => {
      const id = crypto.randomUUID()
      setItems((prev) => [...prev, { id, file, status: 'uploading' }])

      uploadTrainingFile(file, token)
        .then(() => {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: 'success' } : item)),
          )
        })
        .catch((err) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: 'error',
                    errorMessage:
                      err instanceof AdminApiError
                        ? err.message
                        : '업로드 중 문제가 발생했어요.',
                  }
                : item,
            ),
          )
        })
    })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files.length > 0) {
      uploadFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="min-h-screen bg-brand-pink-light/40 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-gray-500 hover:text-brand-pink-dark">
          ← 홈으로
        </Link>

        <div className="mt-4 rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">관리자</h1>
          <p className="mt-2 text-sm text-gray-600">
            AI 학습에 사용할 자료를 업로드하세요.
          </p>

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={
              isDragging
                ? 'mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-pink bg-brand-pink-light/40 px-6 py-12 text-center transition'
                : 'mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12 text-center transition hover:border-brand-pink-light hover:bg-brand-pink-light/20'
            }
          >
            <p className="text-sm font-medium text-gray-700">
              파일을 이곳에 끌어다 놓거나 클릭해서 선택하세요
            </p>
            <p className="mt-1 text-xs text-gray-400">
              txt, pdf, docx, csv, json 등 학습 자료 파일
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.docx,.csv,.json"
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  uploadFiles(event.target.files)
                }
                event.target.value = ''
              }}
              className="hidden"
            />
          </div>

          {items.length > 0 && (
            <ul className="mt-6 space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {item.file.name}
                    </p>
                    {item.status === 'error' && (
                      <p className="mt-0.5 text-xs text-red-600">{item.errorMessage}</p>
                    )}
                  </div>

                  {item.status === 'uploading' && (
                    <span className="shrink-0 rounded-full bg-brand-pink-light px-3 py-1 text-xs font-semibold text-brand-pink-dark">
                      업로드 중...
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="shrink-0 rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green-dark">
                      완료
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      실패
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
