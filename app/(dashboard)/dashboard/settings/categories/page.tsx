'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
  type: 'expense' | 'income'
  icon: string | null
  color: string | null
  order_index: number
  is_default: boolean
}

const defaultExpenseCategories = [
  { name: '식비', icon: '🍽️', color: '#FF6B6B' },
  { name: '카페', icon: '☕', color: '#8B4513' },
  { name: '교통비', icon: '🚇', color: '#4C6EF5' },
  { name: '쇼핑', icon: '🛍️', color: '#FFD43B' },
  { name: '의류', icon: '👕', color: '#51CF66' },
  { name: '뷰티', icon: '💄', color: '#FF6B9D' },
  { name: '취미', icon: '🎨', color: '#845EF7' },
  { name: '여행', icon: '✈️', color: '#339AF0' },
  { name: '건강', icon: '💊', color: '#20C997' },
  { name: '교육', icon: '📚', color: '#FD7E14' },
  { name: '문화', icon: '🎭', color: '#E64980' },
  { name: '기타', icon: '📦', color: '#868E96' },
]

const defaultIncomeCategories = [
  { name: '급여', icon: '💰', color: '#51CF66' },
  { name: '부수입', icon: '💵', color: '#339AF0' },
  { name: '용돈', icon: '🎁', color: '#FFD43B' },
  { name: '투자수익', icon: '📈', color: '#845EF7' },
  { name: '기타', icon: '📦', color: '#868E96' },
]

// 색상 팔레트 (객관식 선택용)
const colorPalette = [
  '#FF6B6B', // 빨강
  '#FF6B9D', // 핑크
  '#FFD43B', // 노랑
  '#51CF66', // 초록
  '#20C997', // 청록
  '#339AF0', // 파랑
  '#4C6EF5', // 인디고
  '#845EF7', // 보라
  '#E64980', // 마젠타
  '#FD7E14', // 주황
  '#8B4513', // 갈색
  '#868E96', // 회색
]

