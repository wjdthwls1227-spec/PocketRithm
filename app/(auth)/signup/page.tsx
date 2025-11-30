'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/security'
import HomeNav from '@/components/navbar/HomeNav'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [signupSource, setSignupSource] = useState('')
  const [signupSourceOther, setSignupSourceOther] = useState('')
  const [signupReason, setSignupReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // 비밀번호 검증
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.')
        console.error('환경 변수 확인:', { 
          hasUrl: !!supabaseUrl, 
          hasKey: !!supabaseKey,
          url: supabaseUrl?.substring(0, 20) + '...'
        })
        setLoading(false)
        return
      }

      console.log('회원가입 시도:', { 
        email, 
        hasName: !!name,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey
      })
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('회원가입 결과:', { 
        hasUser: !!data?.user, 
        userId: data?.user?.id,
        email: data?.user?.email,
        error: signUpError 
      })

      if (signUpError) {
        console.error('회원가입 오류:', signUpError)
        
        // 사용자 친화적인 에러 메시지로 변환
        const errorMessage = signUpError.message.toLowerCase()
        let friendlyMessage = '회원가입 중 오류가 발생했습니다.'
        let showResendButton = false
        
        if (errorMessage.includes('user already registered') || 
            errorMessage.includes('already registered') ||
            errorMessage.includes('email already exists')) {
          friendlyMessage = '이미 가입된 이메일입니다. 로그인을 시도해주세요.'
        } else if (errorMessage.includes('email') && 
                   (errorMessage.includes('confirmation') || 
                    errorMessage.includes('sending') ||
                    errorMessage.includes('send'))) {
          friendlyMessage = '이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          showResendButton = true
        } else if (errorMessage.includes('invalid email')) {
          friendlyMessage = '올바른 이메일 주소를 입력해주세요.'
        } else if (errorMessage.includes('password') || errorMessage.includes('weak password')) {
          friendlyMessage = '비밀번호는 최소 6자 이상이어야 합니다.'
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          friendlyMessage = '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.'
        } else {
          friendlyMessage = '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
        }
        
        setError(friendlyMessage)
        setLoading(false)
        return
      }

      if (data.user) {
        // 가입 경로와 가입 이유 저장
        const finalSignupSource = signupSource === 'other' ? signupSourceOther : signupSource
        if (finalSignupSource || signupReason) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              signup_source: finalSignupSource || null,
              signup_reason: signupReason || null,
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('프로필 업데이트 오류:', updateError)
          }
        }

        // 이메일이 이미 확인된 경우 (재가입 시)
        if (data.user.email_confirmed_at) {
          // 이미 인증된 경우 바로 로그인 처리
          console.log('이미 인증된 사용자, 바로 로그인 처리')
          router.push('/dashboard')
          router.refresh()
        } else {
          // 이메일 확인 필요 - 항상 success 메시지 표시
          console.log('이메일 확인 필요, 안내 메시지 표시')
          setMessage('success')
        }
      } else {
        // 사용자 객체가 없지만 에러도 없는 경우 (이메일 발송 실패 가능)
        // 이 경우에도 안내 메시지와 재발송 버튼 표시
        console.log('사용자 객체 없음, 이메일 발송 문제 가능성')
        setMessage('success')
        setError('회원가입은 완료되었지만 이메일 발송에 문제가 있을 수 있습니다. 아래 "이메일 다시 보내기" 버튼을 클릭해주세요.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
        setError('구글 회원가입 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('구글 회원가입 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <HomeNav />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 md:p-24 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">회원가입</h1>
          <p className="text-sm md:text-base text-gray-600">
            포켓리즘과 함께 소비 습관을 개선해보세요
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSignup} className="space-y-5 md:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="홍길동"
                required
              />
            </div>

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
                placeholder="최소 8자, 대소문자, 숫자, 특수문자 포함"
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
              </p>
            </div>

            <div>
              <label htmlFor="signupSource" className="block text-sm font-medium text-gray-700 mb-2">
                가입 경로 <span className="text-gray-400 font-normal">(선택사항)</span>
              </label>
              <select
                id="signupSource"
                value={signupSource}
                onChange={(e) => setSignupSource(e.target.value)}
                className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
              >
                <option value="">선택해주세요</option>
                <option value="search">검색엔진 (구글, 네이버 등)</option>
                <option value="sns">SNS (인스타그램, 페이스북, 트위터 등)</option>
                <option value="recommendation">지인 추천</option>
                <option value="ad">광고</option>
                <option value="other">기타</option>
              </select>
              {signupSource === 'other' && (
                <input
                  type="text"
                  value={signupSourceOther}
                  onChange={(e) => setSignupSourceOther(e.target.value)}
                  className="w-full mt-2 px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="가입 경로를 입력해주세요"
                />
              )}
            </div>

            <div>
              <label htmlFor="signupReason" className="block text-sm font-medium text-gray-700 mb-2">
                가입 이유 <span className="text-gray-400 font-normal">(선택사항)</span>
              </label>
              <textarea
                id="signupReason"
                value={signupReason}
                onChange={(e) => setSignupReason(e.target.value)}
                className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                placeholder="포켓리즘을 알게 된 계기나 가입 이유를 자유롭게 적어주세요"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                    {error.includes('이미 가입된') && (
                      <Link
                        href="/login"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium block mt-2"
                      >
                        → 로그인하러 가기
                      </Link>
                    )}
                    {error.includes('이메일 발송') && (
                      <p className="text-xs text-red-600 mt-2">
                        💡 탈퇴 후 재가입하신 경우, 이메일 발송에 시간이 걸릴 수 있습니다. 
                        잠시 후 &quot;이메일 다시 보내기&quot;를 시도해주세요.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {message === 'success' && (
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">📧</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2" style={{ color: '#1E40AF' }}>
                      이메일 확인이 필요합니다
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#1E3A8A', lineHeight: '1.6' }}>
                      회원가입이 완료되었습니다!<br />
                      <strong>{email}</strong>로 인증 이메일을 보냈습니다.<br />
                      받은편지함을 확인하고 이메일 인증을 완료해주세요.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-xs font-semibold mb-2" style={{ color: '#92400E' }}>
                        ⚠️ 탈퇴 후 재가입하신 경우
                      </p>
                      <p className="text-xs" style={{ color: '#78350F', lineHeight: '1.6' }}>
                        이메일 발송에 <strong>1-2분 정도 걸릴 수 있습니다</strong>. 
                        이메일이 오지 않으면 아래 <strong>&quot;이메일 다시 보내기&quot;</strong> 버튼을 클릭해주세요.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100 mb-4">
                      <p className="text-xs font-medium mb-2" style={{ color: '#1E3A8A' }}>📌 확인 사항</p>
                      <ul className="text-xs space-y-1" style={{ color: '#1E3A8A' }}>
                        <li>• 받은편지함과 스팸 폴더를 확인해주세요</li>
                        <li>• 이메일의 &quot;이메일 확인하기&quot; 버튼을 클릭해주세요</li>
                        <li>• 인증 후 자동으로 로그인됩니다</li>
                        <li>• 이메일이 오지 않으면 아래 &quot;이메일 다시 보내기&quot; 버튼을 클릭해주세요</li>
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        로그인 페이지로
                      </Link>
                      <button
                        onClick={async () => {
                          setError(null)
                          const supabase = createClient()
                          const { error: resendError } = await supabase.auth.resend({
                            type: 'signup',
                            email: email,
                            options: {
                              emailRedirectTo: `${window.location.origin}/auth/callback`,
                            },
                          })
                          if (resendError) {
                            const errorMsg = resendError.message.toLowerCase()
                            if (errorMsg.includes('rate limit') || errorMsg.includes('too many')) {
                              setError('이메일 발송 제한에 걸렸습니다. 몇 분 후 다시 시도해주세요.')
                            } else if (errorMsg.includes('already confirmed')) {
                              setError('이미 인증된 이메일입니다. 로그인 페이지로 이동해주세요.')
                              setTimeout(() => {
                                router.push('/login')
                              }, 2000)
                            } else if (errorMsg.includes('user not found')) {
                              setError('해당 이메일로 가입된 계정을 찾을 수 없습니다. 회원가입을 다시 진행해주세요.')
                            } else {
                              setError('이메일 재발송에 실패했습니다: ' + resendError.message)
                            }
                          } else {
                            setMessage('resent')
                            setError(null)
                          }
                        }}
                        className="px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                      >
                        이메일 다시 보내기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message === 'resent' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ 인증 이메일을 다시 보냈습니다. 받은편지함을 확인해주세요.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-sm"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* 구글 회원가입 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
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
            <span style={{ color: '#111111' }}>구글로 시작하기</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
