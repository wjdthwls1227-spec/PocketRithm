'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        setProfile(profileData)
      } catch (err) {
        console.error('사용자 정보 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            설정
          </h1>
          <p className="text-xs md:text-sm" style={{ color: '#8E8E93' }}>
            계정 설정을 관리하세요
          </p>
        </div>

        {/* 계정 정보 */}
        <div className="card-toss p-4 md:p-7 mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>계정 정보</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#8E8E93' }}>이메일</p>
              <p className="text-base font-medium" style={{ color: '#111111' }}>{user?.email}</p>
            </div>
            {profile?.name && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#8E8E93' }}>이름</p>
                <p className="text-base font-medium" style={{ color: '#111111' }}>{profile.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#8E8E93' }}>가입일</p>
              <p className="text-base font-medium" style={{ color: '#111111' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 예산 관리 */}
        <div className="card-toss p-4 md:p-7 mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>예산 관리</h2>
          <div className="space-y-4">
            <div className="p-4 md:p-5 rounded-xl border border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base mb-1" style={{ color: '#111111' }}>
                    월 예산 설정 및 배분
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: '#8E8E93' }}>
                    기본 예산, 월별 예산, 카테고리별 예산을 설정하고 관리하세요
                  </p>
                </div>
                <Link
                  href="/dashboard/settings/budget"
                  className="px-5 py-2.5 rounded-button font-semibold text-sm transition-all bg-accent text-white hover:opacity-90 w-full md:w-auto text-center"
                >
                  관리하기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 관리 */}
        <div className="card-toss p-4 md:p-7 mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>카테고리 관리</h2>
          <div className="space-y-4">
            <div className="p-4 md:p-5 rounded-xl border border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base mb-1" style={{ color: '#111111' }}>
                    지출/수입 카테고리
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: '#8E8E93' }}>
                    사용할 카테고리를 추가하고 관리하세요
                  </p>
                </div>
                <Link
                  href="/dashboard/settings/categories"
                  className="px-5 py-2.5 rounded-button font-semibold text-sm transition-all bg-accent text-white hover:opacity-90 w-full md:w-auto text-center"
                >
                  관리하기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 위험한 작업 */}
        <div className="card-toss p-4 md:p-7">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>위험한 작업</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl" style={{ background: '#FFF5F5', border: '1px solid #FEE2E2' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-2" style={{ color: '#DC2626' }}>
                    회원 탈퇴
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#991B1B', lineHeight: '1.6' }}>
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.<br />
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Link
                    href="/dashboard/settings/delete-account"
                    className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: '#DC2626', color: '#FFFFFF' }}
                  >
                    회원 탈퇴하기
                  </Link>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
