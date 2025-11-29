'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        
        // 연결 테스트
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (error) {
          setStatus('error')
          setMessage(`연결 오류: ${error.message}`)
          return
        }

        // 테이블 목록 확인
        const tableNames = [
          'profiles',
          'expenses',
          'incomes',
          'daily_logs',
          'retrospective_entries',
          'weekly_reflections',
          'weekly_4l',
          'monthly_reflections',
          'scheduled_reflections',
          'challenges',
          'challenge_participants',
          'articles'
        ]

        const existingTables: string[] = []
        for (const tableName of tableNames) {
          const { error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0)
          
          if (!tableError) {
            existingTables.push(tableName)
          }
        }

        setTables(existingTables)
        setStatus('success')
        setMessage('Supabase 연결 성공!')
      } catch (err) {
        setStatus('error')
        setMessage(`오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
      }
    }

    testConnection()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Supabase 연결 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>연결 중...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <p className="text-green-600 font-semibold">{message}</p>
              </div>
             <div className="mt-4">
                <h2 className="font-semibold mb-2">생성된 테이블 ({tables.length}/12):</h2>
                <ul className="list-disc list-inside space-y-1">
                  {tables.map((table) => (
                    <li key={table} className="text-sm text-gray-700">{table}</li>
                  ))}
                </ul>
                {tables.length < 12 && (
                  <p className="text-yellow-600 text-sm mt-2">
                    ⚠️ 일부 테이블이 누락되었습니다. 스키마를 다시 확인해주세요.
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <p className="text-red-600 font-semibold">연결 실패</p>
              </div>
              <p className="text-gray-700">{message}</p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-semibold mb-2">확인 사항:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>.env.local 파일에 올바른 키가 입력되었는지 확인</li>
                  <li>Supabase 프로젝트가 활성화되어 있는지 확인</li>
                  <li>스키마가 제대로 실행되었는지 확인</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:underline"
          >
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </main>
  )
}

