'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const commonSources = [
  '급여', '부수입', '용돈', '투자수익', '기타'
]

export default function EditIncomePage() {
  const router = useRouter()
  const params = useParams()
  const incomeId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: '',
  })

  useEffect(() => {
    loadIncome()
  }, [incomeId])

  const loadIncome = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('incomes')
        .select('*')
        .eq('id', incomeId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !data) {
        setError('수입을 불러올 수 없습니다.')
        setLoading(false)
        return
      }

      setFormData({
        amount: data.amount.toString(),
        source: data.source,
        date: data.date,
      })
    } catch (err) {
      setError('수입을 불러오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
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
        .from('incomes')
        .update({
          amount: parseInt(formData.amount),
          source: formData.source,
          date: formData.date,
        })
        .eq('id', incomeId)
        .eq('user_id', user.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      router.push('/dashboard/income')
    } catch (err) {
      setError(err instanceof Error ? err.message : '수입 수정 중 오류가 발생했습니다.')
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
            href="/dashboard/income"
            className="text-blue-600 hover:underline"
          >
            ← 수입 목록으로
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">수입 수정</h1>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              수입원 <span className="text-red-500">*</span>
            </label>
            <input
              id="source"
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              list="sources"
              required
            />
            <datalist id="sources">
              {commonSources.map((source) => (
                <option key={source} value={source} />
              ))}
            </datalist>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
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
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <Link
              href="/dashboard/income"
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

