import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[계정 삭제] 시작')
    
    const supabase = await createClient()
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()

    if (getUserError) {
      console.error('[계정 삭제] 사용자 정보 가져오기 오류:', getUserError)
      return NextResponse.json(
        { error: '사용자 정보를 가져올 수 없습니다.', details: getUserError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('[계정 삭제] 사용자가 없음')
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('[계정 삭제] 사용자 ID:', userId)

    // Service Role Key 확인 (Admin API 사용 필수)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    console.log('[계정 삭제] Service Role Key 확인:', {
      hasKey: !!serviceRoleKey,
      hasUrl: !!supabaseUrl,
      keyLength: serviceRoleKey?.length || 0
    })
    
    if (!serviceRoleKey || !supabaseUrl) {
      console.error('[계정 삭제] Service Role Key가 없습니다.')
      return NextResponse.json(
        { 
          error: 'Service Role Key가 설정되지 않았습니다. 계정 삭제를 위해서는 Service Role Key가 필요합니다.',
          details: '환경 변수 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.'
        },
        { status: 500 }
      )
    }

    // Admin API 클라이언트 생성 (RLS 우회)
    let adminClient
    try {
      adminClient = createAdminClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      console.log('[계정 삭제] Admin API 클라이언트 생성 완료')
    } catch (adminError) {
      console.error('[계정 삭제] Admin API 클라이언트 생성 오류:', adminError)
      return NextResponse.json(
        { 
          error: 'Admin API 클라이언트 생성 중 오류가 발생했습니다.',
          details: adminError instanceof Error ? adminError.message : '알 수 없는 오류'
        },
        { status: 500 }
      )
    }

    // 1. Admin API를 사용하여 사용자 관련 데이터 삭제 (RLS 우회)
    console.log('[계정 삭제] Admin API로 사용자 데이터 삭제 시작')
    
    try {
      // 삭제 순서: 자식 테이블 먼저, 그 다음 profiles
      const deletePromises = [
        adminClient.from('expenses').delete().eq('user_id', userId),
        adminClient.from('incomes').delete().eq('user_id', userId),
        adminClient.from('daily_logs').delete().eq('user_id', userId),
        adminClient.from('retrospective_entries').delete().eq('user_id', userId),
        adminClient.from('weekly_reflections').delete().eq('user_id', userId),
        adminClient.from('weekly_4l').delete().eq('user_id', userId),
        adminClient.from('monthly_reflections').delete().eq('user_id', userId),
        adminClient.from('scheduled_reflections').delete().eq('user_id', userId),
        adminClient.from('challenge_participants').delete().eq('user_id', userId),
      ]

      const deleteResults = await Promise.all(deletePromises)
      
      // 삭제 오류 확인
      const deleteErrors = deleteResults.filter(result => result.error)
      if (deleteErrors.length > 0) {
        console.warn('[계정 삭제] 일부 데이터 삭제 오류:', deleteErrors.map(e => e.error))
        // 오류가 있어도 계속 진행
      }

      // profiles는 마지막에 삭제 (auth.users 참조)
      const { error: profileDeleteError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileDeleteError) {
        console.error('[계정 삭제] profiles 삭제 오류:', profileDeleteError)
        // profiles 삭제 실패해도 계속 진행 (이미 삭제되었을 수 있음)
      }

      console.log('[계정 삭제] 사용자 데이터 삭제 완료')
    } catch (dataDeleteError) {
      console.error('[계정 삭제] 데이터 삭제 중 오류:', dataDeleteError)
      // 데이터 삭제 실패해도 사용자 계정 삭제는 시도
    }

    // 2. Supabase Auth에서 사용자 계정 삭제
    console.log('[계정 삭제] Admin API로 사용자 계정 삭제 시도')
    
    try {
      const { data: deleteData, error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
      
      if (deleteError) {
        console.error('[계정 삭제] Admin API 사용자 삭제 오류:', deleteError)
        
        // "Database error deleting user" 오류인 경우, profiles가 남아있을 수 있음
        if (deleteError.message.includes('Database error')) {
          // profiles를 다시 삭제 시도
          try {
            await adminClient.from('profiles').delete().eq('id', userId)
            console.log('[계정 삭제] profiles 재삭제 시도 완료')
            
            // 다시 사용자 삭제 시도
            const { error: retryError } = await adminClient.auth.admin.deleteUser(userId)
            if (retryError) {
              return NextResponse.json(
                { 
                  error: '사용자 계정 삭제 중 오류가 발생했습니다.',
                  details: retryError.message,
                  code: retryError.status || 'unknown',
                  suggestion: 'Supabase 대시보드에서 수동으로 사용자를 삭제해주세요.'
                },
                { status: 500 }
              )
            }
          } catch (retryError) {
            console.error('[계정 삭제] 재시도 오류:', retryError)
            return NextResponse.json(
              { 
                error: '사용자 계정 삭제 중 오류가 발생했습니다.',
                details: deleteError.message,
                code: deleteError.status || 'unknown',
                suggestion: 'Supabase 대시보드에서 수동으로 사용자를 삭제해주세요.'
              },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json(
            { 
              error: '사용자 계정 삭제 중 오류가 발생했습니다.',
              details: deleteError.message,
              code: deleteError.status || 'unknown'
            },
            { status: 500 }
          )
        }
      }
      
      console.log('[계정 삭제] 사용자 계정 삭제 완료:', deleteData)
    } catch (adminError) {
      console.error('[계정 삭제] Admin API 사용자 삭제 예외:', adminError)
      return NextResponse.json(
        { 
          error: '사용자 계정 삭제 중 예상치 못한 오류가 발생했습니다.',
          details: adminError instanceof Error ? adminError.message : '알 수 없는 오류'
        },
        { status: 500 }
      )
    }

    // 3. 로그아웃 (사용자 계정이 삭제되었으므로 실패할 수 있음)
    try {
      await supabase.auth.signOut()
      console.log('[계정 삭제] 로그아웃 완료')
    } catch (signOutError) {
      console.warn('[계정 삭제] 로그아웃 오류 (무시 가능):', signOutError)
    }

    console.log('[계정 삭제] 완료')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[계정 삭제] 예상치 못한 오류:', error)
    return NextResponse.json(
      { 
        error: '계정 삭제 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

