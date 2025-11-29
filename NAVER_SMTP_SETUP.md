# 네이버 SMTP 설정 가이드

## 네이버 SMTP 설정 확인사항

네이버 SMTP를 사용할 때 주의해야 할 사항들:

### 1. 네이버 메일 SMTP 설정

**올바른 설정:**
- **Host**: `smtp.naver.com`
- **Port**: `465` (SSL) 또는 `587` (TLS)
- **Username**: 네이버 이메일 주소 (예: `wjdthwls12@naver.com`)
- **Password**: 네이버 메일 비밀번호

### 2. 네이버 보안 설정 확인

네이버 메일에서 SMTP 사용을 허용해야 합니다:

1. **네이버 메일 접속**
   - https://mail.naver.com

2. **환경설정 → POP3/IMAP 설정**
   - "POP3/SMTP 사용" 활성화
   - "보안 메일(SMTP) 사용" 활성화

3. **2단계 인증 확인**
   - 2단계 인증이 활성화된 경우 앱 비밀번호 사용 필요
   - 일반 비밀번호로는 SMTP 접속이 안 될 수 있음

### 3. Supabase SMTP 설정 확인

Supabase 대시보드에서:

1. **Authentication → Settings → SMTP Settings**
2. 설정 확인:
   - **Host**: `smtp.naver.com`
   - **Port**: `465` (SSL 권장) 또는 `587` (TLS)
   - **Username**: `wjdthwls12@naver.com`
   - **Password**: 네이버 메일 비밀번호 (또는 앱 비밀번호)
   - **Sender Email**: `wjdthwls12@naver.com`
   - **Sender Name**: `회고리즘` (또는 `포켓리즘`)

### 4. 포트별 설정 차이

**포트 465 (SSL):**
- 암호화: SSL/TLS
- 연결 방식: 암호화된 연결

**포트 587 (TLS):**
- 암호화: STARTTLS
- 연결 방식: 일반 연결 후 암호화

**권장**: 포트 465 사용 (더 안정적)

### 5. 문제 해결

#### 문제: "Authentication failed" 또는 "Login failed"
- **원인**: 비밀번호가 잘못되었거나 2단계 인증 문제
- **해결**: 
  - 네이버 메일 비밀번호 확인
  - 앱 비밀번호 생성 후 사용 (2단계 인증 활성화된 경우)

#### 문제: "Connection timeout"
- **원인**: 포트가 차단되었거나 네트워크 문제
- **해결**: 
  - 포트 587로 변경 시도
  - 방화벽 설정 확인

#### 문제: 이메일이 발송되지 않음
- **원인**: SMTP 설정 오류 또는 Rate limiting
- **해결**: 
  - Supabase 로그 확인 (Logs → Auth Logs)
  - SMTP 설정 재확인
  - 테스트 이메일 발송

### 6. 테스트 방법

1. **Supabase 대시보드에서 테스트**
   - Authentication → Email Templates
   - "Test email" 기능 사용 (있는 경우)

2. **회원가입으로 테스트**
   - 실제 회원가입 시도
   - 이메일 수신 확인

3. **로그 확인**
   - Supabase 대시보드 → Logs → Auth Logs
   - 오류 메시지 확인

### 7. 대안: 기본 SMTP 사용

커스텀 SMTP에 문제가 있다면:

1. **SMTP Settings에서 "Disable Custom SMTP"**
2. Supabase 기본 SMTP 사용
3. 회원가입 테스트

기본 SMTP는 제한이 있지만 설정이 간단합니다.

### 8. 네이버 앱 비밀번호 생성 (2단계 인증 사용 시)

1. **네이버 계정 설정**
   - https://nid.naver.com/user2/help/myInfo

2. **보안 → 2단계 인증 → 앱 비밀번호**
   - "메일" 선택
   - 앱 비밀번호 생성
   - 생성된 비밀번호를 Supabase SMTP Password에 입력

### 참고사항

- 네이버 SMTP는 하루 발송 제한이 있을 수 있습니다
- Rate limiting 설정 확인 (Minimum interval per user)
- 발신자 이름이 "회고리즘"으로 설정되어 있는데, "포켓리즘"으로 변경하는 것을 권장합니다

