import { useRef, useState, type DragEvent } from 'react'
import type { AuthToken } from '../api/admin'
import { AdminApiError } from '../api/admin'

interface UploadItem {
  id: string
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
  errorMessage?: string
}

interface UploadZoneProps {
  title: string
  description: string
  accept?: string
  badge?: string
  uploadFn: (
    file: File,
    token: AuthToken,
    onProgress?: (progress: number) => void,
  ) => Promise<void>
  token: AuthToken
}

export default function UploadZone({
  title,
  description,
  accept = '.txt,.pdf,.docx,.csv,.json',
  badge,
  uploadFn,
  token,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const uploadFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const id = crypto.randomUUID()
      setItems((prev) => [...prev, { id, file, status: 'uploading', progress: 0 }])

      uploadFn(file, token, (progress) => updateItem(id, { progress }))
        .then(() => {
          updateItem(id, { status: 'success', progress: 100 })
        })
        .catch((err) => {
          updateItem(id, {
            status: 'error',
            errorMessage:
              err instanceof AdminApiError ? err.message : '업로드 중 문제가 발생했어요.',
          })
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
    <div className="mt-6 rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {badge && (
          <span className="rounded-full bg-brand-green-light px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>

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
        <p className="mt-1 text-xs text-gray-400">txt, pdf, docx, csv, json 등 학습 자료 파일</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
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
            <li key={item.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{item.file.name}</p>
                  {item.status === 'error' && (
                    <p className="mt-0.5 text-xs text-red-600">{item.errorMessage}</p>
                  )}
                </div>

                {item.status === 'uploading' && (
                  <span className="shrink-0 rounded-full bg-brand-pink-light px-3 py-1 text-xs font-semibold text-brand-pink-dark">
                    {item.progress}%
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
              </div>

              {item.status === 'uploading' && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-pink transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
