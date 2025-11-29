'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Expense } from '@/types/database'

const emotions = ['행복', '스트레스', '외로움', '지루함', '축하', '보상', '피곤', '불안']
const commonCategories = [
  '식비', '카페', '교통비', '쇼핑', '의류', '뷰티', '취미', '여행',
  '건강', '교육', '문화', '기타'
]

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: '',
    type: 'need' as 'desire' | 'lack' | 'need',
    emotions: [] as string[],
    reason: '',
  })

  useEffect(() => {
    loadExpense()
  }, [expenseId])

  const loadExpense = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !data) {
        setError('지출을 불러올 수 없습니다.')
        setLoading(false)
        return
      }

      setFormData({
        amount: data.amount.toString(),
        category: data.category,
        date: data.date,
        type: data.type,
        emotions: data.emotions || [],
        reason: data.reason || '',
      })
    } catch (err) {
      setError('지출을 불러오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmotionToggle = (emotion: string) => {
    setFormData({
      ...formData,
      emotions: formData.emotions.includes(emotion)
        ? formData.emotions.filter(e => e !== emotion)
        : [...formData.emotions, emotion]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          amount: parseInt(formData.amount),
          category: formData.category,
          date: formData.date,
          type: formData.type,
          emotions: formData.emotions,
          reason: formData.reason || null,
        })
        .eq('id', expenseId)
        .eq('user_id', user.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      router.push('/dashboard/expenses')
    } catch (err) {
      setError(err instanceof Error ? err.message : '지출 수정 중 오류가 발생했습니다.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/expenses"
            className="text-blue-600 hover:underline"
          >
            ← 지출 목록으로
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">지출 수정</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              금액 <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              타입 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['need', 'desire', 'lack'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-4 py-3 rounded-lg border-2 transition ${
                    formData.type === type
                      ? type === 'need'
                        ? 'border-blue-500 bg-blue-50'
                        : type === 'desire'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">
                    {type === 'need' ? '필요' : type === 'desire' ? '욕망' : '결핍'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              감정 (복수 선택 가능)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => handleEmotionToggle(emotion)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    formData.emotions.includes(emotion)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              지출 이유
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <Link
              href="/dashboard/expenses"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

