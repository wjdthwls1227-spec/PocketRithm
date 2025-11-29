'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Expense } from '@/types/database'
import Link from 'next/link'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'desire' | 'lack' | 'need'>('all')
  const [filterEmotion, setFilterEmotion] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const emotions = ['행복', '스트레스', '외로움', '지루함', '축하', '보상', '피곤', '불안']

  useEffect(() => {
    loadExpenses()
  }, [filterType, filterEmotion, dateRange])

  const loadExpenses = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('expenses')
        .select('*')
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      desire: '욕망',
      lack: '결핍',
      need: '필요',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      desire: 'bg-pink-100 text-pink-800',
      lack: 'bg-yellow-100 text-yellow-800',
      need: 'bg-blue-100 text-blue-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">지출 관리</h1>
          <Link
            href="/dashboard/expenses/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + 지출 추가
          </Link>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타입
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="desire">욕망</option>
                <option value="lack">결핍</option>
                <option value="need">필요</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                감정
              </label>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기간
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">총 지출</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">기록 수</p>
              <p className="text-2xl font-bold">{expenses.length}건</p>
            </div>
          </div>
        </div>

        {/* 지출 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">등록된 지출이 없습니다.</p>
            <Link
              href="/dashboard/expenses/new"
              className="text-blue-600 hover:underline"
            >
              첫 지출을 추가해보세요
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(expense.type)}`}>
                        {getTypeLabel(expense.type)}
                      </span>
                      <span className="text-2xl font-bold">{formatCurrency(expense.amount)}</span>
                    </div>
                    <p className="text-lg font-semibold mb-1">{expense.category}</p>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(expense.date)}</p>
                    {expense.emotions && expense.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {expense.emotions.map((emotion, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    )}
                    {expense.reason && (
                      <p className="text-sm text-gray-700 mt-2">{expense.reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/dashboard/expenses/${expense.id}/edit`}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

