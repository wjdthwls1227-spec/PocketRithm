'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomeNav() {
  const pathname = usePathname()
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
    <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-semibold text-accent hover:opacity-80 transition">
            포켓리즘
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="flex items-center gap-6">
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
        </div>
      </div>
    </nav>
  )
}

