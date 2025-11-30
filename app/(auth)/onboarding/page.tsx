'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 사용자 인증 확인
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleComplete = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 프로필 업데이트
        const { error } = await supabase
          .from('profiles')
          .update({
            monthly_budget: monthlyBudget ? parseInt(monthlyBudget) : null,
          })
          .eq('id', user.id)

        if (error) {
          console.error('프로필 업데이트 오류:', error)
        }

        // 대시보드로 이동
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('온보딩 완료 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">포켓리즘에 오신 것을 환영합니다! 🎉</h1>
            <p className="text-gray-600 mb-8">
              지출 회고를 통해 더 나은 소비 습관을 만들어보세요
            </p>
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">지출 기록</h3>
                  <p className="text-sm text-gray-600">매일의 지출을 욕망/결핍/필요로 분류하여 기록하세요</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">패턴 분석</h3>
                  <p className="text-sm text-gray-600">AI가 당신의 소비 패턴을 분석하고 인사이트를 제공합니다</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">회고와 개선</h3>
                  <p className="text-sm text-gray-600">주간/월간 회고를 통해 소비 습관을 개선해보세요</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              시작하기
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">첫 지출 입력 연습</h2>
            <p className="text-gray-600 mb-6">
              간단한 예시로 지출 입력 방법을 익혀보세요
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">커피 한 잔</span>
                  <span className="text-gray-600">5,000원</span>
                </div>
                <div className="text-sm text-gray-500">
                  타입: <span className="text-blue-600">욕망</span> | 감정: 행복
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              다음 단계
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">월 목표 설정</h2>
            <p className="text-gray-600 mb-6">
              이번 달 지출 목표를 설정해보세요 (선택사항)
            </p>
            <div className="mb-6">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                월 예산 (원)
              </label>
              <input
                id="budget"
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 500000"
              />
              <p className="text-sm text-gray-500 mt-2">
                나중에 설정에서 변경할 수 있습니다
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '완료 중...' : '시작하기'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}


