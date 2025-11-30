# Supabase 이메일 발신자 이름 변경 가이드

## 📧 "Supabase Auth" → "포켓리즘"으로 변경하기

이메일 발신자 이름을 변경하는 방법은 두 가지가 있습니다:

## 방법 1: 기본 SMTP 사용 (간단)

### 1단계: Supabase 대시보드 접속
- https://supabase.com/dashboard
- 프로젝트 선택

### 2단계: Authentication → Settings
1. 왼쪽 사이드바: **Authentication** 클릭
2. **Settings** 또는 **Configuration** 메뉴 클릭
3. **Email** 섹션 찾기

### 3단계: 발신자 이름 변경
- **Sender Name** 또는 **From Name** 필드 찾기
- 값 변경: `Supabase Auth` → `포켓리즘`
- **Save** 클릭

⚠️ **주의**: 기본 SMTP를 사용하는 경우, 이메일 주소(`noreply@mail.app.supabase.io`)는 변경할 수 없습니다.

---

## 방법 2: 커스텀 SMTP 설정 (권장)

커스텀 SMTP를 사용하면 발신자 이름과 이메일 주소를 모두 변경할 수 있습니다.

### 1단계: SMTP 서비스 선택
다음 중 하나를 선택:
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Gmail SMTP** (개인용)
- 기타 SMTP 서비스

### 2단계: Supabase에서 SMTP 설정
1. **Authentication** → **Settings** → **SMTP Settings**
2. **Enable Custom SMTP** 활성화
3. SMTP 정보 입력:
   - **Host**: SMTP 서버 주소
   - **Port**: 587 (TLS) 또는 465 (SSL)
   - **Username**: SMTP 사용자명
   - **Password**: SMTP 비밀번호
   - **Sender Email**: `noreply@pocketrithm.com` (원하는 이메일)
   - **Sender Name**: `포켓리즘`

### 3단계: 테스트
- 회원가입을 다시 시도하여 이메일 발신자 확인

---

## 빠른 해결책 (기본 SMTP)

가장 빠른 방법은 이메일 템플릿에서 발신자 이름을 표시하는 것입니다:

1. **Authentication** → **Email Templates**
2. **Confirm signup** 템플릿 선택
3. 본문에 발신자 정보 추가:

```html
<h2>포켓리즘에 가입하시겠습니까?</h2>

<p>안녕하세요!</p>

<p><strong>포켓리즘</strong>에 가입해주셔서 감사합니다.</p>

<p>아래 버튼을 클릭하여 이메일을 확인해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">이메일 확인하기</a></p>

<p>감사합니다,<br><strong>포켓리즘</strong> 팀</p>
```

이렇게 하면 이메일 본문에서 "포켓리즘"이 명확하게 표시됩니다.

---

## 확인 방법

1. 회원가입 테스트
2. 받은 이메일 확인
3. 발신자 이름이 "포켓리즘"으로 표시되는지 확인


