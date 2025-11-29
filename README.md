# 포켓리즘 (PocketRithm)

지출 패턴을 분석하고 회고를 통해 더 나은 소비 습관을 만드는 서비스

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 및 메인 기능
│   └── api/               # API 라우트
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트
│   └── utils/            # 헬퍼 함수
├── types/                 # TypeScript 타입 정의
└── public/                # 정적 파일
```

## 개발 단계

자세한 개발 단계는 `DEVELOPMENT_PLAN.md`를 참고하세요.

