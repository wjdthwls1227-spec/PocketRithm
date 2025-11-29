'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)
      } catch (err) {
        console.error('사용자 정보 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleDeleteAccount = async () => {
    if (confirmText !== '탈퇴하겠습니다') {
      setError('확인 문구를 정확히 입력해주세요.')
      return
    }

    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      // API를 통해 모든 삭제 작업 수행 (서버에서 처리)
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        // 더 자세한 에러 메시지 표시
        const errorMessage = result.details 
          ? `${result.error}\n\n상세: ${result.details}`
          : result.error || '계정 삭제 중 오류가 발생했습니다.'
        throw new Error(errorMessage)
      }

      // Service Role Key가 없는 경우 경고 표시
      if (result.warning) {
        alert(`⚠️ ${result.warning}\n\nSupabase 대시보드 → Authentication → Users에서 수동으로 삭제해주세요.`)
      }

      // 성공 시 로그아웃 및 홈으로 리다이렉트
      const supabase = createClient()
      await supabase.auth.signOut()

      // 홈으로 리다이렉트
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('계정 삭제 오류:', err)
      setError(err instanceof Error ? err.message : '계정 삭제 중 오류가 발생했습니다.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/settings"
            className="text-sm text-accent hover:underline inline-flex items-center gap-1"
          >
            ← 설정으로 돌아가기
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            회원 탈퇴
          </h1>
          <p className="text-sm" style={{ color: '#8E8E93' }}>
            계정을 영구적으로 삭제합니다
          </p>
        </div>

        <div className="card-toss p-7" style={{ border: '2px solid #FEE2E2' }}>
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#DC2626' }}>
                  계정 삭제 전 확인사항
                </h2>
                <ul className="space-y-2 text-sm" style={{ color: '#991B1B', lineHeight: '1.7' }}>
                  <li>• 모든 지출 및 수입 기록이 삭제됩니다</li>
                  <li>• 모든 회고 및 통계 데이터가 삭제됩니다</li>
                  <li>• 참여 중인 챌린지 정보가 삭제됩니다</li>
                  <li>• 이 작업은 되돌릴 수 없습니다</li>
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-xl mb-6" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <p className="text-sm font-medium mb-3" style={{ color: '#991B1B' }}>
                계정 삭제를 확인하려면 아래에 <strong>&quot;탈퇴하겠습니다&quot;</strong>를 입력해주세요.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="탈퇴하겠습니다"
                className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ background: '#FFFFFF' }}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || confirmText !== '탈퇴하겠습니다'}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: confirmText === '탈퇴하겠습니다' ? '#DC2626' : '#E5E7EB',
                  color: confirmText === '탈퇴하겠습니다' ? '#FFFFFF' : '#9CA3AF'
                }}
              >
                {deleting ? '삭제 중...' : '계정 삭제하기'}
              </button>
              <Link
                href="/dashboard/settings"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all border"
                style={{ 
                  background: '#FFFFFF',
                  color: '#111111',
                  borderColor: '#E6E6E7'
                }}
              >
                취소
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

