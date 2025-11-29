'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/utils/admin'

export default function DashboardNav() {
  const pathname = usePathname()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 사용자 정보 로드
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
          setProfile(profileData)
        }
      } catch (err) {
        console.error('사용자 정보 로드 오류:', err)
      }
    }

    loadUser()
  }, [])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isAccountMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen, isUserMenuOpen])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-bg border-b border-border">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex justify-between h-14 md:h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-base md:text-lg font-semibold text-accent">
              포켓리즘
            </Link>
            <div className="ml-4 md:ml-8 flex items-center gap-0.5 md:gap-1">
              <Link
                href="/dashboard"
                className={`px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition ${
                  isActive('/dashboard') && pathname === '/dashboard'
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                대시보드
              </Link>

              {/* 가계부 드롭다운 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className={`px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition flex items-center gap-1 ${
                    isActive('/dashboard/expenses') || isActive('/dashboard/income') || isActive('/dashboard/transactions')
                      ? 'bg-surface text-textPrimary'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  가계부
                  <svg
                    className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
                      isAccountMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-36 md:w-40 bg-bg border border-border rounded-md py-1 z-50">
                    <Link
                      href="/dashboard/transactions"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/dashboard/transactions')
                          ? 'bg-surface text-textPrimary font-medium'
                          : 'text-textSecondary hover:bg-surface'
                      }`}
                    >
                      거래 내역
                    </Link>
                    <Link
                      href="/dashboard/expenses"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/dashboard/expenses')
                          ? 'bg-surface text-textPrimary font-medium'
                          : 'text-textSecondary hover:bg-surface'
                      }`}
                    >
                      지출 관리
                    </Link>
                    <Link
                      href="/dashboard/income"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/dashboard/income')
                          ? 'bg-surface text-textPrimary font-medium'
                          : 'text-textSecondary hover:bg-surface'
                      }`}
                    >
                      수입 관리
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/dashboard/statistics"
                className={`px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition ${
                  isActive('/dashboard/statistics')
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                통계
              </Link>

              <Link
                href="/dashboard/retrospectives"
                className={`px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition ${
                  isActive('/dashboard/retrospectives')
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                회고
              </Link>

              <Link
                href="/challenges"
                className={`hidden sm:block px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition ${
                  pathname === '/challenges'
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                챌린지
              </Link>

              <Link
                href="/articles"
                className={`hidden sm:block px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition ${
                  pathname === '/articles'
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                칼럼
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* 사용자 프로필 드롭다운 */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium text-textSecondary hover:text-textPrimary transition"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                  {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline-block">
                  {profile?.name || user?.email?.split('@')[0] || '사용자'}
                </span>
                <svg
                  className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 md:w-48 bg-bg border border-border rounded-md py-1 z-50 shadow-lg">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`block px-4 py-2 text-sm transition ${
                      pathname === '/dashboard/profile'
                        ? 'bg-surface text-textPrimary font-medium'
                        : 'text-textSecondary hover:bg-surface'
                    }`}
                  >
                    👤 마이페이지
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`block px-4 py-2 text-sm transition ${
                      pathname === '/dashboard/settings'
                        ? 'bg-surface text-textPrimary font-medium'
                        : 'text-textSecondary hover:bg-surface'
                    }`}
                  >
                    ⚙️ 설정
                  </Link>
                  {isAdmin(user?.email) && (
                    <Link
                      href="/dashboard/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`block px-4 py-2 text-sm transition ${
                        pathname === '/dashboard/admin'
                          ? 'bg-surface text-textPrimary font-medium'
                          : 'text-textSecondary hover:bg-surface'
                      }`}
                    >
                      🔧 어드민
                    </Link>
                  )}
                  <div className="border-t border-border my-1"></div>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-textSecondary hover:bg-surface transition"
                    >
                      🚪 로그아웃
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

