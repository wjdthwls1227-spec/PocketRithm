import HomeNav from '@/components/navbar/HomeNav'

export default function ChallengesPage() {
  return (
    <>
      <HomeNav />
      <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
        <div className="max-w-7xl mx-auto px-5 py-12">
          <h1 className="text-3xl font-semibold mb-8" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
            챌린지
          </h1>
          <div className="card-toss p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-lg font-medium mb-2" style={{ color: '#111111' }}>
              챌린지 기능이 곧 추가됩니다
            </p>
            <p className="text-sm" style={{ color: '#8E8E93' }}>
              소비 챌린지에 참여하고 목표를 달성해보세요.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

