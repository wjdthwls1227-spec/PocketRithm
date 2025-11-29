'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPageDebug() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todayTotal, setTodayTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          window.location.href = '/login'
          return
        }

        setUser(currentUser)

        // 프로필 정보
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        setProfile(profileData)

        // 오늘 날짜
        const today = new Date().toISOString().split('T')[0]
        
        // 이번 달 첫날과 마지막날
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        // 오늘 지출 합계
        const { data: todayExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', currentUser.id)
          .eq('date', today)

        // 이번 달 지출 합계
        const { data: monthExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', currentUser.id)
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth)

        const todaySum = todayExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0
        const monthSum = monthExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0

        setTodayTotal(todaySum)
        setMonthTotal(monthSum)
      } catch (err) {
        console.error('데이터 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  const budget = profile?.monthly_budget || 0
  const budgetUsage = budget > 0 ? Math.round((monthTotal / budget) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">대시보드</h1>
          <p className="text-gray-600">환영합니다, {profile?.name || user?.email}님!</p>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/expenses/new"
            className="bg-blue-600 text-white rounded-lg shadow-md p-6 hover:bg-blue-700 transition transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">지출 추가</p>
                <p className="text-2xl font-bold">+</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Link>

          <Link
            href="/dashboard/expenses"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105 border-2 border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">지출 관리</p>
                <p className="text-xl font-bold text-gray-800">목록 보기</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </Link>

          <Link
            href="/dashboard/statistics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105 border-2 border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">통계</p>
                <p className="text-xl font-bold text-gray-800">분석 보기</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </Link>

          <Link
            href="/dashboard/income/new"
            className="bg-green-600 text-white rounded-lg shadow-md p-6 hover:bg-green-700 transition transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">수입 추가</p>
                <p className="text-2xl font-bold">+</p>
              </div>
              <div className="text-4xl">💵</div>
            </div>
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">오늘 지출</h3>
              <div className="text-3xl">📅</div>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(todayTotal)}
            </p>
            <Link
              href="/dashboard/expenses/new"
              className="text-sm text-blue-600 hover:underline"
            >
              지출 추가하기 →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">이번 달 지출</h3>
              <div className="text-3xl">📆</div>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(monthTotal)}
            </p>
            <Link
              href="/dashboard/expenses"
              className="text-sm text-blue-600 hover:underline"
            >
              상세 보기 →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">월 예산</h3>
              <div className="text-3xl">🎯</div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              {budget > 0 ? formatCurrency(budget) : '미설정'}
            </p>
            {budget > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budgetUsage >= 100
                        ? 'bg-red-500'
                        : budgetUsage >= 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {budgetUsage}% 사용
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/expenses"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-bold mb-2">지출 관리</h3>
            <p className="text-gray-600 text-sm mb-4">
              지출을 기록하고 관리하세요. 욕망, 결핍, 필요로 분류하여 패턴을 파악해보세요.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>

          <Link
            href="/dashboard/statistics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">통계 분석</h3>
            <p className="text-gray-600 text-sm mb-4">
              지출 패턴을 분석하고 통계를 확인하세요. 월별, 카테고리별, 감정별 분석이 가능합니다.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>

          <Link
            href="/dashboard/retrospectives"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">회고</h3>
            <p className="text-gray-600 text-sm mb-4">
              주간/월간 회고를 작성하고 소비 습관을 개선해보세요. 4L, KPT 등 다양한 템플릿을 사용할 수 있습니다.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>

          <Link
            href="/dashboard/income"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">수입 관리</h3>
            <p className="text-gray-600 text-sm mb-4">
              수입을 기록하고 관리하세요. 수입원별로 분류하여 관리할 수 있습니다.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>

          <Link
            href="/dashboard/challenges"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">챌린지</h3>
            <p className="text-gray-600 text-sm mb-4">
              소비 챌린지에 참여하고 다른 사람들과 함께 목표를 달성해보세요.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>

          <Link
            href="/dashboard/articles"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-xl font-bold mb-2">칼럼</h3>
            <p className="text-gray-600 text-sm mb-4">
              소비 습관 개선에 도움이 되는 유용한 칼럼을 읽어보세요.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              바로가기 →
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

