import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // 세션 자동 저장 (자동로그인)
        autoRefreshToken: true, // 토큰 자동 갱신
        detectSessionInUrl: true, // URL에서 세션 감지
      },
    }
  )
}


