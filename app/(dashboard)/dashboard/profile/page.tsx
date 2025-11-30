'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    expenseCount: 0,
    incomeCount: 0,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        setProfile(profileData)

        // 통계 정보 가져오기
        const [expensesResult, incomesResult] = await Promise.all([
          supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', currentUser.id),
          supabase
            .from('incomes')
            .select('amount')
            .eq('user_id', currentUser.id),
        ])

        if (expensesResult.data) {
          const total = expensesResult.data.reduce((sum, e) => sum + (e.amount || 0), 0)
          setStats(prev => ({
            ...prev,
            totalExpenses: total,
            expenseCount: expensesResult.data?.length || 0,
          }))
        }

        if (incomesResult.data) {
          const total = incomesResult.data.reduce((sum, i) => sum + (i.amount || 0), 0)
          setStats(prev => ({
            ...prev,
            totalIncome: total,
            incomeCount: incomesResult.data?.length || 0,
          }))
        }
      } catch (err) {
        console.error('데이터 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            마이페이지
          </h1>
          <p className="text-sm" style={{ color: '#8E8E93' }}>
            내 정보와 활동 내역을 확인하세요
          </p>
        </div>

        {/* 프로필 정보 */}
        <div className="card-toss p-7 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>프로필 정보</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-semibold">
                {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#111111' }}>
                  {profile?.name || user?.email?.split('@')[0] || '사용자'}
                </h3>
                <p className="text-sm" style={{ color: '#8E8E93' }}>{user?.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#8E8E93' }}>가입일</p>
                  <p className="text-base font-medium" style={{ color: '#111111' }}>
                    {user?.created_at ? formatDate(user.created_at) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#8E8E93' }}>마지막 로그인</p>
                  <p className="text-base font-medium" style={{ color: '#111111' }}>
                    {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="card-toss p-7 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>활동 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl" style={{ background: '#F7F7F8' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>총 지출</p>
                <span className="text-lg">💰</span>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>
                {stats.totalExpenses.toLocaleString()}원
              </p>
              <p className="text-xs" style={{ color: '#8E8E93' }}>
                {stats.expenseCount}건의 지출 기록
              </p>
            </div>
            <div className="p-5 rounded-xl" style={{ background: '#F7F7F8' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>총 수입</p>
                <span className="text-lg">💵</span>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>
                {stats.totalIncome.toLocaleString()}원
              </p>
              <p className="text-xs" style={{ color: '#8E8E93' }}>
                {stats.incomeCount}건의 수입 기록
              </p>
            </div>
            <div className="p-5 rounded-xl" style={{ background: '#F7F7F8' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>순 자산</p>
                <span className="text-lg">📊</span>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: stats.totalIncome - stats.totalExpenses >= 0 ? '#4C6EF5' : '#FF6B6B' }}>
                {(stats.totalIncome - stats.totalExpenses).toLocaleString()}원
              </p>
              <p className="text-xs" style={{ color: '#8E8E93' }}>
                수입 - 지출
              </p>
            </div>
            <div className="p-5 rounded-xl" style={{ background: '#F7F7F8' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>평균 지출</p>
                <span className="text-lg">📈</span>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>
                {stats.expenseCount > 0 
                  ? Math.round(stats.totalExpenses / stats.expenseCount).toLocaleString() 
                  : 0}원
              </p>
              <p className="text-xs" style={{ color: '#8E8E93' }}>
                건당 평균
              </p>
            </div>
          </div>
        </div>

        {/* 빠른 링크 */}
        <div className="card-toss p-7">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>빠른 링크</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/dashboard/expenses"
              className="p-4 rounded-xl border border-border hover:bg-surface transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💸</span>
                <div>
                  <p className="font-medium" style={{ color: '#111111' }}>지출 관리</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>지출 내역 확인 및 추가</p>
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/income"
              className="p-4 rounded-xl border border-border hover:bg-surface transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-medium" style={{ color: '#111111' }}>수입 관리</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>수입 내역 확인 및 추가</p>
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/statistics"
              className="p-4 rounded-xl border border-border hover:bg-surface transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium" style={{ color: '#111111' }}>통계</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>상세 통계 및 분석</p>
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-4 rounded-xl border border-border hover:bg-surface transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-medium" style={{ color: '#111111' }}>설정</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>계정 설정 및 관리</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