export default function CategoriesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingIcon, setEditingIcon] = useState('')
  const [editingColor, setEditingColor] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')
  const [newCategoryColor, setNewCategoryColor] = useState('#868E96')
  const [localCategories, setLocalCategories] = useState<Category[]>([])
  const [hasOrderChanges, setHasOrderChanges] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories
    setLocalCategories([...currentCategories].sort((a, b) => a.order_index - b.order_index))
    setHasOrderChanges(false)
  }, [activeTab, expenseCategories, incomeCategories])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('카테고리 로드 오류:', error)
        return
      }

      const categories = data || []
      setExpenseCategories(categories.filter(c => c.type === 'expense'))
      setIncomeCategories(categories.filter(c => c.type === 'income'))
      
      // 현재 탭에 맞는 카테고리로 로컬 state 업데이트
      const currentTabCategories = activeTab === 'expense' 
        ? categories.filter(c => c.type === 'expense')
        : categories.filter(c => c.type === 'income')
      setLocalCategories(currentTabCategories.sort((a, b) => a.order_index - b.order_index))
      setHasOrderChanges(false)
    } catch (err) {
      console.error('카테고리 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultCategories = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // 기본 지출 카테고리 추가
      const expenseData = defaultExpenseCategories.map((cat, index) => ({
        user_id: user.id,
        name: cat.name,
        type: 'expense' as const,
        icon: cat.icon,
        color: cat.color,
        order_index: index,
        is_default: true,
      }))

      // 기본 수입 카테고리 추가
      const incomeData = defaultIncomeCategories.map((cat, index) => ({
        user_id: user.id,
        name: cat.name,
        type: 'income' as const,
        icon: cat.icon,
        color: cat.color,
        order_index: index,
        is_default: true,
      }))

      const { error } = await supabase
        .from('user_categories')
        .insert([...expenseData, ...incomeData])

      if (error && !error.message.includes('duplicate')) {
        console.error('기본 카테고리 추가 오류:', error)
      } else {
        loadCategories()
      }
    } catch (err) {
      console.error('기본 카테고리 초기화 오류:', err)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories
      const maxOrder = currentCategories.length > 0
        ? Math.max(...currentCategories.map(c => c.order_index))
        : -1

      const { error } = await supabase
        .from('user_categories')
        .insert({
          user_id: user.id,
          name: newCategoryName.trim(),
          type: activeTab,
          icon: newCategoryIcon,
          color: newCategoryColor,
          order_index: maxOrder + 1,
          is_default: false,
        })

      if (error) {
        if (error.message.includes('duplicate')) {
          alert('이미 존재하는 카테고리입니다.')
        } else {
          console.error('카테고리 추가 오류:', error)
          alert('카테고리 추가 중 오류가 발생했습니다.')
        }
        return
      }

      setNewCategoryName('')
      setNewCategoryIcon('📦')
      setNewCategoryColor('#868E96')
      loadCategories()
    } catch (err) {
      console.error('카테고리 추가 오류:', err)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_categories')
        .delete()
        .eq('id', category.id)

      if (error) {
        console.error('카테고리 삭제 오류:', error)
        alert('카테고리 삭제 중 오류가 발생했습니다.')
        return
      }

      loadCategories()
    } catch (err) {
      console.error('카테고리 삭제 오류:', err)
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category)
    setEditingName(category.name)
    setEditingIcon(category.icon || '📦')
    setEditingColor(category.color || '#868E96')
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingName('')
    setEditingIcon('')
    setEditingColor('')
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingName.trim()) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_categories')
        .update({
          name: editingName.trim(),
          icon: editingIcon || null,
          color: editingColor || null,
        })
        .eq('id', editingCategory.id)

      if (error) {
        if (error.message.includes('duplicate')) {
          alert('이미 존재하는 카테고리 이름입니다.')
        } else {
          console.error('카테고리 수정 오류:', error)
          alert('카테고리 수정 중 오류가 발생했습니다.')
        }
        return
      }

      handleCancelEdit()
      loadCategories()
    } catch (err) {
      console.error('카테고리 수정 오류:', err)
    }
  }

  const handleMoveCategory = (category: Category, direction: 'up' | 'down') => {
    const sortedCategories = [...localCategories]
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id)

    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sortedCategories.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // 배열에서 두 요소의 위치를 교환
    const temp = sortedCategories[currentIndex]
    sortedCategories[currentIndex] = sortedCategories[targetIndex]
    sortedCategories[targetIndex] = temp

    setLocalCategories(sortedCategories)
    setHasOrderChanges(true)
  }

  const handleSaveOrder = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // 새로운 order_index로 업데이트
      const updates = localCategories.map((category, index) => ({
        id: category.id,
        order_index: index,
      }))

      // 모든 카테고리의 order_index를 한 번에 업데이트
      for (const update of updates) {
        const { error } = await supabase
          .from('user_categories')
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) {
          console.error('카테고리 순서 저장 오류:', error)
          alert('카테고리 순서 저장 중 오류가 발생했습니다.')
          return
        }
      }

      setHasOrderChanges(false)
      loadCategories()
      alert('순서가 저장되었습니다.')
    } catch (err) {
      console.error('카테고리 순서 저장 오류:', err)
      alert('카테고리 순서 저장 중 오류가 발생했습니다.')
    }
  }

  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories
  const hasCategories = currentCategories.length > 0

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/dashboard/settings"
            className="text-sm text-accent hover:underline inline-flex items-center gap-1"
          >
            ← 설정으로 돌아가기
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            카테고리 관리
          </h1>
          <p className="text-sm" style={{ color: '#8E8E93' }}>
            지출 및 수입 카테고리를 관리하세요
          </p>
        </div>

        {!hasCategories && (
          <div className="card-toss p-6 mb-6 text-center">
            <p className="text-sm mb-4" style={{ color: '#565656' }}>
              카테고리가 없습니다. 기본 카테고리를 추가하시겠습니까?
            </p>
            <button
              onClick={initializeDefaultCategories}
              className="px-6 py-2 bg-accent text-white rounded-button text-sm font-semibold hover:opacity-90 transition"
            >
              기본 카테고리 추가
            </button>
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'expense'
                ? 'text-accent border-b-2 border-accent'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            지출 카테고리
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'income'
                ? 'text-accent border-b-2 border-accent'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            수입 카테고리
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="card-toss p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#111111' }}>
              {activeTab === 'expense' ? '지출' : '수입'} 카테고리
            </h2>
            {hasOrderChanges && (
              <button
                onClick={handleSaveOrder}
                className="px-4 py-2 bg-accent text-white rounded-button text-sm font-semibold hover:opacity-90 transition"
              >
                순서 저장
              </button>
            )}
          </div>
          {hasCategories ? (
            <div className="space-y-3">
              {localCategories.map((category, index) => {
                const canMoveUp = index > 0
                const canMoveDown = index < localCategories.length - 1
                
                return (
                  <div
                    key={category.id}
                    className="p-4 rounded-xl border border-border hover:shadow-sm transition flex items-center gap-3"
                    style={{ background: category.color ? `${category.color}15` : '#F7F7F8' }}
                  >
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMoveCategory(category, 'up')}
                        disabled={!canMoveUp}
                        className="px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-bg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveCategory(category, 'down')}
                        disabled={!canMoveDown}
                        className="px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-bg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="아래로 이동"
                      >
                        ↓
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingCategory?.id === category.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={editingIcon}
                              onChange={(e) => setEditingIcon(e.target.value)}
                              className="w-12 px-2 py-1 text-lg border border-border rounded text-center"
                              placeholder="📦"
                              maxLength={2}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleUpdateCategory}
                                className="text-xs px-2 py-1 bg-accent text-white rounded hover:opacity-90"
                              >
                                저장
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-xs px-2 py-1 bg-surface border border-border rounded hover:bg-bg"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-border rounded"
                            placeholder="카테고리 이름"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateCategory()
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                            autoFocus
                          />
                          <div>
                            <label className="text-xs block mb-2" style={{ color: '#565656' }}>색상:</label>
                            <div className="grid grid-cols-6 gap-2 mb-2">
                              {colorPalette.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setEditingColor(color)}
                                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                                    editingColor === color
                                      ? 'border-accent scale-110 shadow-md'
                                      : 'border-border hover:border-accent/50'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-border flex-shrink-0"
                                style={{ backgroundColor: editingColor }}
                              />
                              <span className="text-xs font-mono" style={{ color: '#8E8E93' }}>
                                {editingColor}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon || '📦'}</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#111111' }}>
                                {category.name}
                              </p>
                              {category.is_default && (
                                <p className="text-xs mt-0.5" style={{ color: '#8E8E93' }}>
                                  기본 카테고리
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(category)}
                              className="text-xs px-2 py-1 text-textSecondary hover:text-accent hover:bg-surface rounded transition"
                              title="수정"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="text-xs px-2 py-1 text-textSecondary hover:text-red-500 hover:bg-surface rounded transition"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#8E8E93' }}>
              카테고리가 없습니다. 아래에서 추가해주세요.
            </p>
          )}
        </div>

        {/* 카테고리 추가 */}
        <div className="card-toss p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>
            카테고리 추가
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                카테고리 이름
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-input"
                placeholder="예: 커피, 간식"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory()
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                  아이콘 (이모지)
                </label>
                <input
                  type="text"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="w-full max-w-full px-4 py-2 border border-border rounded-input text-center text-lg"
                  placeholder="📦"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#565656' }}>
                  색상
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        newCategoryColor === color
                          ? 'border-accent scale-110 shadow-md'
                          : 'border-border hover:border-accent/50'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: newCategoryColor }}
                  />
                  <span className="text-xs font-mono" style={{ color: '#8E8E93' }}>
                    {newCategoryColor}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="w-full py-3 bg-accent text-white rounded-button font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              카테고리 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

