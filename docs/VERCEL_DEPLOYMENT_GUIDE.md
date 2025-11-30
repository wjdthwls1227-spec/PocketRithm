# Vercel 배포 가이드

## 📋 Vercel에 배포하기 전 확인사항

### 1. 필수 환경 변수 설정

Vercel 대시보드 → 프로젝트 설정 → Environment Variables에서 다음 변수들을 추가해야 합니다:

#### 필수 변수 (반드시 설정 필요)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### 선택적 변수 (기능 사용 시 필요)

```env
# 구글 OAuth 사용 시
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI 기능 사용 시
OPENAI_API_KEY=your_openai_api_key
# 또는
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Vercel 설정 화면에서 설정할 항목

#### Framework Preset
- ✅ **Next.js** (자동 감지됨)

#### Root Directory
- ✅ **./** (기본값, 변경 불필요)

#### Build and Output Settings
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

#### Environment Variables
- 위의 필수 환경 변수들을 모두 추가

### 3. 환경 변수 추가 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**
   - "Add New" 클릭
   - 각 환경 변수 추가:
     - **Key**: 변수 이름 (예: `NEXT_PUBLIC_SUPABASE_URL`)
     - **Value**: 변수 값
     - **Environment**: Production, Preview, Development 모두 선택

3. **저장 후 재배포**
   - 환경 변수 추가 후 자동으로 재배포되거나
   - 수동으로 "Redeploy" 클릭

### 4. Supabase 설정 확인

#### 리디렉션 URL 추가
Vercel 배포 후 Supabase에 프로덕션 URL을 추가해야 합니다:

1. **Supabase 대시보드**
   - Authentication → URL Configuration
   - **Redirect URLs**에 추가:
     ```
     https://your-domain.vercel.app/auth/callback
     https://your-domain.com/auth/callback (커스텀 도메인 사용 시)
     ```

2. **Site URL 업데이트**
   - **Site URL**: `https://your-domain.vercel.app` 또는 커스텀 도메인

### 5. 구글 OAuth 설정 (구글 로그인 사용 시)

#### Google Cloud Console
1. **승인된 리디렉션 URI 추가**
   - Google Cloud Console → 사용자 인증 정보
   - OAuth 2.0 클라이언트 ID 편집
   - 다음 URL 추가:
     ```
     https://your-domain.vercel.app/auth/callback
     https://your-domain.com/auth/callback (커스텀 도메인 사용 시)
     ```

### 6. 배포 후 확인사항

1. **홈페이지 접속 확인**
   - `https://your-domain.vercel.app` 접속
   - 랜딩페이지가 정상적으로 표시되는지 확인

2. **로그인/회원가입 테스트**
   - 회원가입 → 이메일 인증
   - 로그인
   - 구글 로그인 (설정한 경우)

3. **대시보드 접속 확인**
   - 로그인 후 대시보드 접속
   - 데이터 로드 확인

4. **콘솔 오류 확인**
   - 브라우저 개발자 도구 (F12)
   - Console 탭에서 오류 확인
   - Network 탭에서 API 요청 확인

## ⚠️ 주의사항

### 환경 변수 보안
- ✅ `.env.local`은 Git에 커밋되지 않음 (`.gitignore`에 포함)
- ✅ Vercel 환경 변수는 암호화되어 저장됨
- ⚠️ `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에 노출됨
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용 (클라이언트에 노출 금지)

### 프로덕션 vs 개발 환경
- **Production**: 프로덕션 도메인에서 사용
- **Preview**: PR/브랜치별 배포에서 사용
- **Development**: 로컬 개발 환경에서 사용

## 🚀 빠른 배포 체크리스트

- [ ] Vercel에 GitHub 리포지토리 연결
- [ ] Framework Preset: Next.js 확인
- [ ] Root Directory: ./ 확인
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 환경 변수 추가
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 추가
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 환경 변수 추가
- [ ] `NEXT_PUBLIC_APP_URL` 환경 변수 추가 (Vercel 도메인 또는 커스텀 도메인)
- [ ] Supabase 리디렉션 URL 업데이트
- [ ] 구글 OAuth 리디렉션 URL 업데이트 (구글 로그인 사용 시)
- [ ] 배포 후 테스트

## 📝 환경 변수 예시

### Production 환경
```env
NEXT_PUBLIC_SUPABASE_URL=https://kxoydaogtvkmjpoztnid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://pocketrithm.vercel.app
```

### 커스텀 도메인 사용 시
```env
NEXT_PUBLIC_APP_URL=https://pocketrithm.com
```

## 🔗 유용한 링크

- Vercel 대시보드: https://vercel.com/dashboard
- Supabase 대시보드: https://supabase.com/dashboard
- Google Cloud Console: https://console.cloud.google.com


