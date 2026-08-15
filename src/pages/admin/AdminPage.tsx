import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorScreen from '../../components/common/ErrorScreen'
import UploadZone from '../../components/UploadZone'
import { uploadTrainingFile, uploadTrainingFileChunked } from '../../api/admin'

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

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

  const token = { accessToken: user.accessToken, tokenType: user.tokenType }

  return (
    <div className="min-h-screen bg-brand-pink-light/40 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-gray-500 hover:text-brand-pink-dark">
          ← 홈으로
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">관리자</h1>

        <UploadZone
          title="파일 업로드"
          description="AI 학습에 사용할 자료를 업로드하세요."
          uploadFn={uploadTrainingFile}
          token={token}
        />

        <UploadZone
          title="청크 업로드"
          badge="테스트"
          description="청크 단위로 나눠 업로드하는 기능을 테스트합니다. 백엔드 API가 준비되기 전까지는 실패할 수 있어요."
          uploadFn={uploadTrainingFileChunked}
          token={token}
        />
      </div>
    </div>
  )
}
