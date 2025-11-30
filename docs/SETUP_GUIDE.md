# 포켓리즘 Supabase 설정 가이드

## 📋 단계별 설정 가이드

### 1단계: Supabase 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - https://supabase.com 접속
   - 회원가입 또는 로그인

2. **새 프로젝트 생성**
   - 대시보드에서 "New Project" 클릭
   - 프로젝트 정보 입력:
     - **Name**: `pocketrithm` (원하는 이름)
     - **Database Password**: 강력한 비밀번호 설정 (잘 보관하세요!)
     - **Region**: `Northeast Asia (Seoul)` 또는 가장 가까운 지역 선택
   - "Create new project" 클릭
   - 프로젝트 생성 완료까지 1-2분 대기

3. **프로젝트 설정 확인**
   - 프로젝트 대시보드로 이동
   - 왼쪽 사이드바에서 "Settings" (⚙️) 클릭
   - "API" 메뉴 클릭

4. **API 키 복사**
   - **Project URL**: `https://xxxxx.supabase.co` 형식
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형식
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형식 (⚠️ 비밀!)

### 2단계: .env.local 파일에 키 입력

1. 프로젝트 폴더에서 `.env.local` 파일 열기
2. 아래 형식으로 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **주의사항**:
- `.env.local` 파일은 절대 Git에 커밋하지 마세요!
- `service_role` 키는 서버에서만 사용하고, 클라이언트에 노출하지 마세요!

### 3단계: 데이터베이스 스키마 실행

1. **Supabase 대시보드에서 SQL Editor 열기**
   - 왼쪽 사이드바에서 "SQL Editor" 클릭
   - "New query" 클릭

2. **스키마 파일 복사**
   - 프로젝트의 `supabase/schema.sql` 파일 열기
   - 전체 내용 복사 (Ctrl+A → Ctrl+C)

3. **SQL Editor에 붙여넣기**
   - Supabase SQL Editor에 붙여넣기 (Ctrl+V)
   - "Run" 버튼 클릭 또는 F5 키
   - 성공 메시지 확인

4. **테이블 확인**
   - 왼쪽 사이드바에서 "Table Editor" 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - `profiles`
     - `expenses`
     - `incomes`
     - `daily_logs`
     - `retrospective_entries`
     - `weekly_reflections`
     - `weekly_4l`
     - `monthly_reflections`
     - `scheduled_reflections`
     - `challenges`
     - `challenge_participants`
     - `articles`

### 4단계: 인증 설정 (소셜 로그인)

#### 카카오 로그인 설정 (선택사항)

1. **카카오 개발자 센터**
   - https://developers.kakao.com 접속
   - 내 애플리케이션 생성
   - 플랫폼 설정 → Web 플랫폼 등록
   - Redirect URI 추가: `https://[프로젝트ID].supabase.co/auth/v1/callback`
   - REST API 키 복사

2. **Supabase에서 카카오 Provider 설정**
   - Supabase 대시보드 → Authentication → Providers
   - Kakao 활성화
   - REST API 키 입력
   - Redirect URL 확인

#### 구글 로그인 설정 (선택사항)

1. **Google Cloud Console**
   - https://console.cloud.google.com 접속
   - 프로젝트 생성
   - OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI 추가: `https://[프로젝트ID].supabase.co/auth/v1/callback`
   - Client ID와 Client Secret 복사

2. **Supabase에서 Google Provider 설정**
   - Supabase 대시보드 → Authentication → Providers
   - Google 활성화
   - Client ID와 Client Secret 입력

### 5단계: Storage 설정 (이미지 업로드용)

1. **Storage 버킷 생성**
   - Supabase 대시보드 → Storage
   - "Create a new bucket" 클릭
   - 이름: `retrospective-images`
   - Public bucket: ✅ 체크 (또는 Private로 설정 후 RLS 정책 추가)
   - "Create bucket" 클릭

2. **RLS 정책 설정** (Private 버킷인 경우)
   - Storage → Policies
   - 버킷 선택
   - "New Policy" 클릭
   - 사용자가 자신의 파일만 업로드/조회 가능하도록 정책 설정

### 6단계: 설정 확인

1. **환경 변수 확인**
   ```bash
   # .env.local 파일이 제대로 설정되었는지 확인
   # 파일 내용 확인 (터미널에서)
   type .env.local
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **에러 확인**
   - 브라우저 콘솔 확인
   - 터미널 에러 메시지 확인
   - Supabase 연결이 제대로 되었는지 확인

## 🔍 문제 해결

### 문제: "Invalid API key" 에러
- `.env.local` 파일의 키가 올바른지 확인
- Supabase 대시보드에서 키를 다시 복사
- 서버 재시작 (`npm run dev`)

### 문제: "Table does not exist" 에러
- `supabase/schema.sql` 파일이 제대로 실행되었는지 확인
- SQL Editor에서 테이블 목록 확인

### 문제: RLS 정책 에러
- Supabase 대시보드 → Authentication → Policies 확인
- 사용자 인증이 제대로 되었는지 확인

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] `.env.local` 파일에 API 키 입력 완료
- [ ] `supabase/schema.sql` 실행 완료
- [ ] 테이블 생성 확인 완료
- [ ] Storage 버킷 생성 완료 (선택사항)
- [ ] 소셜 로그인 설정 완료 (선택사항)
- [ ] 개발 서버 실행 성공


