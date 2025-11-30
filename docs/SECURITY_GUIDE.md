# 포켓리즘 보안 가이드

## 현재 보안 상태

### ✅ 이미 구현된 보안 기능

1. **인증 시스템**
   - Supabase Auth 사용 (업계 표준)
   - 이메일 인증 필수
   - OAuth (Google) 지원

2. **데이터베이스 보안**
   - Row Level Security (RLS) 활성화
   - 사용자별 데이터 격리
   - SQL Injection 방지 (Supabase 자동 처리)

3. **쿠키 보안**
   - `httpOnly` 설정 (JavaScript 접근 차단)
   - `secure` 설정 (HTTPS 전용)
   - `sameSite: 'lax'` 설정 (CSRF 방지)

4. **세션 관리**
   - 자동 토큰 갱신
   - 세션 만료 시간 설정 (30일)

## 🔒 추가로 구현해야 할 보안 기능

### 1. 비밀번호 정책 강화 (우선순위: 높음)

**현재 상태**: 최소 6자만 요구

**개선 방안**:
```typescript
// app/(auth)/signup/page.tsx에 추가
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.'
  }
  if (!/[A-Z]/.test(password)) {
    return '비밀번호에 대문자가 포함되어야 합니다.'
  }
  if (!/[a-z]/.test(password)) {
    return '비밀번호에 소문자가 포함되어야 합니다.'
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자가 포함되어야 합니다.'
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return '비밀번호에 특수문자(!@#$%^&*)가 포함되어야 합니다.'
  }
  return null
}
```

**Supabase 설정**:
1. Supabase Dashboard → Authentication → Settings
2. Password Requirements 설정:
   - Minimum length: 8
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
   - Require special characters: Yes

### 2. 로그인 시도 제한 (Rate Limiting) (우선순위: 높음)

**현재 상태**: Supabase 기본 제한만 적용

**개선 방안**:
- Supabase Dashboard → Authentication → Settings
- Rate Limits 설정:
  - Max requests per hour: 10 (로그인 시도)
  - Max requests per minute: 5

**추가 구현** (클라이언트 측):
```typescript
// 로그인 실패 횟수 추적
const [failedAttempts, setFailedAttempts] = useState(0)
const [isLocked, setIsLocked] = useState(false)

// 5회 실패 시 15분 잠금
if (failedAttempts >= 5) {
  setIsLocked(true)
  setTimeout(() => {
    setIsLocked(false)
    setFailedAttempts(0)
  }, 15 * 60 * 1000) // 15분
}
```

### 3. 2단계 인증 (2FA) (우선순위: 중간)

**구현 방법**:
1. Supabase Dashboard → Authentication → Settings
2. Enable 2FA 활성화
3. TOTP (Time-based One-Time Password) 설정

**코드 추가**:
```typescript
// 2FA 활성화
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My Authenticator App'
})

// 2FA 검증
const { data, error } = await supabase.auth.mfa.verify({
  factorId: factorId,
  code: code
})
```

### 4. 세션 보안 강화 (우선순위: 중간)

**현재 상태**: 30일 자동 로그인

**개선 방안**:
- 민감한 작업 시 재인증 요구
- 비정상적인 로그인 감지 (새로운 기기/위치)
- 세션 타임아웃 설정

```typescript
// middleware.ts 수정
const cookieOptions = {
  ...options,
  maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7일로 단축
  httpOnly: options?.httpOnly ?? true,
  secure: options?.secure ?? true, // 항상 true
  sameSite: 'strict' as const, // 'lax'에서 'strict'로 변경
}
```

### 5. CSRF 보호 강화 (우선순위: 중간)

**현재 상태**: `sameSite: 'lax'` 설정됨

**개선 방안**:
- CSRF 토큰 추가
- SameSite를 'strict'로 변경 (가능한 경우)

### 6. XSS 방지 (우선순위: 높음)

**현재 상태**: React의 기본 XSS 방지

**개선 방안**:
- 사용자 입력 데이터 sanitization
- Content Security Policy (CSP) 헤더 추가

**next.config.js에 추가**:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        }
      ]
    }
  ]
}
```

### 7. 환경 변수 보안 (우선순위: 높음)

**확인 사항**:
- ✅ `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- ✅ 프로덕션 환경 변수가 안전하게 관리되는지 확인
- ✅ Supabase Service Role Key는 절대 클라이언트에 노출되지 않도록 주의

**체크리스트**:
```bash
# .gitignore 확인
cat .gitignore | grep .env

# 환경 변수 파일 확인 (민감한 정보가 커밋되지 않았는지)
git log --all --full-history -- .env*
```

### 8. 로그 보안 (우선순위: 낮음)

**개선 방안**:
- 민감한 정보(비밀번호, 토큰 등) 로그에 기록하지 않기
- 프로덕션 환경에서 디버그 로그 비활성화

```typescript
// lib/logger.ts 생성
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data)
    }
  },
  error: (message: string, error?: any) => {
    // 프로덕션에서는 에러 추적 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket 등으로 전송
    } else {
      console.error(message, error)
    }
  }
}
```

### 9. 비밀번호 재설정 보안 (우선순위: 높음)

**확인 사항**:
- 비밀번호 재설정 링크 만료 시간 설정
- 재설정 링크는 한 번만 사용 가능하도록 설정

**Supabase 설정**:
- Password Reset Token Expiry: 1 hour (기본값)

### 10. 계정 잠금 기능 (우선순위: 중간)

**구현 방법**:
- 연속된 로그인 실패 시 계정 일시 잠금
- 관리자에게 알림 전송

## 🛡️ Supabase 보안 설정 체크리스트

### Authentication Settings
- [ ] Email confirmation required: **Enabled**
- [ ] Password requirements: **강화된 정책 적용**
- [ ] Rate limiting: **적절히 설정**
- [ ] 2FA: **활성화 고려**
- [ ] Session timeout: **설정 확인**

### Database Settings
- [ ] RLS enabled: **✅ 확인됨**
- [ ] API keys rotation: **정기적으로 변경**
- [ ] Database backups: **자동 백업 설정 확인**

### Network Security
- [ ] HTTPS only: **✅ 확인됨 (프로덕션)**
- [ ] Allowed origins: **설정 확인**
- [ ] CORS settings: **적절히 설정**

## 📋 보안 점검 일정

### 매일
- [ ] 로그 모니터링 (비정상적인 로그인 시도)
- [ ] 에러 로그 확인

### 매주
- [ ] 사용자 활동 로그 검토
- [ ] 보안 알림 확인

### 매월
- [ ] 의존성 업데이트 및 보안 패치 적용
- [ ] API 키 로테이션 검토
- [ ] 보안 정책 재검토

### 분기별
- [ ] 보안 감사
- [ ] 침투 테스트
- [ ] 백업 복원 테스트

## 🚨 보안 사고 대응 절차

1. **즉시 조치**
   - 영향을 받은 계정 비활성화
   - 관련 세션 무효화
   - Supabase에서 해당 사용자 세션 강제 종료

2. **조사**
   - 로그 분석
   - 침해 범위 확인
   - 취약점 식별

3. **복구**
   - 취약점 패치
   - 사용자 알림
   - 비밀번호 재설정 요구

4. **예방**
   - 추가 보안 조치 구현
   - 정책 업데이트

## 📞 보안 관련 연락처

- Supabase Support: https://supabase.com/support
- 보안 취약점 신고: security@pocketrithm.kr (설정 필요)

## 🔗 참고 자료

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

