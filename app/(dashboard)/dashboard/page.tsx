'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todayTotal, setTodayTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)
  const [typeData, setTypeData] = useState<{ name: string; value: number; color: string }[]>([])

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

        // 이번 달 지출 합계 및 타입별 집계
        const { data: monthExpenses } = await supabase
          .from('expenses')
          .select('amount, type')
          .eq('user_id', currentUser.id)
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth)

        const todaySum = todayExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0
        const monthSum = monthExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0

        // 타입별 집계
        const typeMap: Record<string, number> = { desire: 0, lack: 0, need: 0 }
        monthExpenses?.forEach((expense) => {
          if (expense.type in typeMap) {
            typeMap[expense.type] += expense.amount
          }
        })

        const typeChartData = [
          { name: '욕망', value: typeMap.desire, color: '#FF6B6B' }, // typeDesire
          { name: '결핍', value: typeMap.lack, color: '#FFD43B' }, // typeLack
          { name: '필요', value: typeMap.need, color: '#4C6EF5' }, // typeNeed
        ].filter(item => item.value > 0) // 값이 0인 항목 제외

        setTodayTotal(todaySum)
        setMonthTotal(monthSum)
        setTypeData(typeChartData)
      } catch (err) {
        console.error('데이터 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const budget = profile?.monthly_budget || 0
  const budgetUsage = budget > 0 ? Math.round((monthTotal / budget) * 100) : 0

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-bg p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">로딩 중...</p>
        </div>
      </main>
    )
  }

  // 이전 달 대비 변화율 계산 (간단한 예시)
  const previousMonthChange = 0 // TODO: 실제 데이터로 계산

  return (
    <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-5" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        {/* 헤더 섹션 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3" style={{ color: '#111111', letterSpacing: '-0.5px', lineHeight: '1.3' }}>
            안녕하세요, {profile?.name || user?.email?.split('@')[0] || '사용자'}님 👋
          </h1>
          <p className="text-sm md:text-base leading-relaxed mb-4 md:mb-6" style={{ color: '#8E8E93' }}>
            오늘도 소비 습관을 개선하는 하루를 시작해보세요
          </p>
          
          {/* 후킹 메시지 카드 */}
          <div className="hidden md:block card-toss p-4 md:p-7 mb-6 md:mb-8 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%)', color: '#FFFFFF' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'rgba(255, 255, 255, 0.3)', transform: 'translate(20%, -20%)' }}></div>
            <div className="relative z-10">
              <div className="flex items-start gap-3 md:gap-5">
                <div className="text-3xl md:text-4xl flex-shrink-0">💡</div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3" style={{ color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                    가계부 회고로 만드는 나만의 소비 습관
                  </h3>
                  <p className="text-xs md:text-sm leading-relaxed mb-4 md:mb-5" style={{ color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.6' }}>
                    단순 기록이 아닌 <strong style={{ fontWeight: '600' }}>욕망·결핍·필요</strong>로 분류하고, AI가 분석해주는 인사이트로 
                    진짜 필요한 소비만 하게 만드는 서비스입니다.
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-2.5">
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-semibold backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                      🎯 욕망·결핍·필요 구분
                    </span>
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-semibold backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                      🤖 AI 자동 분석
                    </span>
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-semibold backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                      📝 회고 기반 개선
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주요 통계 요약 */}
        <div className="mb-6 md:mb-10">
          <div className="stat-card p-4 md:p-7">
            <div className="grid grid-cols-3 gap-2 md:gap-8">
              <div className="text-center">
                <p className="text-xs mb-2 md:mb-4 font-semibold uppercase tracking-wider" style={{ color: '#8E8E93', letterSpacing: '0.5px' }}>오늘 지출</p>
                <p className="text-xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#111111', letterSpacing: '-0.8px' }}>
                  {formatCurrency(todayTotal)}
                </p>
                {todayTotal > 0 && (
                  <p className="text-xs font-medium" style={{ color: '#8E8E93' }}>어제 대비</p>
                )}
              </div>
              
              <div className="text-center border-l border-r" style={{ borderColor: '#F0F0F0' }}>
                <p className="text-xs mb-2 md:mb-4 font-semibold uppercase tracking-wider" style={{ color: '#8E8E93', letterSpacing: '0.5px' }}>이번 달</p>
                <p className="text-xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#111111', letterSpacing: '-0.8px' }}>
                  {formatCurrency(monthTotal)}
                </p>
                <p className="text-xs font-medium" style={{ color: '#8E8E93' }}>지난달 대비</p>
              </div>
              
              <div className="text-center">
                <p className="text-xs mb-2 md:mb-4 font-semibold uppercase tracking-wider" style={{ color: '#8E8E93', letterSpacing: '0.5px' }}>월 예산</p>
                <p className="text-xl md:text-3xl font-bold mb-2 md:mb-4" style={{ color: '#111111', letterSpacing: '-0.8px' }}>
                  {budget > 0 ? formatCurrency(budget) : '미설정'}
                </p>
                {budget > 0 && (
                  <div>
                    <div className="w-full rounded-full h-2.5 mb-2.5" style={{ background: '#F0F0F0' }}>
                      <div
                        className="h-2.5 rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${Math.min(budgetUsage, 100)}%`,
                          background: budgetUsage >= 100
                            ? 'linear-gradient(90deg, #FF6B6B 0%, #FF8787 100%)'
                            : budgetUsage >= 80
                            ? 'linear-gradient(90deg, #FFD43B 0%, #FFE066 100%)'
                            : 'linear-gradient(90deg, #4C6EF5 0%, #6B8AFF 100%)'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: budgetUsage >= 100 ? '#FF6B6B' : budgetUsage >= 80 ? '#FFD43B' : '#4C6EF5' }}>
                      {budgetUsage}% 사용
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-base md:text-lg font-semibold mb-1 md:mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>빠른 시작</h2>
          <p className="text-xs md:text-sm mb-4 md:mb-7" style={{ color: '#8E8E93' }}>자주 사용하는 기능</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Link
              href="/dashboard/expenses/new"
              className="card-toss p-5 md:p-7 flex flex-col items-center justify-center button-toss group relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%)', color: '#FFFFFF' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)' }}></div>
              <div className="icon-toss-accent mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10" style={{ background: 'rgba(255, 255, 255, 0.25)', width: '48px', height: '48px', fontSize: '24px' }}>💰</div>
              <p className="font-semibold text-xs md:text-sm relative z-10">지출 추가</p>
            </Link>

            <Link
              href="/dashboard/income/new"
              className="card-toss p-5 md:p-7 flex flex-col items-center justify-center button-toss group"
            >
              <div className="icon-toss mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" style={{ width: '48px', height: '48px', fontSize: '24px' }}>💵</div>
              <p className="font-semibold text-xs md:text-sm" style={{ color: '#111111' }}>수입 추가</p>
            </Link>

            <Link
              href="/dashboard/expenses"
              className="card-toss p-5 md:p-7 flex flex-col items-center justify-center button-toss group"
            >
              <div className="icon-toss mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" style={{ width: '48px', height: '48px', fontSize: '24px' }}>📊</div>
              <p className="font-semibold text-xs md:text-sm" style={{ color: '#111111' }}>가계부 보기</p>
            </Link>

            <Link
              href="/dashboard/statistics"
              className="card-toss p-5 md:p-7 flex flex-col items-center justify-center button-toss group"
            >
              <div className="icon-toss mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" style={{ width: '48px', height: '48px', fontSize: '24px' }}>📈</div>
              <p className="font-semibold text-xs md:text-sm" style={{ color: '#111111' }}>통계 보기</p>
            </Link>
          </div>
        </div>

        {/* 타입별 분석 */}
        {typeData.length > 0 ? (
          <div className="mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold mb-1" style={{ color: '#111111', letterSpacing: '-0.3px' }}>이번 달 지출 타입 분석</h2>
            <p className="text-xs md:text-sm mb-4 md:mb-6" style={{ color: '#8E8E93' }}>욕망·결핍·필요로 분류된 지출을 AI가 분석했습니다</p>
            <div className="card-toss p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="w-full md:w-1/2 max-w-xs">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          background: '#FFFFFF',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-2 md:space-y-3">
                  {typeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-4 md:p-5 rounded-2xl hover:bg-opacity-90 transition-all duration-200 group" style={{ background: '#F7F7F8' }}>
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-md group-hover:scale-110 transition-transform flex-shrink-0" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-sm md:text-base block mb-0.5 md:mb-1" style={{ color: '#111111' }}>{item.name}</span>
                          <span className="text-xs font-medium" style={{ color: '#8E8E93' }}>
                            {item.name === '욕망' && '순간적 충동으로 인한 지출'}
                            {item.name === '결핍' && '감정적 보상으로 인한 지출'}
                            {item.name === '필요' && '실제 필요한 지출'}
                          </span>
                        </div>
                      </div>
                      <span className="text-base md:text-xl font-bold flex-shrink-0 ml-2" style={{ color: '#111111', letterSpacing: '-0.5px' }}>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI 인사이트 */}
              <div className="mt-5 md:mt-7 pt-5 md:pt-7 border-t" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #F7F7F8 0%, #FFFFFF 100%)' }}>
                  <div className="text-xl md:text-2xl flex-shrink-0">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <h4 className="font-semibold text-sm md:text-base" style={{ color: '#111111' }}>AI 인사이트</h4>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0" style={{ background: '#2864FF', color: '#FFFFFF' }}>NEW</span>
                    </div>
                    {typeData.length > 0 && (() => {
                      const maxType = typeData.reduce((prev, current) => (prev.value > current.value) ? prev : current)
                      const insights: Record<string, string> = {
                        '욕망': '이번 달 욕망 지출이 가장 많습니다. 회고를 통해 충동구매 패턴을 파악하고 개선해보세요.',
                        '결핍': '이번 달 결핍 지출이 가장 많습니다. 감정적 보상 소비를 줄이기 위한 회고를 작성해보세요.',
                        '필요': '이번 달 필요 지출이 가장 많습니다. 건강한 소비 패턴을 유지하고 있습니다.'
                      }
                      return (
                        <p className="text-xs md:text-sm leading-relaxed" style={{ color: '#565656', lineHeight: '1.7' }}>
                          {insights[maxType.name] || '지출 패턴을 분석하여 회고를 작성하면 더 나은 소비 습관을 만들 수 있습니다.'}
                        </p>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold mb-1" style={{ color: '#111111', letterSpacing: '-0.3px' }}>지출 타입 분석</h2>
            <p className="text-xs md:text-sm mb-4 md:mb-6" style={{ color: '#8E8E93' }}>욕망·결핍·필요로 분류된 지출을 AI가 분석합니다</p>
            <div className="card-toss p-6 md:p-8 text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">📊</div>
              <p className="text-sm md:text-base font-medium mb-2" style={{ color: '#111111' }}>아직 지출 기록이 없습니다</p>
              <p className="text-xs md:text-sm mb-4 md:mb-6 px-2" style={{ color: '#8E8E93' }}>
                지출을 기록하면 <strong>욕망·결핍·필요</strong>로 자동 분류되고<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>AI가 소비 패턴을 분석해드립니다
              </p>
              <Link
                href="/dashboard/expenses/new"
                className="inline-block px-5 py-2.5 md:px-6 md:py-3 rounded-2xl font-semibold text-xs md:text-sm transition-all"
                style={{ background: '#2864FF', color: '#FFFFFF' }}
              >
                첫 지출 기록하기
              </Link>
            </div>
          </div>
        )}

        {/* 회고 CTA */}
        <div className="mb-6 md:mb-10">
          <div className="card-toss p-5 md:p-7" style={{ background: 'linear-gradient(135deg, #F7F7F8 0%, #FFFFFF 100%)', border: '2px solid #E6E6E7' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-start gap-3 md:gap-5 flex-1 min-w-0">
                <div className="text-3xl md:text-4xl flex-shrink-0">📝</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>회고로 소비 습관 개선하기</h3>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: '#8E8E93', lineHeight: '1.6' }}>
                    지출 패턴을 회고하고 다음 달 더 나은 소비 계획을 세워보세요
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/retrospectives"
                className="px-5 py-2.5 md:px-6 md:py-3 rounded-2xl font-semibold text-xs md:text-sm transition-all button-toss flex-shrink-0 w-full md:w-auto text-center"
                style={{ background: '#111111', color: '#FFFFFF' }}
              >
                회고 작성하기
              </Link>
            </div>
          </div>
        </div>

        {/* 추가 기능 링크 */}
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-1" style={{ color: '#111111', letterSpacing: '-0.3px' }}>더 많은 기능</h2>
          <p className="text-xs md:text-sm mb-4 md:mb-6" style={{ color: '#8E8E93' }}>다양한 기능을 활용해보세요</p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href="/dashboard/challenges"
              className="card-toss px-5 py-2.5 md:px-6 md:py-3.5 button-toss inline-flex items-center"
            >
              <span className="font-semibold text-xs md:text-sm" style={{ color: '#111111' }}>챌린지</span>
            </Link>
            <Link
              href="/dashboard/articles"
              className="card-toss px-5 py-2.5 md:px-6 md:py-3.5 button-toss inline-flex items-center"
            >
              <span className="font-semibold text-xs md:text-sm" style={{ color: '#111111' }}>칼럼</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

