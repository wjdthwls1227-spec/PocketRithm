'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Income } from '@/types/database'
import Link from 'next/link'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

type GroupedIncome = {
  date: string
  incomes: Income[]
  total: number
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<Map<string, Category>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    const loadAll = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 카테고리, 수입, 지출을 병렬로 로드
      await Promise.all([
        loadCategories(supabase, user.id),
        loadIncomes(supabase, user.id),
        loadExpenses(supabase, user.id)
      ])
    }
    
    loadAll()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 수입과 지출을 병렬로 로드
      await Promise.all([
        loadIncomes(supabase, user.id),
        loadExpenses(supabase, user.id)
      ])
    }
    
    loadData()
  }, [filterCategory, dateRange])

  const loadCategories = async (supabase: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('id, name, icon, color')
        .eq('user_id', userId)
        .eq('type', 'income')

      if (error) {
        console.error('카테고리 로드 오류:', error)
        return
      }

      const categoryMap = new Map<string, Category>()
      data?.forEach((cat: { id: string; name: string; icon: string | null; color: string | null }) => {
        categoryMap.set(cat.name, {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
      })
      setCategories(categoryMap)
    } catch (err) {
      console.error('카테고리 로드 오류:', err)
    }
  }

  const loadIncomes = async (supabase: any, userId: string) => {
    try {
      setLoading(true)

      let query = supabase
        .from('incomes')
        .select('id, amount, source, memo, date, created_at')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filterCategory !== 'all') {
        query = query.eq('source', filterCategory)
      }

      if (dateRange.start) {
        query = query.gte('date', dateRange.start)
      }

      if (dateRange.end) {
        query = query.lte('date', dateRange.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('수입 로드 오류:', error)
        return
      }

      setIncomes(data || [])
    } catch (err) {
      console.error('수입 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadExpenses = async (supabase: any, userId: string) => {
    try {
      let query = supabase
        .from('expenses')
        .select('id, amount, category, type, date')
        .eq('user_id', userId)

      if (dateRange.start) {
        query = query.gte('date', dateRange.start)
      }

      if (dateRange.end) {
        query = query.lte('date', dateRange.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('지출 로드 오류:', error)
        return
      }

      setExpenses(data || [])
    } catch (err) {
      console.error('지출 로드 오류:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      // 삭제 후 데이터 다시 로드
      await Promise.all([
        loadIncomes(supabase, user.id),
        loadExpenses(supabase, user.id)
      ])
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })
  }

  const getDayOfWeek = (date: string) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    return days[new Date(date).getDay()]
  }

  const getMonthAndDay = (date: string) => {
    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${month}월 ${day}일`
  }

  // 날짜별로 그룹화
  const groupedIncomes = incomes.reduce((acc, income) => {
    const date = income.date
    if (!acc[date]) {
      acc[date] = {
        date,
        incomes: [],
        total: 0,
      }
    }
    acc[date].incomes.push(income)
    acc[date].total += income.amount
    return acc
  }, {} as Record<string, GroupedIncome>)

  const groupedIncomesArray = Object.values(groupedIncomes).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const getCategoryInfo = (categoryName: string) => {
    return categories.get(categoryName) || { id: '', name: categoryName, icon: '💰', color: '#51CF66' }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111111' }}>수입 관리</h1>
          <Link
            href="/dashboard/income/new"
            className="px-4 py-2 md:px-6 md:py-3 bg-accent text-white rounded-lg hover:opacity-90 transition font-semibold text-sm md:text-base whitespace-nowrap"
          >
            + 수입 추가
          </Link>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6 overflow-x-hidden">
          <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#111111' }}>필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                카테고리
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-10 px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ color: '#111111' }}
              >
                <option value="all">전체</option>
                {Array.from(categories.values()).map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                기간
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="flex-1 h-10 min-w-0 px-2 md:px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  style={{ color: '#111111', fontSize: '16px' }}
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="flex-1 h-10 min-w-0 px-2 md:px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  style={{ color: '#111111', fontSize: '16px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 요약 섹션 */}
        <div className="mb-4 md:mb-6">
          <div className="bg-surface rounded-lg border border-border p-4 md:p-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div>
                <p className="text-xs md:text-sm mb-1" style={{ color: '#8E8E93' }}>수입</p>
                <p className="text-lg md:text-2xl font-bold" style={{ color: '#339AF0' }}>{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm mb-1" style={{ color: '#8E8E93' }}>지출</p>
                <p className="text-lg md:text-2xl font-bold" style={{ color: '#C92A2A' }}>{formatCurrency(totalExpense)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm mb-1" style={{ color: '#8E8E93' }}>합계</p>
                <p className="text-lg md:text-2xl font-bold" style={{ color: '#111111' }}>{formatCurrency(totalIncome - totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 수입 목록 */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8E8E93' }}>로딩 중...</p>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>등록된 수입이 없습니다.</p>
              <Link
                href="/dashboard/income/new"
                className="text-sm text-accent hover:underline"
              >
                첫 수입을 추가해보세요
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedIncomesArray.map((group) => {
                const categoryInfo = getCategoryInfo(group.incomes[0]?.source || '')
                return (
                  <div key={group.date}>
                    {/* 날짜 헤더 */}
                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                      <span className="text-xl md:text-2xl font-bold" style={{ color: '#111111' }}>
                        {getMonthAndDay(group.date)}
                      </span>
                      <span 
                        className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: '#339AF0' }}
                      >
                        {getDayOfWeek(group.date)}
                      </span>
                      <div className="flex-1 flex items-center justify-end gap-1 md:gap-2">
                        <span className="text-xs md:text-sm font-semibold" style={{ color: '#339AF0' }}>
                          {formatCurrency(group.total)}원
                        </span>
                      </div>
                    </div>

                    {/* 수입 항목 */}
                    <div className="space-y-2 md:space-y-3">
                      {group.incomes.map((income) => {
                        const catInfo = getCategoryInfo(income.source)
                        return (
                          <div
                            key={income.id}
                            className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-surface hover:bg-bg transition group"
                          >
                            <Link
                              href={`/dashboard/income/${income.id}/edit`}
                              className="flex items-center gap-2 md:gap-3 flex-1 min-w-0"
                            >
                              <div className="text-xl md:text-2xl flex-shrink-0">{catInfo.icon || '💰'}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium mb-0.5" style={{ color: '#111111' }}>
                                  {income.source}
                                </p>
                                {income.memo && (
                                  <p className="text-xs truncate" style={{ color: '#8E8E93' }}>
                                    {income.memo}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm md:text-base font-semibold" style={{ color: '#339AF0' }}>
                                  {formatCurrency(income.amount)}원
                                </p>
                              </div>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete(income.id)
                              }}
                              className="ml-2 p-1.5 md:p-2 rounded-lg hover:bg-red-50 transition opacity-70 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                              style={{ color: '#FF3B30' }}
                              title="삭제"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
