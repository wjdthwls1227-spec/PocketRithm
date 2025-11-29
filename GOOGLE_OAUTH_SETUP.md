# 구글 로그인 설정 가이드

## 📋 Supabase에서 구글 OAuth 설정하기

### 1단계: Google Cloud Console에서 OAuth 클라이언트 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com 접속
   - Google 계정으로 로그인

2. **프로젝트 생성 또는 선택**
   - 상단에서 프로젝트 선택 또는 새 프로젝트 생성
   - 프로젝트 이름 입력 (예: "PocketRism")

3. **OAuth 동의 화면 설정**
   - 왼쪽 메뉴에서 **"API 및 서비스"** → **"OAuth 동의 화면"** 클릭
   - 사용자 유형 선택: **"외부"** 선택 (개인 개발자용)
   - 앱 정보 입력:
     - **앱 이름**: 포켓리즘 (PocketRism)
     - **사용자 지원 이메일**: wjdthwls12@naver.com
     - **앱 로고**: (선택사항)
   - 개발자 연락처 정보 입력
   - **저장 후 계속** 클릭

4. **범위 설정**
   - 기본 범위는 그대로 두고 **"저장 후 계속"** 클릭

5. **테스트 사용자 추가** (개발 중)
   - 테스트 사용자 섹션에서 자신의 이메일 추가
   - **저장 후 계속** 클릭

6. **요약 확인**
   - 설정 확인 후 **"대시보드로 돌아가기"** 클릭

### 2단계: OAuth 2.0 클라이언트 ID 생성

1. **사용자 인증 정보 생성**
   - 왼쪽 메뉴에서 **"API 및 서비스"** → **"사용자 인증 정보"** 클릭
   - 상단의 **"+ 사용자 인증 정보 만들기"** → **"OAuth 클라이언트 ID"** 선택

2. **애플리케이션 유형 선택**
   - **애플리케이션 유형**: **"웹 애플리케이션"** 선택
   - **이름**: PocketRism Web Client (또는 원하는 이름)

3. **승인된 리디렉션 URI 추가**
   - **승인된 리디렉션 URI** 섹션에서 **"+ URI 추가"** 클릭
   - 다음 형식으로 입력:
     ```
     https://[프로젝트ID].supabase.co/auth/v1/callback
     ```
   - 예시: `https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback`
   - **만들기** 클릭

4. **클라이언트 ID와 비밀번호 복사**
   - 생성된 **클라이언트 ID** 복사
   - 생성된 **클라이언트 보안 비밀번호** 복사
   - ⚠️ 이 정보는 나중에 다시 볼 수 없으니 안전하게 보관하세요!

### 3단계: Supabase에서 구글 Provider 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → Providers**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **Providers** 메뉴 클릭

3. **Google Provider 활성화**
   - **Google** 섹션 찾기
   - **"Enable Google provider"** 토글을 **ON**으로 변경

4. **클라이언트 정보 입력**
   - **Client ID (for OAuth)**: Google Cloud Console에서 복사한 클라이언트 ID 입력
   - **Client Secret (for OAuth)**: Google Cloud Console에서 복사한 클라이언트 보안 비밀번호 입력

5. **저장**
   - 페이지 하단 또는 상단의 **Save** 버튼 클릭

### 4단계: 리디렉션 URL 확인

Supabase 대시보드에서 제공하는 리디렉션 URL을 확인하고, Google Cloud Console에 추가해야 합니다:

1. **Supabase → Authentication → URL Configuration**
   - **Redirect URLs** 섹션 확인
   - 표시된 URL을 복사

2. **Google Cloud Console에 추가**
   - Google Cloud Console → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID
   - 편집 버튼 클릭
   - **승인된 리디렉션 URI**에 Supabase URL 추가
   - 저장

### 5단계: 테스트

1. **앱에서 구글 로그인 버튼 클릭**
   - 로그인 또는 회원가입 페이지에서 "구글로 로그인" 버튼 클릭

2. **구글 계정 선택**
   - 구글 로그인 화면에서 계정 선택
   - 권한 승인

3. **리디렉션 확인**
   - 자동으로 `/auth/callback`으로 리디렉션
   - 대시보드로 이동하는지 확인

## ⚠️ 주의사항

### 개발 환경
- Google Cloud Console에서 **테스트 사용자**로 등록된 이메일만 로그인 가능
- 프로덕션 배포 전에 OAuth 동의 화면을 **검토 요청**해야 합니다

### 프로덕션 배포
1. **OAuth 동의 화면 검토 요청**
   - Google Cloud Console → OAuth 동의 화면
   - **"검토 요청"** 버튼 클릭
   - Google 검토 완료까지 1-2주 소요

2. **승인된 리디렉션 URI 업데이트**
   - 프로덕션 도메인 추가
   - 예: `https://yourdomain.com/auth/callback`

## 🔍 문제 해결

### 문제: "redirect_uri_mismatch" 오류
- **원인**: Google Cloud Console의 리디렉션 URI와 Supabase 설정이 일치하지 않음
- **해결**: 
  1. Supabase → Authentication → URL Configuration에서 정확한 URL 확인
  2. Google Cloud Console에 정확히 동일한 URL 추가

### 문제: "access_denied" 오류
- **원인**: 테스트 사용자로 등록되지 않음 (개발 중)
- **해결**: Google Cloud Console → OAuth 동의 화면 → 테스트 사용자에 이메일 추가

### 문제: 로그인 후 대시보드로 이동하지 않음
- **원인**: `/auth/callback` 라우트 문제
- **해결**: `app/auth/callback/route.ts` 파일 확인

## 📝 체크리스트

- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] OAuth 동의 화면 설정 완료
- [ ] OAuth 2.0 클라이언트 ID 생성
- [ ] 승인된 리디렉션 URI에 Supabase URL 추가
- [ ] Supabase에서 Google Provider 활성화
- [ ] Client ID와 Client Secret 입력
- [ ] 테스트 사용자 추가 (개발 중)
- [ ] 구글 로그인 테스트 완료

## 💡 추가 정보

- 구글 로그인은 이메일/비밀번호 로그인과 동일한 계정으로 사용됩니다
- 구글 로그인 시 자동으로 프로필이 생성됩니다
- 구글 계정의 이름과 이메일이 자동으로 저장됩니다

