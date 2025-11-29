import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // TODO: 어드민 권한 체크 로직 추가
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()
  
  // if (profile?.role !== 'admin') {
  //   redirect('/dashboard')
  // }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">어드민 대시보드</h1>
          <p className="text-gray-600">시스템 관리 및 설정</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">사용자 관리</h3>
            <p className="text-sm text-gray-600 mb-4">
              사용자 목록 조회 및 관리
            </p>
            <button className="text-blue-600 hover:underline text-sm">
              관리하기 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">챌린지 관리</h3>
            <p className="text-sm text-gray-600 mb-4">
              챌린지 기수 생성 및 관리
            </p>
            <button className="text-blue-600 hover:underline text-sm">
              관리하기 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">칼럼 관리</h3>
            <p className="text-sm text-gray-600 mb-4">
              칼럼 작성 및 게시 관리
            </p>
            <button className="text-blue-600 hover:underline text-sm">
              관리하기 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">통계 대시보드</h3>
            <p className="text-sm text-gray-600 mb-4">
              전체 사용자 통계 확인
            </p>
            <button className="text-blue-600 hover:underline text-sm">
              보기 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">시스템 설정</h3>
            <p className="text-sm text-gray-600 mb-4">
              시스템 전반 설정 관리
            </p>
            <button className="text-blue-600 hover:underline text-sm">
              설정하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

