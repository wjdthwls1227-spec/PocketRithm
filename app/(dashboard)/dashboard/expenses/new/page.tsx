'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const emotions = ['행복', '스트레스', '외로움', '지루함', '축하', '보상', '피곤', '불안']

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'need' as 'desire' | 'lack' | 'need',
    emotions: [] as string[],
    reason: '', // 제목
    analysis: '', // 지출분석/회고
  })

  const [showEmotions, setShowEmotions] = useState(false)

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
        .eq('type', 'expense')
        .order('order_index', { ascending: true })

      if (categoryError) {
        console.error('카테고리 로드 오류:', categoryError)
        // 카테고리가 없으면 기본 카테고리 사용
        setCategories([])
      } else {
        setCategories(userCategories || [])
      }

      // 카테고리가 없으면 기존 지출에서 카테고리 가져오기
      if (!userCategories || userCategories.length === 0) {
        const { data: expenseData } = await supabase
          .from('expenses')
          .select('category')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(12)

        if (expenseData) {
          const uniqueCategories = Array.from(new Set(expenseData.map(e => e.category)))
          setCategories(uniqueCategories.map((name, index) => ({
            id: `temp-${index}`,
            name,
            icon: '📦',
            color: '#868E96',
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

  const handleCategorySelect = (categoryName: string) => {
    setFormData({ ...formData, category: categoryName })
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
    
    if (!formData.amount || !formData.category || !formData.reason) {
      setError('금액, 카테고리, 제목을 입력해주세요.')
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

      const insertData: any = {
        user_id: user.id,
        amount: parseInt(formData.amount),
        category: formData.category,
        date: formData.date,
        type: formData.type,
        emotions: formData.emotions,
        reason: formData.reason || null,
      }

      // analysis 필드가 있으면 추가 (데이터베이스에 컬럼이 있을 때만)
      if (formData.analysis) {
        insertData.analysis = formData.analysis
      }

      const { error: insertError } = await supabase
        .from('expenses')
        .insert(insertData)

      if (insertError) {
        console.error('지출 추가 오류:', insertError)
        // analysis 컬럼 관련 에러인지 확인
        if (insertError.message.includes('analysis') || insertError.message.includes('column')) {
          setError('데이터베이스 업데이트가 필요합니다. 관리자에게 문의해주세요.')
        } else {
          setError(insertError.message)
        }
        setLoading(false)
        return
      }

      router.push('/dashboard/expenses')
    } catch (err) {
      setError(err instanceof Error ? err.message : '지출 추가 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const formatAmount = (amount: string) => {
    if (!amount) return '0'
    const numericValue = amount.replace(/,/g, '')
    return parseInt(numericValue || '0').toLocaleString()
  }

  const selectedCategory = categories.find(c => c.name === formData.category)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-bg border-b border-border px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/expenses"
              className="text-textSecondary hover:text-textPrimary"
            >
              ← 취소
            </Link>
            <h1 className="text-lg font-semibold" style={{ color: '#111111' }}>
              지출 추가
            </h1>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.amount || !formData.category || !formData.reason}
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
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-input bg-surface"
              placeholder="예: 점심 식사, 커피, 교통비 등"
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
                style={{ color: '#111111' }}
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

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#565656' }}>
              카테고리
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
                    onClick={() => handleCategorySelect(category.name)}
                    className={`p-4 rounded-button border-2 transition ${
                      formData.category === category.name
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-surface hover:border-accent/50'
                    }`}
                    style={{
                      backgroundColor: formData.category === category.name && category.color
                        ? `${category.color}20`
                        : undefined,
                    }}
                  >
                    <div className="text-2xl mb-1">{category.icon || '📦'}</div>
                    <div className="text-xs font-medium" style={{ color: '#111111' }}>
                      {category.name}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>
                  카테고리가 없습니다.
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

          {/* 타입 선택 */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#565656' }}>
              지출 유형
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['need', 'desire', 'lack'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`py-3 rounded-button border-2 transition ${
                    formData.type === type
                      ? type === 'need'
                        ? 'border-typeNeed bg-typeNeed/10'
                        : type === 'desire'
                        ? 'border-typeDesire bg-typeDesire/10'
                        : 'border-typeLack bg-typeLack/10'
                      : 'border-border bg-surface hover:border-accent/50'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1" style={{ color: '#111111' }}>
                    {type === 'need' ? '필요' : type === 'desire' ? '욕망' : '결핍'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 지출분석/회고 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
              지출분석/회고
            </label>
            <textarea
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-input bg-surface resize-none"
              placeholder="왜 이 지출을 하게 되었나요?"
              rows={4}
            />
          </div>

          {/* 감정 태그 (선택사항) */}
          <div>
            <button
              type="button"
              onClick={() => setShowEmotions(!showEmotions)}
              className="flex items-center justify-between w-full px-4 py-3 border border-border rounded-input bg-surface"
            >
              <span className="text-sm" style={{ color: '#565656' }}>
                감정 태그 {formData.emotions.length > 0 && `(${formData.emotions.length})`}
              </span>
              <span className="text-textTertiary">{showEmotions ? '▲' : '▼'}</span>
            </button>
            {showEmotions && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {emotions.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleEmotionToggle(emotion)}
                    className={`py-2 rounded-button text-xs transition ${
                      formData.emotions.includes(emotion)
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-textSecondary'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !formData.amount || !formData.category || !formData.reason}
              className="w-full py-4 bg-accent text-white rounded-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
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
