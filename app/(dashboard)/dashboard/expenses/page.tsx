'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Expense } from '@/types/database'
import Link from 'next/link'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

type GroupedExpense = {
  date: string
  expenses: Expense[]
  total: number
}

const emotions = ['행복', '스트레스', '외로움', '지루함', '축하', '보상', '피곤', '불안']

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Map<string, Category>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'desire' | 'lack' | 'need'>('all')
  const [filterEmotion, setFilterEmotion] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [filterType, filterEmotion, dateRange])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')

      if (error) {
        console.error('카테고리 로드 오류:', error)
        return
      }

      const categoryMap = new Map<string, Category>()
      data?.forEach(cat => {
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

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }

      if (filterEmotion !== 'all') {
        query = query.contains('emotions', [filterEmotion])
      }

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
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      loadExpenses()
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

  const getDayNumber = (date: string) => {
    return new Date(date).getDate().toString()
  }

  // 날짜별로 그룹화
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = expense.date
    if (!acc[date]) {
      acc[date] = {
        date,
        expenses: [],
        total: 0,
      }
    }
    acc[date].expenses.push(expense)
    acc[date].total += expense.amount
    return acc
  }, {} as Record<string, GroupedExpense>)

  const groupedExpensesArray = Object.values(groupedExpenses).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const getCategoryInfo = (categoryName: string) => {
    return categories.get(categoryName) || { id: '', name: categoryName, icon: '📦', color: '#868E96' }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      need: '필요',
      desire: '욕망',
      lack: '결핍',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      need: '#339AF0',
      desire: '#FF6B9D',
      lack: '#FFD43B',
    }
    return colors[type] || '#868E96'
  }

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>지출 관리</h1>
          <Link
            href="/dashboard/expenses/new"
            className="px-6 py-3 bg-accent text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            + 지출 추가
          </Link>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                타입
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ color: '#111111' }}
              >
                <option value="all">전체</option>
                <option value="desire">욕망</option>
                <option value="lack">결핍</option>
                <option value="need">필요</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                감정
              </label>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ color: '#111111' }}
              >
                <option value="all">전체</option>
                {emotions.map((emotion) => (
                  <option key={emotion} value={emotion}>
                    {emotion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                기간
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="flex-1 px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent"
                  style={{ color: '#111111' }}
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="flex-1 px-4 py-2 border border-border rounded-input bg-bg focus:ring-2 focus:ring-accent focus:border-transparent"
                  style={{ color: '#111111' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 요약 섹션 */}
        <div className="mb-6">
          <div className="bg-surface rounded-lg border border-border p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>수입</p>
                <p className="text-2xl font-bold" style={{ color: '#339AF0' }}>0</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>지출</p>
                <p className="text-2xl font-bold" style={{ color: '#FF3B30' }}>{formatCurrency(totalExpense)}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>합계</p>
                <p className="text-2xl font-bold" style={{ color: '#111111' }}>{formatCurrency(-totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 지출 목록 */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8E8E93' }}>로딩 중...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>등록된 지출이 없습니다.</p>
              <Link
                href="/dashboard/expenses/new"
                className="text-sm text-accent hover:underline"
              >
                첫 지출을 추가해보세요
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedExpensesArray.map((group) => {
                const categoryInfo = getCategoryInfo(group.expenses[0]?.category || '')
                return (
                  <div key={group.date}>
                    {/* 날짜 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-bold" style={{ color: '#111111' }}>
                        {getDayNumber(group.date)}
                      </span>
                      <span 
                        className="px-2 py-1 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: '#339AF0' }}
                      >
                        {getDayOfWeek(group.date)}
                      </span>
                      <div className="flex-1 flex items-center justify-end gap-2">
                        <span className="text-sm" style={{ color: '#339AF0' }}>
                          {formatCurrency(group.total)}원
                        </span>
                        <span className="text-sm" style={{ color: '#FF3B30' }}>
                          0원
                        </span>
                      </div>
                    </div>

                    {/* 지출 항목 */}
                    <div className="space-y-3">
                      {group.expenses.map((expense) => {
                        const catInfo = getCategoryInfo(expense.category)
                        return (
                          <Link
                            key={expense.id}
                            href={`/dashboard/expenses/${expense.id}/edit`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-bg transition"
                          >
                            <div className="text-2xl">{catInfo.icon || '📦'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium" style={{ color: '#111111' }}>
                                  {expense.category}
                                </p>
                                <span 
                                  className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                                  style={{ backgroundColor: getTypeColor(expense.type) }}
                                >
                                  {getTypeLabel(expense.type)}
                                </span>
                              </div>
                              {expense.reason && (
                                <p className="text-xs truncate" style={{ color: '#8E8E93' }}>
                                  {expense.reason}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-base font-semibold" style={{ color: '#FF3B30' }}>
                                {formatCurrency(expense.amount)}원
                              </p>
                            </div>
                          </Link>
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
