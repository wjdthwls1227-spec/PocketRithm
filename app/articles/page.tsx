import HomeNav from '@/components/navbar/HomeNav'

export default function ArticlesPage() {
  return (
    <>
      <HomeNav />
      <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
        <div className="max-w-7xl mx-auto px-5 py-12">
          <h1 className="text-3xl font-semibold mb-8" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
            칼럼
          </h1>
          <div className="card-toss p-12 text-center">
            <div className="text-5xl mb-4">📰</div>
            <p className="text-lg font-medium mb-2" style={{ color: '#111111' }}>
              칼럼 기능이 곧 추가됩니다
            </p>
            <p className="text-sm" style={{ color: '#8E8E93' }}>
              소비 습관 개선에 도움이 되는 유용한 칼럼을 읽어보세요.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

