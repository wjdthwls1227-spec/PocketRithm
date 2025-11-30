import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // 로그인 유지 옵션에 따라 쿠키 만료 시간 조정
            // 기본적으로 30일로 설정 (자동로그인)
            const cookieOptions = {
              ...options,
              maxAge: options?.maxAge || 60 * 60 * 24 * 30, // 30일
              httpOnly: options?.httpOnly ?? true,
              secure: options?.secure ?? process.env.NODE_ENV === 'production',
              sameSite: options?.sameSite ?? 'lax' as const,
            }
            response.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  // 세션 새로고침
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


