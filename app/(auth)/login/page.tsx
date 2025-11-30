'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { checkLoginLockout, getRemainingLockoutTime } from '@/lib/security'
import HomeNav from '@/components/navbar/HomeNav'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true) // 기본값을 true로 설정하여 자동로그인 활성화
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // 잠금 상태 체크
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const remaining = getRemainingLockoutTime(lockoutTime)
        setRemainingTime(remaining)
        if (remaining === 0) {
          setLockoutTime(null)
          setFailedAttempts(0)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lockoutTime])

  // 로컬 스토리지에서 실패 횟수 복원
  useEffect(() => {
    const stored = localStorage.getItem('login_failed_attempts')
    const storedLockout = localStorage.getItem('login_lockout_time')
    if (stored) {
      const attempts = parseInt(stored, 10)
      setFailedAttempts(attempts)
      if (storedLockout) {
        const lockout = parseInt(storedLockout, 10)
        const remaining = getRemainingLockoutTime(lockout)
        if (remaining > 0) {
          setLockoutTime(lockout)
          setRemainingTime(remaining)
        } else {
          localStorage.removeItem('login_failed_attempts')
          localStorage.removeItem('login_lockout_time')
        }
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 잠금 상태 체크
    if (lockoutTime && remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60)
      const seconds = remainingTime % 60
      setError(`너무 많은 로그인 시도로 인해 계정이 잠겼습니다. ${minutes}분 ${seconds}초 후 다시 시도해주세요.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // 로그인 실패 시 카운트 증가
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        localStorage.setItem('login_failed_attempts', newFailedAttempts.toString())

        // 5회 실패 시 잠금
        if (checkLoginLockout(newFailedAttempts)) {
          const lockout = Date.now()
          setLockoutTime(lockout)
          localStorage.setItem('login_lockout_time', lockout.toString())
          setError('5회 연속 로그인 실패로 인해 15분간 로그인이 제한됩니다.')
          setLoading(false)
          return
        }

        // 사용자 친화적인 에러 메시지로 변환
        let friendlyMessage = '로그인 중 오류가 발생했습니다.'
        
        const errorMessage = signInError.message.toLowerCase()
        const errorStatus = signInError.status || 0
        
        // 이메일 미인증
        if (errorMessage.includes('email not confirmed') || 
            errorMessage.includes('email_not_confirmed') ||
            errorStatus === 401) {
          friendlyMessage = '이메일 인증이 필요합니다. 가입하신 이메일을 확인해주세요.'
        }
        // 잘못된 로그인 정보 (가장 흔한 경우)
        else if (errorMessage.includes('invalid login credentials') ||
                 errorMessage.includes('invalid credentials') ||
                 errorMessage.includes('email or password') ||
                 errorMessage.includes('wrong password') ||
                 errorMessage.includes('incorrect password')) {
          friendlyMessage = '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
        }
        // 사용자를 찾을 수 없음
        else if (errorMessage.includes('user not found') ||
                 errorMessage.includes('no user found')) {
          friendlyMessage = '가입되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.'
        }
        // 비밀번호가 잘못됨
        else if (errorMessage.includes('invalid password') ||
                 errorMessage.includes('password')) {
          friendlyMessage = '비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
        }
        // 너무 많은 요청
        else if (errorMessage.includes('too many requests') ||
                 errorMessage.includes('rate limit') ||
                 errorStatus === 429) {
          friendlyMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
        }
        // 네트워크 오류
        else if (errorMessage.includes('network') ||
                 errorMessage.includes('fetch') ||
                 errorMessage.includes('connection')) {
          friendlyMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
        }
        // 이메일 형식 오류
        else if (errorMessage.includes('invalid email') ||
                 errorMessage.includes('email format')) {
          friendlyMessage = '이메일 형식이 올바르지 않습니다. 올바른 이메일 주소를 입력해주세요.'
        }
        // 기타 알 수 없는 오류
        else {
          // 원본 메시지를 숨기고 일반적인 메시지 표시
          friendlyMessage = '로그인에 실패했습니다. 이메일과 비밀번호를 확인하고 다시 시도해주세요.'
        }
        
        setError(friendlyMessage)
        setLoading(false)
        return
      }

      if (data.user) {
        // 로그인 성공 - 실패 횟수 초기화
        setFailedAttempts(0)
        localStorage.removeItem('login_failed_attempts')
        localStorage.removeItem('login_lockout_time')
        setLockoutTime(null)
        
        // 로그인 성공 - 로딩 상태 해제 후 대시보드로 이동
        setLoading(false)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setResendingEmail(true)
    setError(null)
    setEmailSent(false)

    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (resendError) {
        // 이메일 재발송 오류 메시지
        const errorMessage = resendError.message.toLowerCase()
        let friendlyMessage = '이메일 재발송 중 오류가 발생했습니다.'
        
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          friendlyMessage = '이메일 발송 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.'
        } else if (errorMessage.includes('user not found') || errorMessage.includes('no user')) {
          friendlyMessage = '해당 이메일로 가입된 계정을 찾을 수 없습니다.'
        } else if (errorMessage.includes('already confirmed')) {
          friendlyMessage = '이미 인증된 이메일입니다. 로그인을 시도해주세요.'
        }
        
        setError(friendlyMessage)
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setError('이메일 재발송 중 오류가 발생했습니다.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          },
        },
      })

      if (error) {
        setError('구글 로그인 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('구글 로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <HomeNav />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 md:p-24 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">로그인</h1>
          <p className="text-sm md:text-base text-gray-600">
            포켓리즘에 오신 것을 환영합니다
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-medium mb-2">{error}</p>
                    {(error.includes('이메일 인증') || error.includes('가입되지 않은')) && (
                      <div className="space-y-2">
                        {error.includes('이메일 인증') && (
                          <button
                            type="button"
                            onClick={handleResendEmail}
                            disabled={resendingEmail || !email}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendingEmail ? '발송 중...' : '📧 인증 이메일 다시 보내기'}
                          </button>
                        )}
                        {error.includes('가입되지 않은') && (
                          <Link
                            href="/signup"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium block"
                          >
                            → 회원가입하러 가기
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {emailSent && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">
                  인증 이메일을 발송했습니다. 이메일을 확인해주세요.
                </p>
              </div>
            )}

            {/* 로그인 유지 옵션 */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-sm"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구글 로그인 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span style={{ color: '#111111' }}>구글로 로그인</span>
          </button>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
