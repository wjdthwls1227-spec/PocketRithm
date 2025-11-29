'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export default function NewIncomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    memo: '', // 제목
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // 사용자 카테고리 가져오기
      const { data: userCategories, error: categoryError } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('order_index', { ascending: true })

      if (categoryError) {
        console.error('카테고리 로드 오류:', categoryError)
        setCategories([])
      } else {
        setCategories(userCategories || [])
      }

      // 카테고리가 없으면 기존 수입에서 카테고리 가져오기
      if (!userCategories || userCategories.length === 0) {
        const { data: incomeData } = await supabase
          .from('incomes')
          .select('source')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8)

        if (incomeData) {
          const uniqueSources = Array.from(new Set(incomeData.map(i => i.source)))
          setCategories(uniqueSources.map((name, index) => ({
            id: `temp-${index}`,
            name,
            icon: '💰',
            color: '#51CF66',
          })))
        }
      }
    } catch (err) {
      console.error('카테고리 로드 오류:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // 숫자만 허용하고 쉼표 제거
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({ ...prev, amount: numericValue }))
  }

  const handleSourceSelect = (sourceName: string) => {
    setFormData({ ...formData, source: sourceName })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.source || !formData.memo) {
      setError('금액, 수입원, 제목을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: insertError } = await supabase
        .from('incomes')
        .insert({
          user_id: user.id,
          amount: parseInt(formData.amount),
          source: formData.source,
          memo: formData.memo || null,
          date: formData.date,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard/income')
    } catch (err) {
      setError(err instanceof Error ? err.message : '수입 추가 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const formatAmount = (amount: string) => {
    if (!amount) return '0'
    const numericValue = amount.replace(/,/g, '')
    return parseInt(numericValue || '0').toLocaleString()
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-bg border-b border-border px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/income"
              className="text-textSecondary hover:text-textPrimary"
            >
              ← 취소
            </Link>
            <h1 className="text-lg font-semibold" style={{ color: '#111111' }}>
              수입 추가
            </h1>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.amount || !formData.source || !formData.memo}
              className="text-accent font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
          {/* 제목 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-input bg-surface"
              placeholder="예: 월급, 부수입, 용돈 등"
              required
            />
          </div>

          {/* 금액 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
              금액 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formData.amount ? formatAmount(formData.amount) : ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-4 pr-16 py-3 font-semibold border border-border rounded-input bg-surface text-right"
                placeholder="0"
                style={{ color: '#51CF66' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold pointer-events-none" style={{ color: '#8E8E93' }}>
                원
              </span>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
              날짜
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-input bg-surface"
            />
          </div>

          {/* 수입원 선택 */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#565656' }}>
              수입원
            </label>
            {loadingCategories ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSourceSelect(category.name)}
                    className={`p-4 rounded-button border-2 transition ${
                      formData.source === category.name
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-surface hover:border-accent/50'
                    }`}
                    style={{
                      backgroundColor: formData.source === category.name && category.color
                        ? `${category.color}20`
                        : undefined,
                    }}
                  >
                    <div className="text-2xl mb-1">{category.icon || '💰'}</div>
                    <div className="text-xs font-medium" style={{ color: '#111111' }}>
                      {category.name}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>
                  수입원 카테고리가 없습니다.
                </p>
                <Link
                  href="/dashboard/settings/categories"
                  className="text-sm text-accent hover:underline"
                >
                  카테고리 설정하기 →
                </Link>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-input">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
