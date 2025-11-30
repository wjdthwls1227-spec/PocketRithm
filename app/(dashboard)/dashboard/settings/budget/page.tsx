'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  getCurrentMonth, 
  getMonthlyBudget, 
  getCurrentMonthIncome,
  getMonthIncome,
  getAllCategoryMonthlyBudgets 
} from '@/lib/budget'

export default function BudgetPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  // 월별 예산 관련 상태
  const [selectedMonth, setSelectedMonth] = useState('')
  const [currentMonthBudget, setCurrentMonthBudget] = useState<number | null>(null)
  const [selectedMonthIncome, setSelectedMonthIncome] = useState(0)
  const [suggestedBudget, setSuggestedBudget] = useState(0)
  const [savingMonthlyBudget, setSavingMonthlyBudget] = useState(false)
  
  // 카테고리별 예산 관련 상태
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({})
  const [savingCategoryBudgets, setSavingCategoryBudgets] = useState(false)
  const [categoryRatios, setCategoryRatios] = useState<Record<string, string>>({})
  const [showRatioSettings, setShowRatioSettings] = useState(false)

  // 선택 가능한 월 목록 생성 (최근 12개월)
  const getAvailableMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      months.push({
        value: `${year}-${month}`,
        label: `${year}년 ${parseInt(month)}월`
      })
    }
    return months
  }

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
        setMonthlyBudget(profileData?.monthly_budget?.toString() || '')
        
        // 현재 월을 기본값으로 설정
        const currentMonth = getCurrentMonth()
        setSelectedMonth(currentMonth)
        
        // 현재 월 예산 조회
        const monthBudget = await getMonthlyBudget(supabase, currentUser.id, currentMonth)
        const defaultBudget = profileData?.monthly_budget || 0
        setCurrentMonthBudget(monthBudget !== defaultBudget ? monthBudget : null)
        
        // 선택된 월의 수입 조회
        const income = await getMonthIncome(supabase, currentUser.id, currentMonth)
        setSelectedMonthIncome(income)
        setSuggestedBudget(Math.round(income * 0.8))
        
        // 지출 카테고리 로드
        const { data: categories } = await supabase
          .from('user_categories')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('type', 'expense')
          .order('order_index', { ascending: true })
        
        if (categories) {
          setExpenseCategories(categories)
          
          // 카테고리별 예산 로드
          const budgets = await getAllCategoryMonthlyBudgets(supabase, currentUser.id, currentMonth)
          const budgetMap: Record<string, string> = {}
          categories.forEach((cat: any) => {
            budgetMap[cat.id] = budgets[cat.id]?.toString() || ''
          })
          setCategoryBudgets(budgetMap)
        }
      } catch (err) {
        console.error('사용자 정보 로드 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  // 월 변경 시 데이터 다시 로드
  useEffect(() => {
    if (!selectedMonth || !user) return

    async function loadMonthData() {
      try {
        const supabase = createClient()
        
        // 선택된 월의 예산 조회
        const monthBudget = await getMonthlyBudget(supabase, user.id, selectedMonth)
        const defaultBudget = profile?.monthly_budget || 0
        setCurrentMonthBudget(monthBudget !== defaultBudget ? monthBudget : null)
        
        // 선택된 월의 수입 조회
        const income = await getMonthIncome(supabase, user.id, selectedMonth)
        setSelectedMonthIncome(income)
        setSuggestedBudget(Math.round(income * 0.8))
        
        // 카테고리별 예산 로드
        if (expenseCategories.length > 0) {
          const budgets = await getAllCategoryMonthlyBudgets(supabase, user.id, selectedMonth)
          const budgetMap: Record<string, string> = {}
          expenseCategories.forEach((cat: any) => {
            budgetMap[cat.id] = budgets[cat.id]?.toString() || ''
          })
          setCategoryBudgets(budgetMap)
        }
      } catch (err) {
        console.error('월별 데이터 로드 오류:', err)
      }
    }

    loadMonthData()
  }, [selectedMonth, user, profile, expenseCategories])

  const handleSaveBudget = async () => {
    setSaving(true)
    setSaveMessage(null)

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      const budgetValue = monthlyBudget.trim() ? parseInt(monthlyBudget.replace(/[^0-9]/g, '')) : null

      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_budget: budgetValue,
        })
        .eq('id', currentUser.id)

      if (error) {
        console.error('월 예산 저장 오류:', error)
        setSaveMessage('월 예산 저장 중 오류가 발생했습니다.')
        return
      }

      setSaveMessage('기본 예산이 저장되었습니다.')
      setProfile({ ...profile, monthly_budget: budgetValue })
      
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (err) {
      console.error('월 예산 저장 오류:', err)
      setSaveMessage('월 예산 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const handleBudgetChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setMonthlyBudget(numericValue)
  }

  // 월별 예산 저장
  const handleSaveMonthlyBudget = async () => {
    if (!selectedMonth) return
    
    setSavingMonthlyBudget(true)
    setSaveMessage(null)

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      const budgetValue = currentMonthBudget !== null 
        ? currentMonthBudget 
        : parseInt(monthlyBudget.replace(/[^0-9]/g, '')) || 0
      
      const defaultBudget = profile?.monthly_budget || 0

      if (budgetValue === defaultBudget) {
        const { error } = await supabase
          .from('monthly_budgets')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('month', selectedMonth)

        if (error) {
          console.error('월별 예산 삭제 오류:', error)
          setSaveMessage('월별 예산 삭제 중 오류가 발생했습니다.')
          return
        }

        setSaveMessage('기본 예산을 사용하도록 변경되었습니다.')
        setCurrentMonthBudget(null)
      } else {
        const { error } = await supabase
          .from('monthly_budgets')
          .upsert({
            user_id: currentUser.id,
            month: selectedMonth,
            total_budget: budgetValue,
          }, {
            onConflict: 'user_id,month'
          })

        if (error) {
          console.error('월별 예산 저장 오류:', error)
          setSaveMessage('월별 예산 저장 중 오류가 발생했습니다.')
          return
        }

        setSaveMessage('월별 예산이 저장되었습니다.')
        setCurrentMonthBudget(budgetValue)
      }
      
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (err) {
      console.error('월별 예산 저장 오류:', err)
      setSaveMessage('월별 예산 저장 중 오류가 발생했습니다.')
    } finally {
      setSavingMonthlyBudget(false)
    }
  }

  // 수입 기반 예산 제안 적용
  const handleApplySuggestedBudget = () => {
    const budgetValue = suggestedBudget
    setCurrentMonthBudget(budgetValue)
    setMonthlyBudget(budgetValue.toString())
  }

  // 카테고리별 예산 저장
  const handleSaveCategoryBudgets = async () => {
    if (!selectedMonth) return
    
    setSavingCategoryBudgets(true)
    setSaveMessage(null)

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      const updates = Object.entries(categoryBudgets)
        .filter(([_, budget]) => budget.trim() !== '')
        .map(([categoryId, budget]) => ({
          user_id: currentUser.id,
          category_id: categoryId,
          month: selectedMonth,
          budget: parseInt(budget.replace(/[^0-9]/g, '')) || 0,
        }))

      if (updates.length > 0) {
        const { error } = await supabase
          .from('category_monthly_budgets')
          .upsert(updates, {
            onConflict: 'user_id,category_id,month'
          })

        if (error) {
          console.error('카테고리별 예산 저장 오류:', error)
          setSaveMessage('카테고리별 예산 저장 중 오류가 발생했습니다.')
          return
        }
      }

      setSaveMessage('카테고리별 예산이 저장되었습니다.')
      
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (err) {
      console.error('카테고리별 예산 저장 오류:', err)
      setSaveMessage('카테고리별 예산 저장 중 오류가 발생했습니다.')
    } finally {
      setSavingCategoryBudgets(false)
    }
  }

  // 비율로 자동 배분
  const handleAutoDistribute = () => {
    const totalBudget = currentMonthBudget !== null ? currentMonthBudget : parseInt(monthlyBudget.replace(/[^0-9]/g, '') || '0')
    if (totalBudget === 0) return

    // 사용자가 설정한 비율 사용
    const newBudgets: Record<string, string> = { ...categoryBudgets }
    let totalRatio = 0
    const ratiosWithValues: Array<{ id: string; ratio: number }> = []

    expenseCategories.forEach((cat) => {
      const ratioStr = categoryRatios[cat.id] || '0'
      const ratio = parseFloat(ratioStr) / 100 // 퍼센트를 소수로 변환
      if (ratio > 0) {
        totalRatio += ratio
        ratiosWithValues.push({ id: cat.id, ratio })
      }
    })

    // 비율이 설정되지 않았거나 합계가 0이면 기본 비율 사용
    if (totalRatio === 0) {
      const defaultRatios: Record<string, number> = {
        '식비': 0.30,
        '교통비': 0.15,
        '쇼핑': 0.10,
      }
      
      let remainingRatio = 1
      expenseCategories.forEach((cat) => {
        const ratio = defaultRatios[cat.name] || 0
        if (ratio > 0) {
          newBudgets[cat.id] = Math.round(totalBudget * ratio).toString()
          remainingRatio -= ratio
        }
      })

      const otherCategories = expenseCategories.filter(cat => !defaultRatios[cat.name])
      if (otherCategories.length > 0 && remainingRatio > 0) {
        const perCategory = remainingRatio / otherCategories.length
        otherCategories.forEach((cat) => {
          newBudgets[cat.id] = Math.round(totalBudget * perCategory).toString()
        })
      }
    } else {
      // 설정된 비율로 배분 (비율 합계가 100%가 아니면 정규화)
      const normalizeRatio = totalRatio > 1 ? 1 / totalRatio : 1
      
      ratiosWithValues.forEach(({ id, ratio }) => {
        newBudgets[id] = Math.round(totalBudget * ratio * normalizeRatio).toString()
      })

      // 비율이 설정되지 않은 카테고리는 0으로
      expenseCategories.forEach((cat) => {
        if (!categoryRatios[cat.id] || parseFloat(categoryRatios[cat.id] || '0') === 0) {
          if (!newBudgets[cat.id]) {
            newBudgets[cat.id] = '0'
          }
        }
      })
    }

    setCategoryBudgets(newBudgets)
  }

  // 비율 합계 계산
  const getTotalRatio = () => {
    return Object.values(categoryRatios).reduce((sum, ratio) => {
      return sum + (parseFloat(ratio || '0') || 0)
    }, 0)
  }

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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/settings"
              className="text-accent hover:opacity-80 transition"
            >
              ← 뒤로
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            예산 관리
          </h1>
          <p className="text-xs md:text-sm" style={{ color: '#8E8E93' }}>
            기본 예산, 월별 예산, 카테고리별 예산을 설정하고 관리하세요
          </p>
        </div>

        {/* 이번 달 수입 & 권장 예산 */}
        {selectedMonthIncome > 0 && (
          <div className="card-toss p-4 md:p-7 mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>수입 & 권장 예산</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: '#0369A1' }}>수입</span>
                  <span className="text-base sm:text-lg font-semibold" style={{ color: '#0369A1' }}>
                    {formatCurrency(selectedMonthIncome)}원
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: '#0369A1' }}>권장 예산 (수입의 80%)</span>
                  <span className="text-base sm:text-lg font-semibold" style={{ color: '#0369A1' }}>
                    {formatCurrency(suggestedBudget)}원
                  </span>
                </div>
                <button
                  onClick={handleApplySuggestedBudget}
                  className="w-full mt-3 px-4 py-2 bg-accent text-white rounded-button font-semibold text-sm hover:opacity-90 transition"
                >
                  권장 예산으로 설정하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 기본 월 예산 설정 */}
        <div className="card-toss p-4 md:p-7 mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>기본 월 예산 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#565656' }}>
                기본 월 예산 (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={monthlyBudget ? formatCurrency(parseInt(monthlyBudget.replace(/[^0-9]/g, '') || '0')) : ''}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 md:py-3 border border-border rounded-input bg-surface text-right font-semibold text-sm md:text-base"
                  placeholder="예: 500000"
                  style={{ color: '#111111' }}
                />
                <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-semibold pointer-events-none whitespace-nowrap text-xs md:text-sm" style={{ color: '#8E8E93' }}>
                  원
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8E8E93' }}>
                기본 예산은 월별 예산이 설정되지 않은 모든 월에 적용됩니다
              </p>
            </div>
            {saveMessage && (
              <div className={`p-3 rounded-lg text-xs md:text-sm ${
                saveMessage.includes('저장되었습니다') || saveMessage.includes('변경되었습니다')
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {saveMessage}
              </div>
            )}
            <button
              onClick={handleSaveBudget}
              disabled={saving}
              className="w-full md:w-auto px-6 py-2.5 md:py-3 bg-accent text-white rounded-button font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '기본 예산 저장'}
            </button>
          </div>
        </div>

        {/* 월별 예산 설정 */}
        <div className="card-toss p-4 md:p-7 mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>월별 예산 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#565656' }}>
                월 선택
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2.5 md:py-3 border border-border rounded-input bg-surface font-semibold text-sm md:text-base"
                style={{ color: '#111111' }}
              >
                {getAvailableMonths().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#565656' }}>
                {selectedMonth ? `${selectedMonth.split('-')[0]}년 ${parseInt(selectedMonth.split('-')[1])}월 예산` : '예산'} (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentMonthBudget !== null ? formatCurrency(currentMonthBudget) : (monthlyBudget ? formatCurrency(parseInt(monthlyBudget.replace(/[^0-9]/g, '') || '0')) : '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setCurrentMonthBudget(value ? parseInt(value) : null)
                    setMonthlyBudget(value)
                  }}
                  className="w-full pl-4 pr-12 py-2.5 md:py-3 border border-border rounded-input bg-surface text-right font-semibold text-sm md:text-base"
                  placeholder="예: 500000"
                  style={{ color: '#111111' }}
                />
                <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-semibold pointer-events-none whitespace-nowrap text-xs md:text-sm" style={{ color: '#8E8E93' }}>
                  원
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8E8E93' }}>
                {currentMonthBudget !== null 
                  ? '해당 월 전용 예산이 설정되어 있습니다' 
                  : '기본 예산을 사용 중입니다'}
              </p>
            </div>
            <button
              onClick={handleSaveMonthlyBudget}
              disabled={savingMonthlyBudget}
              className="w-full md:w-auto px-6 py-2.5 md:py-3 bg-accent text-white rounded-button font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingMonthlyBudget ? '저장 중...' : '월별 예산 저장'}
            </button>
          </div>
        </div>

        {/* 카테고리별 예산 배분 */}
        {expenseCategories.length > 0 && (
          <div className="card-toss p-4 md:p-7 mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-4" style={{ color: '#111111' }}>카테고리별 예산 배분</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs md:text-sm font-medium mb-1" style={{ color: '#565656' }}>
                    {selectedMonth ? `${selectedMonth.split('-')[0]}년 ${parseInt(selectedMonth.split('-')[1])}월` : '선택된 월'}
                  </p>
                  <p className="text-xs md:text-sm" style={{ color: '#8E8E93' }}>
                    전체 예산: {formatCurrency(currentMonthBudget !== null ? currentMonthBudget : parseInt(monthlyBudget.replace(/[^0-9]/g, '') || '0'))}원
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRatioSettings(!showRatioSettings)}
                    className="px-4 py-2 text-xs md:text-sm bg-accent/10 text-accent rounded-button font-semibold hover:bg-accent/20 transition"
                  >
                    {showRatioSettings ? '비율 설정 닫기' : '비율 설정'}
                  </button>
                  <button
                    onClick={handleAutoDistribute}
                    className="px-4 py-2 text-xs md:text-sm bg-accent text-white rounded-button font-semibold hover:opacity-90 transition"
                  >
                    비율로 자동 배분
                  </button>
                </div>
              </div>

              {/* 비율 설정 섹션 */}
              {showRatioSettings && (
                <div className="p-4 rounded-lg border border-border mb-4" style={{ background: '#F9FAFB' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: '#111111' }}>비율 설정 (%)</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-medium whitespace-nowrap" style={{ color: getTotalRatio() === 100 ? '#34C759' : getTotalRatio() > 100 ? '#FF3B30' : '#8E8E93' }}>
                        합계: {getTotalRatio().toFixed(1)}%
                      </span>
                      {getTotalRatio() !== 100 && (
                        <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#FF3B30' }}>
                          {getTotalRatio() < 100 ? `(부족: ${(100 - getTotalRatio()).toFixed(1)}%)` : `(초과: ${(getTotalRatio() - 100).toFixed(1)}%)`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {expenseCategories.map((category) => {
                      const ratio = categoryRatios[category.id] || ''
                      return (
                        <div key={category.id} className="flex flex-col gap-1.5 min-w-0">
                          <label className="text-xs font-medium flex items-center gap-1 min-w-0" style={{ color: '#565656' }}>
                            <span className="flex-shrink-0">{category.icon || '📦'}</span>
                            <span className="truncate block min-w-0">{category.name}</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={ratio}
                              onChange={(e) => {
                                const value = e.target.value
                                setCategoryRatios({ ...categoryRatios, [category.id]: value })
                              }}
                              className="w-full pl-2 pr-8 py-1.5 border border-border rounded-input bg-surface text-right font-semibold text-sm"
                              placeholder="0"
                              style={{ color: '#111111' }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none whitespace-nowrap" style={{ color: '#8E8E93' }}>
                              %
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs mt-3" style={{ color: '#8E8E93' }}>
                    각 카테고리별 비율을 설정한 후 "비율로 자동 배분" 버튼을 클릭하세요
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenseCategories.map((category) => {
                  const budget = categoryBudgets[category.id] || ''
                  const budgetNum = parseInt(budget.replace(/[^0-9]/g, '') || '0')
                  const totalBudget = currentMonthBudget !== null ? currentMonthBudget : parseInt(monthlyBudget.replace(/[^0-9]/g, '') || '0')
                  const percentage = totalBudget > 0 ? Math.round((budgetNum / totalBudget) * 100) : 0
                  
                  return (
                    <div key={category.id} className="p-3 md:p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-lg md:text-xl flex-shrink-0">{category.icon || '📦'}</span>
                          <span className="font-semibold text-sm md:text-base truncate" style={{ color: '#111111' }}>{category.name}</span>
                        </div>
                        <span className="text-xs md:text-sm flex-shrink-0 ml-2" style={{ color: '#8E8E93' }}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={budget ? formatCurrency(budgetNum) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            setCategoryBudgets({ ...categoryBudgets, [category.id]: value })
                          }}
                          className="flex-1 px-3 py-2 border border-border rounded-input bg-surface text-right font-semibold text-sm"
                          placeholder="0"
                          style={{ color: '#111111' }}
                        />
                        <span className="text-xs md:text-sm font-medium flex-shrink-0" style={{ color: '#8E8E93' }}>원</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={handleSaveCategoryBudgets}
                disabled={savingCategoryBudgets}
                className="w-full px-6 py-2.5 md:py-3 bg-accent text-white rounded-button font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingCategoryBudgets ? '저장 중...' : '카테고리별 예산 저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

