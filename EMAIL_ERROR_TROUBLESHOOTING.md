# 이메일 발송 오류 해결 가이드

## ❌ "Error sending confirmation email" 오류

이 오류는 Supabase에서 인증 이메일을 보내는 과정에서 문제가 발생했을 때 나타납니다.

## 🔍 가능한 원인 및 해결 방법

### 1. Supabase 프로젝트 설정 확인

**확인 사항:**
1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → Settings 확인**
   - **Email Auth** 활성화되어 있는지 확인
   - **Confirm email** 옵션이 켜져 있는지 확인

3. **Rate Limiting 확인**
   - 너무 많은 이메일을 짧은 시간에 보냈을 수 있습니다
   - 잠시 기다린 후 다시 시도

### 2. 이메일 템플릿 오류

**확인 사항:**
1. **Authentication → Email Templates**
2. **Confirm signup** 템플릿 확인
3. 템플릿에 문법 오류가 없는지 확인
4. 필수 변수 `{{ .ConfirmationURL }}`이 포함되어 있는지 확인

**해결 방법:**
- 템플릿을 기본값으로 리셋 후 다시 수정
- HTML 문법 오류 확인

### 3. Supabase 프로젝트 상태 확인

**확인 사항:**
1. **프로젝트가 일시정지되었는지 확인**
   - Supabase 대시보드에서 프로젝트 상태 확인
   - 무료 플랜의 경우 일시정지될 수 있음

2. **프로젝트 재시작**
   - 프로젝트가 일시정지된 경우 재시작 필요

### 4. 개발 환경에서 이메일 인증 비활성화 (임시 해결책)

개발 중이라면 이메일 인증을 임시로 비활성화할 수 있습니다:

1. **Supabase 대시보드**
   - **Authentication** → **Providers** → **Email**
   - **"Confirm email"** 옵션을 **OFF**로 변경
   - 저장

2. **주의사항**
   - 개발 환경에서만 사용
   - 프로덕션에서는 보안을 위해 이메일 인증 활성화 권장

### 5. Supabase 로그 확인

1. **Supabase 대시보드**
   - **Logs** → **Auth Logs** 확인
   - 오류 메시지의 상세 내용 확인

### 6. 코드에서 오류 처리 개선

회원가입 페이지에서 더 자세한 오류 메시지를 표시하도록 개선:

```typescript
if (signUpError) {
  // 이메일 발송 오류인 경우
  if (signUpError.message.includes('email') || signUpError.message.includes('confirmation')) {
    setError('이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } else {
    setError(signUpError.message)
  }
  setLoading(false)
  return
}
```

## 🚀 빠른 해결 방법

### 방법 1: 이메일 인증 비활성화 (개발용)

1. Supabase 대시보드 → Authentication → Providers → Email
2. "Confirm email" OFF
3. 저장
4. 회원가입 후 바로 로그인 가능

### 방법 2: 이메일 템플릿 리셋

1. Authentication → Email Templates
2. Confirm signup 템플릿
3. "Reset to default" 클릭
4. 저장
5. 다시 테스트

### 방법 3: 프로젝트 재시작

1. Supabase 대시보드 → Settings → General
2. 프로젝트 재시작 (일시정지된 경우)

## 📧 이메일 발송 제한

Supabase 무료 플랜의 경우:
- 시간당 이메일 발송 제한이 있을 수 있습니다
- 너무 많은 요청을 보내면 일시적으로 차단될 수 있습니다
- 잠시 기다린 후 다시 시도

## ✅ 확인 체크리스트

- [ ] Supabase 프로젝트가 활성화되어 있는가?
- [ ] Email Auth가 활성화되어 있는가?
- [ ] 이메일 템플릿에 문법 오류가 없는가?
- [ ] Rate limiting에 걸리지 않았는가?
- [ ] 네트워크 연결이 정상인가?

## 💡 권장 사항

개발 환경에서는:
- 이메일 인증을 비활성화하여 빠르게 테스트
- 프로덕션 배포 전에 이메일 인증 활성화

프로덕션 환경에서는:
- 커스텀 SMTP 설정 (더 안정적)
- 이메일 발송 모니터링
- 오류 로그 정기적 확인

