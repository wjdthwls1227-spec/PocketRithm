import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 로그인 유지 옵션에 따라 쿠키 만료 시간 조정
              const cookieOptions = {
                ...options,
                maxAge: options?.maxAge || 60 * 60 * 24 * 30, // 30일
                httpOnly: options?.httpOnly ?? true,
                secure: options?.secure ?? process.env.NODE_ENV === 'production',
                sameSite: options?.sameSite ?? 'lax' as const,
              }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}


