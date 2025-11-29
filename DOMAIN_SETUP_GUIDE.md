# 도메인 설정 가이드 (www.pocketrithm.kr)

`www.pocketrithm.kr` 도메인을 구매하셨으니 다음 항목들을 업데이트해야 합니다.

## 📋 업데이트 체크리스트

### 1. Vercel 환경 변수 업데이트

**위치**: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

다음 환경 변수를 업데이트하세요:

```env
NEXT_PUBLIC_APP_URL=https://www.pocketrithm.kr
```

**업데이트 방법**:
1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. Settings → Environment Variables
4. `NEXT_PUBLIC_APP_URL` 찾기
5. Value를 `https://www.pocketrithm.kr`로 변경
6. Save 클릭
7. **중요**: 배포를 다시 트리거해야 변경사항이 적용됩니다 (Redeploy)

### 2. Vercel 도메인 연결

**위치**: Vercel 대시보드 → 프로젝트 → Settings → Domains

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. `www.pocketrithm.kr` 입력
4. "Add" 클릭
5. DNS 설정 안내를 따라 도메인 제공업체에서 DNS 레코드 추가:
   - **A 레코드** 또는 **CNAME 레코드** 추가
   - Vercel이 제공하는 DNS 값 사용
6. DNS 전파 대기 (보통 몇 분~24시간)

### 3. Supabase 설정 업데이트

**위치**: Supabase 대시보드 → Authentication → URL Configuration

#### 3-1. Site URL 업데이트
1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. Authentication → URL Configuration
4. **Site URL**을 다음으로 변경:
   ```
   https://www.pocketrithm.kr
   ```

#### 3-2. Redirect URLs 추가
**Redirect URLs** 섹션에 다음 URL들을 추가:

```
https://www.pocketrithm.kr/auth/callback
https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback
```

**기존 URL 유지**:
- 기존에 있던 Supabase URL (`https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback`)은 그대로 유지
- 새 도메인 URL만 추가

### 4. Google OAuth 설정 업데이트

**위치**: Google Cloud Console → API 및 서비스 → 사용자 인증 정보

#### 4-1. OAuth 2.0 클라이언트 ID 편집
1. Google Cloud Console 접속: https://console.cloud.google.com
2. 프로젝트 선택
3. API 및 서비스 → 사용자 인증 정보
4. OAuth 2.0 클라이언트 ID (PocketRithm) 클릭 또는 편집
5. **승인된 리디렉션 URI**에 다음 추가:
   ```
   https://www.pocketrithm.kr/auth/callback
   ```
6. **저장** 클릭

**기존 URI 유지**:
- 기존 Supabase URL은 그대로 유지
- 새 도메인 URL만 추가

#### 4-2. OAuth 동의 화면 업데이트 (선택사항)
1. Google Cloud Console → API 및 서비스 → OAuth 동의 화면
2. **승인된 도메인**에 추가:
   ```
   pocketrithm.kr
   www.pocketrithm.kr
   ```
3. **승인된 리디렉션 URI**에 추가:
   ```
   https://www.pocketrithm.kr/auth/callback
   ```

### 5. 로컬 개발 환경 변수 (선택사항)

로컬 개발용 `.env.local` 파일이 있다면:

```env
NEXT_PUBLIC_APP_URL=https://www.pocketrithm.kr
```

**참고**: 로컬 개발 시에는 `http://localhost:3000`을 사용해도 되지만, 프로덕션과 동일하게 설정하는 것을 권장합니다.

### 6. SSL 인증서 확인

Vercel은 자동으로 SSL 인증서를 발급합니다:
- 도메인 연결 후 자동으로 HTTPS 설정됨
- 보통 몇 분~1시간 내 완료
- Vercel 대시보드에서 SSL 상태 확인 가능

## 🔄 업데이트 순서

1. ✅ **Vercel 도메인 연결** (DNS 설정 포함)
2. ✅ **Vercel 환경 변수 업데이트** (`NEXT_PUBLIC_APP_URL`)
3. ✅ **Supabase Site URL 및 Redirect URLs 업데이트**
4. ✅ **Google OAuth 리디렉션 URI 추가**
5. ✅ **배포 재실행** (Vercel에서 Redeploy)
6. ✅ **테스트**: `https://www.pocketrithm.kr` 접속 확인

## 🧪 테스트 체크리스트

배포 후 다음을 확인하세요:

- [ ] `https://www.pocketrithm.kr` 접속 가능
- [ ] 홈페이지 정상 표시
- [ ] 회원가입/로그인 작동
- [ ] 이메일 인증 링크가 새 도메인으로 전송되는지 확인
- [ ] Google 로그인 작동 (설정한 경우)
- [ ] 대시보드 접속 및 데이터 로드 확인

## ⚠️ 중요 사항

### DNS 전파 시간
- DNS 변경 후 전파되는데 **몇 분~24시간** 걸릴 수 있습니다
- 전파 완료 전에는 도메인이 작동하지 않을 수 있습니다

### HTTPS 자동 설정
- Vercel이 자동으로 SSL 인증서를 발급합니다
- 도메인 연결 후 몇 분~1시간 내 완료됩니다

### 기존 URL 유지
- Supabase URL (`https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback`)은 **그대로 유지**하세요
- 새 도메인 URL만 추가하면 됩니다

### 환경 변수 적용
- Vercel 환경 변수 변경 후 **반드시 재배포**해야 적용됩니다
- Settings → Deployments → 최신 배포의 "..." 메뉴 → Redeploy

## 📝 참고 URL 목록

### 프로덕션 URL
- 앱 URL: `https://www.pocketrithm.kr`
- 콜백 URL: `https://www.pocketrithm.kr/auth/callback`

### Supabase URL (유지)
- Site URL: `https://www.pocketrithm.kr`
- Redirect URL: `https://kxoydaogtvkmjpoztnid.supabase.co/auth/v1/callback` (기존 유지)
- Redirect URL: `https://www.pocketrithm.kr/auth/callback` (새로 추가)

### Google OAuth URL (추가)
- `https://www.pocketrithm.kr/auth/callback`

## 🔗 유용한 링크

- Vercel 대시보드: https://vercel.com/dashboard
- Supabase 대시보드: https://supabase.com/dashboard
- Google Cloud Console: https://console.cloud.google.com
- DNS 확인 도구: https://dnschecker.org

## 💡 문제 해결

### 도메인이 작동하지 않는 경우
1. DNS 전파 확인: https://dnschecker.org 에서 확인
2. Vercel 도메인 설정 확인: Settings → Domains
3. SSL 인증서 발급 대기 (보통 자동)

### 리디렉션 오류가 발생하는 경우
1. Supabase Redirect URLs에 새 도메인 추가 확인
2. Google OAuth 리디렉션 URI 추가 확인
3. 환경 변수 `NEXT_PUBLIC_APP_URL` 확인
4. 배포 재실행 확인

### 이메일 인증 링크가 작동하지 않는 경우
1. Supabase Site URL이 새 도메인으로 설정되었는지 확인
2. 이메일 템플릿의 링크가 새 도메인을 사용하는지 확인

