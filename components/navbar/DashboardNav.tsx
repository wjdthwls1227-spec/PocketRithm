'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

export default function DashboardNav() {
  const pathname = usePathname()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-bg border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-lg font-semibold text-accent">
              포켓리즘
            </Link>
            <div className="ml-8 flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${
                    isActive('/dashboard/expenses') || isActive('/dashboard/income')
                      ? 'bg-surface text-textPrimary'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  가계부
                  <svg
                    className={`w-4 h-4 transition-transform ${
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
                  <div className="absolute top-full left-0 mt-1 w-40 bg-bg border border-border rounded-md py-1 z-50">
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/dashboard/statistics')
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                통계
              </Link>

              <Link
                href="/dashboard/retrospectives"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/dashboard/retrospectives')
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                회고
              </Link>

              <Link
                href="/challenges"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === '/challenges'
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                챌린지
              </Link>

              <Link
                href="/articles"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === '/articles'
                    ? 'bg-surface text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                칼럼
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 설정 */}
            <Link
              href="/dashboard/settings"
              className="px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:text-textPrimary transition"
            >
              설정
            </Link>

            {/* 어드민 모드 */}
            <Link
              href="/dashboard/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:text-textPrimary transition border border-border"
            >
              어드민
            </Link>

            {/* 로그아웃 */}
            <form action={signOut}>
              <button
                type="submit"
                className="text-textSecondary hover:text-textPrimary px-3 py-2 rounded-md text-sm font-medium transition"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

