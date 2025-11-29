'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomeNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 md:px-5">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* 로고 */}
          <Link href="/" className="text-lg md:text-xl font-semibold text-accent hover:opacity-80 transition">
            포켓리즘
          </Link>

          {/* 데스크톱 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            {/* 공통 메뉴 (로그인 여부와 관계없이 표시) */}
            <Link
              href="/articles"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition"
            >
              칼럼
            </Link>
            <Link
              href="/challenges"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition"
            >
              챌린지
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-textSecondary hover:text-textPrimary transition"
                    >
                      대시보드
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-sm font-medium text-textSecondary hover:text-textPrimary transition"
                    >
                      설정
                    </Link>
                  </>
                ) : (
                  <>
                    {pathname !== '/login' && (
                      <Link
                        href="/login"
                        className="text-sm font-medium text-textSecondary hover:text-textPrimary transition"
                      >
                        로그인
                      </Link>
                    )}
                    {pathname !== '/signup' && (
                      <Link
                        href="/signup"
                        className="px-4 py-2 bg-accent text-white rounded-button text-sm font-semibold hover:opacity-90 transition"
                      >
                        시작하기
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-textSecondary hover:text-textPrimary transition"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* 모바일 메뉴 드롭다운 */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-bg border border-border rounded-lg shadow-lg py-2 z-50">
                <Link
                  href="/articles"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surface transition"
                >
                  칼럼
                </Link>
                <Link
                  href="/challenges"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surface transition"
                >
                  챌린지
                </Link>
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="border-t border-border my-1"></div>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surface transition"
                        >
                          대시보드
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surface transition"
                        >
                          설정
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="border-t border-border my-1"></div>
                        {pathname !== '/login' && (
                          <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surface transition"
                          >
                            로그인
                          </Link>
                        )}
                        {pathname !== '/signup' && (
                          <Link
                            href="/signup"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm font-semibold text-accent hover:bg-surface transition mx-2 mt-2 text-center rounded-button border border-accent"
                          >
                            시작하기
                          </Link>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

