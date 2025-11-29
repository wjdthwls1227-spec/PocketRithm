# Google OAuth redirect_uri_mismatch 오류 해결 가이드

## ❌ 오류: "400 오류: redirect_uri_mismatch"

이 오류는 Google Cloud Console에 등록된 리디렉션 URI와 Supabase가 실제로 사용하는 URI가 일치하지 않을 때 발생합니다.

## 🔍 해결 방법

### 1단계: Supabase에서 실제 리디렉션 URL 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → URL Configuration**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **URL Configuration** 메뉴 클릭

3. **Site URL 확인**
   - **Site URL** 필드의 값 확인
   - 예: `https://kxoydaogtvkmjpoztnid.supabase.co`

4. **Redirect URLs 확인**
   - **Redirect URLs** 섹션에 표시된 URL 확인
   - 이 URL이 Google Cloud Console에 정확히 등록되어 있어야 합니다

### 2단계: Google Cloud Console에 리디렉션 URI 추가

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - 프로젝트 선택

2. **API 및 서비스 → 사용자 인증 정보**
   - 왼쪽 메뉴에서 **"API 및 서비스"** 클릭
   - **"사용자 인증 정보"** 메뉴 클릭

3. **OAuth 2.0 클라이언트 ID 편집**
   - "PocketRithm" 클라이언트 ID 클릭
   - 또는 오른쪽의 **연필 아이콘(편집)** 클릭

4. **승인된 리디렉션 URI 확인 및 추가**
   - **"승인된 리디렉션 URI"** 섹션 확인
   - Supabase에서 확인한 정확한 URL이 있는지 확인
   - 없다면 **"+ Add URI"** 클릭하여 추가

### 3단계: 필요한 리디렉션 URI 목록

다음 URL들을 모두 추가해야 합니다:

#### 개발 환경
```
https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback
```

#### 프로덕션 환경 (Vercel 배포 후)
```
https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback
https://pocket-rithm.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback (커스텀 도메인 사용 시)
```

### 4단계: 로컬 개발 환경용 (선택사항)

로컬에서도 테스트하려면:
```
http://localhost:3000/auth/callback
```

하지만 Supabase를 통한 OAuth는 Supabase URL을 사용하므로, 위의 Supabase URL만 추가하면 됩니다.

## ⚠️ 중요 사항

### 정확한 URL 형식
- Supabase 리디렉션 URL 형식: `https://[프로젝트ID].supabase.co/auth/v1/callback`
- 프로젝트 ID는 Supabase 대시보드 → Settings → API에서 확인 가능
- **정확히 일치**해야 합니다 (대소문자, 슬래시 포함)

### URL 확인 방법
1. Supabase → Authentication → URL Configuration
2. **Redirect URLs** 섹션에 표시된 URL 복사
3. Google Cloud Console에 **정확히 동일하게** 추가

### 설정 적용 시간
- Google Cloud Console에서 설정 변경 후 **5분에서 몇 시간** 걸릴 수 있습니다
- 즉시 적용되지 않으면 잠시 기다린 후 다시 시도

## 🔄 빠른 해결 체크리스트

- [ ] Supabase → Authentication → URL Configuration에서 Redirect URL 확인
- [ ] Google Cloud Console → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 편집
- [ ] "승인된 리디렉션 URI"에 Supabase URL 추가
- [ ] 형식이 정확히 일치하는지 확인 (`/auth/v1/callback` 포함)
- [ ] Save 클릭
- [ ] 5분 정도 기다린 후 다시 테스트

## 💡 추가 팁

### 여러 환경 관리
- 개발 환경: `https://[프로젝트ID].supabase.co/auth/v1/callback`
- 프로덕션 환경: Vercel URL도 추가 (필요한 경우)
- 모든 URL을 한 번에 추가해두면 편리합니다

### 오류가 계속 발생하는 경우
1. Supabase URL Configuration에서 정확한 URL 다시 확인
2. Google Cloud Console의 리디렉션 URI와 **완전히 동일한지** 확인
3. 대소문자, 슬래시, 프로토콜(https) 모두 확인
4. 설정 저장 후 몇 분 기다린 후 재시도

