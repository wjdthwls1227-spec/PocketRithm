'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Expense, Income } from '@/types/database'
import Link from 'next/link'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

type Transaction = {
  id: string
  type: 'expense' | 'income'
  amount: number
  category: string
  title: string
  date: string
  expenseType?: 'need' | 'desire' | 'lack'
}

type GroupedTransaction = {
  date: string
  transactions: Transaction[]
  incomeTotal: number
  expenseTotal: number
}

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Map<string, Category>>(new Map())
  const [incomeCategories, setIncomeCategories] = useState<Map<string, Category>>(new Map())
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [dateRange])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 지출 카테고리
      const { data: expenseCats } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')

      const expenseMap = new Map<string, Category>()
      expenseCats?.forEach(cat => {
        expenseMap.set(cat.name, {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
      })
      setExpenseCategories(expenseMap)

      // 수입 카테고리
      const { data: incomeCats } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')

      const incomeMap = new Map<string, Category>()
      incomeCats?.forEach(cat => {
        incomeMap.set(cat.name, {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
      })
      setIncomeCategories(incomeMap)
    } catch (err) {
      console.error('카테고리 로드 오류:', err)
    }
  }

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // 지출과 수입 쿼리 준비
      let expenseQuery = supabase
        .from('expenses')
        .select('id, amount, category, type, reason, date, created_at')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      let incomeQuery = supabase
        .from('incomes')
        .select('id, amount, source, memo, date, created_at')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (dateRange.start) {
        expenseQuery = expenseQuery.gte('date', dateRange.start)
        incomeQuery = incomeQuery.gte('date', dateRange.start)
      }
      if (dateRange.end) {
        expenseQuery = expenseQuery.lte('date', dateRange.end)
        incomeQuery = incomeQuery.lte('date', dateRange.end)
      }

      // 병렬로 실행
      const [expenseResult, incomeResult] = await Promise.all([
        expenseQuery,
        incomeQuery
      ])

      if (expenseResult.error) {
        console.error('지출 로드 오류:', expenseResult.error)
      } else {
        setExpenses(expenseResult.data || [])
      }

      if (incomeResult.error) {
        console.error('수입 로드 오류:', incomeResult.error)
      } else {
        setIncomes(incomeResult.data || [])
      }
    } catch (err) {
      console.error('거래 내역 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
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

      loadTransactions()
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      loadTransactions()
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
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

  const getCategoryInfo = (categoryName: string, type: 'expense' | 'income') => {
    const categoryMap = type === 'expense' ? expenseCategories : incomeCategories
    return categoryMap.get(categoryName) || { 
      id: '', 
      name: categoryName, 
      icon: type === 'expense' ? '📦' : '💰', 
      color: type === 'expense' ? '#868E96' : '#51CF66' 
    }
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

  // 지출과 수입을 하나의 배열로 합치고 날짜별로 그룹화
  const allTransactions: Transaction[] = [
    ...expenses.map(expense => ({
      id: expense.id,
      type: 'expense' as const,
      amount: expense.amount,
      category: expense.category,
      title: expense.reason || '',
      date: expense.date,
      expenseType: expense.type,
    })),
    ...incomes.map(income => ({
      id: income.id,
      type: 'income' as const,
      amount: income.amount,
      category: income.source,
      title: income.memo || '',
      date: income.date,
    })),
  ]

  const groupedTransactions = allTransactions.reduce((acc, transaction) => {
    const date = transaction.date
    if (!acc[date]) {
      acc[date] = {
        date,
        transactions: [],
        incomeTotal: 0,
        expenseTotal: 0,
      }
    }
    acc[date].transactions.push(transaction)
    if (transaction.type === 'income') {
      acc[date].incomeTotal += transaction.amount
    } else {
      acc[date].expenseTotal += transaction.amount
    }
    return acc
  }, {} as Record<string, GroupedTransaction>)

  const groupedTransactionsArray = Object.values(groupedTransactions).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="min-h-screen bg-bg px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111111' }}>거래 내역</h1>
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/expenses/new"
              className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-xs md:text-sm text-center"
            >
              + 지출
            </Link>
            <Link
              href="/dashboard/income/new"
              className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-xs md:text-sm text-center"
            >
              + 수입
            </Link>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6 overflow-x-hidden">
          <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#111111' }}>필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
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
                <p className="text-lg md:text-2xl font-bold" style={{ color: '#111111' }}>
                  {formatCurrency(totalIncome - totalExpense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 거래 내역 목록 */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8E8E93' }}>로딩 중...</p>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>등록된 거래 내역이 없습니다.</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/dashboard/expenses/new"
                  className="text-sm text-accent hover:underline"
                >
                  첫 지출 추가
                </Link>
                <span className="text-sm" style={{ color: '#8E8E93' }}>|</span>
                <Link
                  href="/dashboard/income/new"
                  className="text-sm text-accent hover:underline"
                >
                  첫 수입 추가
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTransactionsArray.map((group) => (
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
                        {formatCurrency(group.incomeTotal)}원
                      </span>
                      <span className="text-xs md:text-sm font-semibold" style={{ color: '#C92A2A' }}>
                        {formatCurrency(group.expenseTotal)}원
                      </span>
                    </div>
                  </div>

                  {/* 거래 항목 */}
                  <div className="space-y-2 md:space-y-3">
                    {group.transactions.map((transaction) => {
                      const catInfo = getCategoryInfo(transaction.category, transaction.type)
                      const isExpense = transaction.type === 'expense'
                      
                      return (
                        <div
                          key={`${transaction.type}-${transaction.id}`}
                          className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-surface hover:bg-bg transition group"
                        >
                          <Link
                            href={`/dashboard/${transaction.type === 'expense' ? 'expenses' : 'income'}/${transaction.id}/edit`}
                            className="flex items-center gap-2 md:gap-3 flex-1 min-w-0"
                          >
                            <div className="text-xl md:text-2xl flex-shrink-0">{catInfo.icon || (isExpense ? '📦' : '💰')}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 flex-wrap">
                                <p className="text-xs md:text-sm font-medium" style={{ color: '#111111' }}>
                                  {transaction.category}
                                </p>
                                {isExpense && transaction.expenseType && (
                                  <span 
                                    className="px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-xs font-medium text-white flex-shrink-0"
                                    style={{ backgroundColor: getTypeColor(transaction.expenseType) }}
                                  >
                                    {getTypeLabel(transaction.expenseType)}
                                  </span>
                                )}
                              </div>
                              {transaction.title && (
                                <p className="text-xs truncate" style={{ color: '#8E8E93' }}>
                                  {transaction.title}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p 
                                className="text-sm md:text-base font-semibold" 
                                style={{ color: isExpense ? '#C92A2A' : '#339AF0' }}
                              >
                                {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}원
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (isExpense) {
                                handleDeleteExpense(transaction.id)
                              } else {
                                handleDeleteIncome(transaction.id)
                              }
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

