# 구글 로그인 오류 해결 가이드

## ❌ 오류: "Unsupported provider: missing OAuth secret"

이 오류는 Supabase에서 구글 OAuth Provider가 제대로 설정되지 않았을 때 발생합니다.

## 🔍 해결 방법

### 1단계: Supabase 대시보드에서 구글 Provider 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → Providers**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **Providers** 메뉴 클릭

3. **Google Provider 확인**
   - **Google** 섹션 찾기
   - **"Enable Google provider"** 토글이 **ON**인지 확인
   - 만약 OFF라면 **ON**으로 변경

### 2단계: Client ID와 Client Secret 확인

**Google Provider 설정에서 다음을 확인:**

1. **Client ID (for OAuth)**
   - Google Cloud Console에서 복사한 **클라이언트 ID**가 입력되어 있는지 확인
   - 비어있거나 잘못된 값이면 다시 입력

2. **Client Secret (for OAuth)**
   - ⚠️ **가장 중요한 부분!**
   - Google Cloud Console에서 복사한 **클라이언트 보안 비밀번호**가 입력되어 있는지 확인
   - 이 필드가 비어있으면 위 오류가 발생합니다
   - 비어있다면 Google Cloud Console에서 다시 복사하여 입력

3. **저장**
   - 모든 정보를 입력한 후 **Save** 버튼 클릭

### 3단계: Google Cloud Console에서 Client Secret 확인

만약 Client Secret을 잃어버렸다면:

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - 프로젝트 선택

2. **API 및 서비스 → 사용자 인증 정보**
   - 왼쪽 메뉴에서 **"API 및 서비스"** → **"사용자 인증 정보"** 클릭

3. **OAuth 2.0 클라이언트 ID 확인**
   - 생성한 OAuth 2.0 클라이언트 ID 클릭
   - **클라이언트 보안 비밀번호** 확인
   - ⚠️ **주의**: Client Secret은 한 번만 표시되며, 이후에는 다시 볼 수 없습니다
   - 만약 잃어버렸다면 **새로 생성**해야 합니다

4. **새 Client Secret 생성 (필요한 경우)**
   - OAuth 2.0 클라이언트 ID 편집
   - **"키 다시 만들기"** 또는 **"새 키 생성"** 클릭
   - 생성된 새 Client Secret을 복사
   - Supabase에 새로 입력

### 4단계: Supabase 설정 재확인

1. **Supabase → Authentication → Providers → Google**
2. 다음 정보가 모두 입력되어 있는지 확인:
   - ✅ Enable Google provider: **ON**
   - ✅ Client ID (for OAuth): **입력됨**
   - ✅ Client Secret (for OAuth): **입력됨** (⚠️ 가장 중요!)
3. **Save** 클릭

### 5단계: 테스트

1. **앱에서 구글 로그인 버튼 클릭**
2. **구글 로그인 화면이 나타나는지 확인**
3. **로그인 후 리디렉션이 정상적으로 작동하는지 확인**

## ⚠️ 주의사항

### Client Secret 보안
- Client Secret은 절대 공개하지 마세요
- Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- Vercel 환경 변수로 관리하는 것이 좋습니다 (하지만 Supabase에서 직접 설정하는 것이 더 간단)

### Supabase vs Vercel 환경 변수
- 구글 OAuth는 **Supabase 대시보드에서 직접 설정**합니다
- Vercel 환경 변수에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`을 추가할 필요는 없습니다
- Supabase가 OAuth를 처리하므로 Supabase 설정만 필요합니다

## 🔄 빠른 체크리스트

- [ ] Supabase → Authentication → Providers → Google
- [ ] Enable Google provider: **ON** 확인
- [ ] Client ID (for OAuth): **입력됨** 확인
- [ ] Client Secret (for OAuth): **입력됨** 확인 (⚠️ 가장 중요!)
- [ ] Save 버튼 클릭
- [ ] Google Cloud Console에서 Client Secret 확인 (필요한 경우)
- [ ] 새로 생성한 경우 Supabase에 다시 입력
- [ ] 구글 로그인 테스트

## 💡 추가 팁

### Client Secret을 잃어버린 경우
1. Google Cloud Console에서 새로 생성
2. Supabase에 새 Client Secret 입력
3. 기존 Client Secret은 자동으로 무효화됨

### 여러 환경에서 사용하는 경우
- 개발 환경과 프로덕션 환경에서 다른 OAuth 클라이언트를 사용할 수 있습니다
- 각각의 Client ID와 Client Secret을 Supabase에 설정
- 또는 동일한 OAuth 클라이언트를 사용하고 리디렉션 URI만 추가

## 📝 설정 예시

**Supabase Google Provider 설정:**
```
Enable Google provider: ✅ ON
Client ID (for OAuth): 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret (for OAuth): GOCSPX-abcdefghijklmnopqrstuvwxyz
```

이 두 값이 모두 입력되어 있어야 정상 작동합니다!

