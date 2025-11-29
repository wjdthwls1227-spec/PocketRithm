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

      // 지출 로드
      let expenseQuery = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (dateRange.start) {
        expenseQuery = expenseQuery.gte('date', dateRange.start)
      }
      if (dateRange.end) {
        expenseQuery = expenseQuery.lte('date', dateRange.end)
      }

      const { data: expenseData, error: expenseError } = await expenseQuery

      if (expenseError) {
        console.error('지출 로드 오류:', expenseError)
      } else {
        setExpenses(expenseData || [])
      }

      // 수입 로드
      let incomeQuery = supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (dateRange.start) {
        incomeQuery = incomeQuery.gte('date', dateRange.start)
      }
      if (dateRange.end) {
        incomeQuery = incomeQuery.lte('date', dateRange.end)
      }

      const { data: incomeData, error: incomeError } = await incomeQuery

      if (incomeError) {
        console.error('수입 로드 오류:', incomeError)
      } else {
        setIncomes(incomeData || [])
      }
    } catch (err) {
      console.error('거래 내역 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const getDayOfWeek = (date: string) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    return days[new Date(date).getDay()]
  }

  const getDayNumber = (date: string) => {
    return new Date(date).getDate().toString()
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
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>거래 내역</h1>
          <div className="flex gap-3">
            <Link
              href="/dashboard/expenses/new"
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
            >
              + 지출
            </Link>
            <Link
              href="/dashboard/income/new"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm"
            >
              + 수입
            </Link>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-2xl font-bold" style={{ color: '#339AF0' }}>{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>지출</p>
                <p className="text-2xl font-bold" style={{ color: '#FF3B30' }}>{formatCurrency(totalExpense)}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>합계</p>
                <p className="text-2xl font-bold" style={{ color: '#111111' }}>
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
                        {formatCurrency(group.incomeTotal)}원
                      </span>
                      <span className="text-sm" style={{ color: '#FF3B30' }}>
                        {formatCurrency(group.expenseTotal)}원
                      </span>
                    </div>
                  </div>

                  {/* 거래 항목 */}
                  <div className="space-y-3">
                    {group.transactions.map((transaction) => {
                      const catInfo = getCategoryInfo(transaction.category, transaction.type)
                      const isExpense = transaction.type === 'expense'
                      
                      return (
                        <Link
                          key={`${transaction.type}-${transaction.id}`}
                          href={`/dashboard/${transaction.type === 'expense' ? 'expenses' : 'income'}/${transaction.id}/edit`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-bg transition"
                        >
                          <div className="text-2xl">{catInfo.icon || (isExpense ? '📦' : '💰')}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-medium" style={{ color: '#111111' }}>
                                {transaction.category}
                              </p>
                              {isExpense && transaction.expenseType && (
                                <span 
                                  className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
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
                          <div className="text-right">
                            <p 
                              className="text-base font-semibold" 
                              style={{ color: isExpense ? '#FF3B30' : '#339AF0' }}
                            >
                              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}원
                            </p>
                          </div>
                        </Link>
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

