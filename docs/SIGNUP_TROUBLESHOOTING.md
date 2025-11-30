# 회원가입 문제 해결 가이드

## ❌ 문제: 회원가입 후 이메일이 안 가고 Authentication에 데이터가 안 들어감

이 문제는 여러 원인이 있을 수 있습니다. 아래 순서대로 확인해보세요.

## 🔍 1단계: Supabase 프로젝트 상태 확인

### 프로젝트가 일시정지되었는지 확인
1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **프로젝트 상태 확인**
   - 프로젝트가 **Paused** 상태인지 확인
   - 일시정지된 경우 **Resume** 또는 **Restore** 클릭
   - 프로젝트가 활성화될 때까지 대기 (1-2분)

## 🔍 2단계: Authentication 설정 확인

1. **Authentication → Settings**
   - **Email Auth** 활성화되어 있는지 확인
   - **Enable email signup** 옵션이 켜져 있는지 확인

2. **Authentication → Providers → Email**
   - **Enable Email provider** 활성화 확인
   - **Confirm email** 설정 확인 (ON/OFF)

## 🔍 3단계: 환경 변수 확인

`.env.local` 파일에 다음이 올바르게 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**확인 방법:**
1. Supabase 대시보드 → Settings → API
2. Project URL과 anon public key 복사
3. `.env.local` 파일과 비교

## 🔍 4단계: 브라우저 콘솔 확인

1. **개발자 도구 열기** (F12)
2. **Console 탭** 확인
3. 회원가입 시도 시 오류 메시지 확인
4. **Network 탭**에서 API 요청 확인

## 🔍 5단계: Supabase 로그 확인

1. **Supabase 대시보드 → Logs**
2. **Auth Logs** 확인
3. 회원가입 시도 시 오류 로그 확인

## 🔍 6단계: 코드 오류 확인

회원가입 페이지에서 더 자세한 오류 정보를 확인할 수 있도록 코드를 개선했습니다.

## 🚀 빠른 해결 방법

### 방법 1: 이메일 인증 비활성화 (개발용)

1. **Authentication → Providers → Email**
2. **"Confirm email"** 옵션을 **OFF**로 변경
3. 저장
4. 회원가입 다시 시도

이렇게 하면 이메일 확인 없이 바로 회원가입됩니다.

### 방법 2: 프로젝트 재시작

1. Supabase 대시보드 → Settings → General
2. 프로젝트 재시작 (일시정지된 경우)

### 방법 3: 환경 변수 재확인

1. `.env.local` 파일 확인
2. Supabase URL과 Key가 올바른지 확인
3. 개발 서버 재시작:
   ```bash
   # 개발 서버 중지 (Ctrl+C)
   npm run dev
   ```

## 📋 체크리스트

- [ ] Supabase 프로젝트가 활성화되어 있는가?
- [ ] Email Auth가 활성화되어 있는가?
- [ ] 환경 변수가 올바르게 설정되어 있는가?
- [ ] 브라우저 콘솔에 오류가 없는가?
- [ ] Supabase 로그에 오류가 없는가?
- [ ] 개발 서버가 재시작되었는가?

## 💡 추가 디버깅

회원가입 페이지에서 더 자세한 오류 정보를 확인할 수 있도록 개선했습니다. 
오류 메시지를 확인하여 정확한 원인을 파악하세요.


