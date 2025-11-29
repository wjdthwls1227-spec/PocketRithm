'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HomeNav from '@/components/navbar/HomeNav'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
      } catch (err) {
        console.error('인증 확인 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <>
      <HomeNav />
      <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
        {/* 히어로 섹션 */}
        <section className="max-w-6xl mx-auto px-4 md:px-5 pt-16 md:pt-20 pb-24 md:pb-32">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="hero-title text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6" style={{ lineHeight: '1.3', letterSpacing: '-0.5px' }}>
              가계부 회고로 만드는<br />
              나만의 소비 습관
            </h1>
            <p className="hero-subtitle text-base md:text-xl mb-8 md:mb-10 px-2" style={{ color: '#565656', lineHeight: '1.6' }}>
              단순 기록이 아닌 <strong>욕망·결핍·필요</strong>로 분류하고,<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>AI가 분석해주는 인사이트로 진짜 필요한 소비만 하게 만드는 서비스입니다.
            </p>
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap px-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="button-toss px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold w-full sm:w-auto text-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%)', 
                    color: '#FFFFFF' 
                  }}
                >
                  대시보드로 가기
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="button-toss px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold w-full sm:w-auto text-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%)', 
                      color: '#FFFFFF' 
                    }}
                  >
                    무료로 시작하기
                  </Link>
                  <Link
                    href="/login"
                    className="button-toss px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold w-full sm:w-auto text-center"
                    style={{ 
                      background: '#FFFFFF',
                      color: '#111111',
                      border: '1px solid #E6E6E7'
                    }}
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 주요 기능 카드 */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-20">
            <div className="card-toss p-6 md:p-8 text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">🎯</div>
              <h3 className="section-title mb-2 md:mb-3 text-base md:text-lg">욕망·결핍·필요 구분</h3>
              <p className="text-xs md:text-sm" style={{ color: '#565656', lineHeight: '1.6' }}>
                지출을 단순히 기록하는 것이 아니라,<br className="hidden sm:block" />
                <strong>욕망</strong>, <strong>결핍</strong>, <strong>필요</strong>로 분류하여<br className="hidden sm:block" />
                진짜 필요한 소비를 파악합니다.
              </p>
            </div>

            <div className="card-toss p-6 md:p-8 text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">🤖</div>
              <h3 className="section-title mb-2 md:mb-3 text-base md:text-lg">AI 자동 분석</h3>
              <p className="text-xs md:text-sm" style={{ color: '#565656', lineHeight: '1.6' }}>
                AI가 당신의 소비 패턴을 분석하고<br className="hidden sm:block" />
                개선할 수 있는 인사이트를 제공합니다.<br className="hidden sm:block" />
                데이터 기반으로 더 나은 소비 습관을 만들어보세요.
              </p>
            </div>

            <div className="card-toss p-6 md:p-8 text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">📝</div>
              <h3 className="section-title mb-2 md:mb-3 text-base md:text-lg">회고 기반 개선</h3>
              <p className="text-xs md:text-sm" style={{ color: '#565656', lineHeight: '1.6' }}>
                주간/월간 회고를 작성하고,<br className="hidden sm:block" />
                반성과 개선을 통해<br className="hidden sm:block" />
                체계적으로 소비 습관을 개선합니다.
              </p>
            </div>
          </div>

          {/* 작동 방식 섹션 */}
          <div className="card-toss p-6 md:p-10 mb-12 md:mb-20">
            <h2 className="section-title text-center mb-8 md:mb-12 text-lg md:text-xl">어떻게 작동하나요?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#111111' }}>지출 기록</h4>
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  매일의 지출을<br />
                  욕망·결핍·필요로<br />
                  분류하여 기록
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#111111' }}>패턴 분석</h4>
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  AI가 소비 패턴을<br />
                  분석하고 인사이트<br />
                  제공
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#111111' }}>회고 작성</h4>
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  주간/월간 회고를<br />
                  통해 반성하고<br />
                  개선점 도출
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#111111' }}>습관 개선</h4>
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  회고를 바탕으로<br />
                  더 나은 소비 습관<br />
                  만들기
                </p>
              </div>
            </div>
          </div>

          {/* CTA 섹션 */}
          <div className="card-toss p-8 md:p-12 text-center" style={{ background: 'linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%)', color: '#FFFFFF' }}>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4">지금 시작해보세요</h2>
            <p className="text-sm md:text-base mb-6 md:mb-8 opacity-90 px-2" style={{ lineHeight: '1.6' }}>
              무료로 가입하고 나만의 소비 습관을 개선해보세요
            </p>
            {user ? (
              <Link
                href="/dashboard"
                className="button-toss px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold inline-block"
                style={{ 
                  background: '#FFFFFF',
                  color: '#2864FF'
                }}
              >
                대시보드로 가기
              </Link>
            ) : (
              <Link
                href="/signup"
                className="button-toss px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold inline-block"
                style={{ 
                  background: '#FFFFFF',
                  color: '#2864FF'
                }}
              >
                무료로 시작하기
              </Link>
            )}
          </div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-border py-8 md:py-12" style={{ background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto px-4 md:px-5">
            <div className="flex flex-col items-center gap-4 text-center">
              {/* 저작권 */}
              <div className="text-sm" style={{ color: '#8E8E93' }}>
                © 2025 PocketRithm. All rights reserved.
              </div>
              
              {/* 문의 이메일 */}
              <div className="text-sm" style={{ color: '#8E8E93' }}>
                문의: <a href="mailto:wjdthwls12@naver.com" className="hover:opacity-70 transition" style={{ color: '#2864FF' }}>wjdthwls12@naver.com</a>
              </div>
              
              {/* 이용약관 및 개인정보처리방침 */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link 
                  href="/terms" 
                  className="hover:opacity-70 transition" 
                  style={{ color: '#565656' }}
                >
                  이용약관
                </Link>
                <span style={{ color: '#E6E6E7' }}>|</span>
                <Link 
                  href="/privacy" 
                  className="hover:opacity-70 transition" 
                  style={{ color: '#565656' }}
                >
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
