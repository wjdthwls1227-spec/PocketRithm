# Supabase 이메일 템플릿 커스터마이징 가이드

## 📧 이메일 템플릿 수정하기

Supabase에서 회원가입/로그인 시 발송되는 이메일의 내용을 "포켓리즘에 가입하겠습니까?"로 변경하는 방법입니다.

## 🔧 발신자 이름 변경하기 (Supabase Auth → 포켓리즘)

이메일 발신자 이름을 "Supabase Auth"에서 "포켓리즘"으로 변경하는 방법:

### 1단계: Supabase 대시보드 접속

1. **Supabase 웹사이트 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

### 2단계: Authentication 설정

1. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **Settings** 메뉴 클릭 (또는 **Configuration**)

2. **Email Settings 찾기**
   - **Email** 섹션 또는 **SMTP Settings** 섹션 찾기

3. **발신자 정보 수정**
   - **Sender Name** 또는 **From Name** 필드 찾기
   - 현재 값: `Supabase Auth`
   - 변경할 값: `포켓리즘` 또는 `PocketRithm`

4. **발신자 이메일 주소 확인**
   - **Sender Email** 또는 **From Email** 필드 확인
   - 기본값: `noreply@mail.app.supabase.io` (변경 불가능할 수 있음)
   - 또는 커스텀 SMTP를 설정한 경우 커스텀 이메일 주소 사용 가능

### 3단계: 저장

1. **변경사항 저장**
   - **Save** 또는 **Update** 버튼 클릭
   - 변경사항이 즉시 적용됩니다

### 참고사항

- **기본 SMTP 사용 시**: 발신자 이름만 변경 가능하고, 이메일 주소는 변경할 수 없습니다
- **커스텀 SMTP 사용 시**: 발신자 이름과 이메일 주소 모두 변경 가능합니다
- 커스텀 SMTP를 설정하면 `noreply@pocketrithm.com` 같은 도메인 이메일을 사용할 수 있습니다

### 1단계: Supabase 대시보드 접속

1. **Supabase 웹사이트 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

### 2단계: 이메일 템플릿 설정

1. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **Email Templates** 메뉴 클릭

2. **회원가입 이메일 템플릿 수정**
   - **Confirm signup** 템플릿 선택
   - 이 템플릿이 회원가입 시 발송되는 이메일입니다

3. **이메일 내용 수정**

   **제목 (Subject):**
   ```
   포켓리즘에 가입하시겠습니까?
   ```

   **본문 (Body):**
   ```html
   <h2>포켓리즘에 가입하시겠습니까?</h2>
   
   <p>안녕하세요!</p>
   
   <p>포켓리즘에 가입해주셔서 감사합니다. 아래 버튼을 클릭하여 이메일을 확인해주세요.</p>
   
   <p><a href="{{ .ConfirmationURL }}">이메일 확인하기</a></p>
   
   <p>이 링크는 24시간 동안 유효합니다.</p>
   
   <p>만약 이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.</p>
   
   <p>감사합니다,<br>포켓리즘 팀</p>
   ```

### 3단계: 사용 가능한 변수

Supabase 이메일 템플릿에서 사용할 수 있는 변수들:

- `{{ .ConfirmationURL }}` - 이메일 확인 링크
- `{{ .Email }}` - 사용자 이메일 주소
- `{{ .Token }}` - 인증 토큰 (일반적으로 사용하지 않음)
- `{{ .TokenHash }}` - 토큰 해시
- `{{ .SiteURL }}` - 사이트 URL

### 4단계: 다른 이메일 템플릿들

**Magic Link (비밀번호 없이 로그인):**
- **Invite user** - 사용자 초대 이메일
- **Magic Link** - 매직 링크 로그인 이메일
- **Change Email Address** - 이메일 변경 확인
- **Reset Password** - 비밀번호 재설정

각 템플릿을 포켓리즘에 맞게 수정할 수 있습니다.

### 5단계: 이메일 디자인 커스터마이징

더 세련된 이메일을 원하시면 HTML/CSS를 사용할 수 있습니다:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2864FF 0%, #1E4ED8 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #E6E6E7;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: #2864FF;
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #8E8E93;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>포켓리즘에 가입하시겠습니까?</h1>
    </div>
    <div class="content">
      <p>안녕하세요!</p>
      
      <p>포켓리즘에 가입해주셔서 감사합니다. 가계부 회고로 만드는 나만의 소비 습관을 시작해보세요.</p>
      
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">이메일 확인하기</a>
      </p>
      
      <p>이 링크는 24시간 동안 유효합니다.</p>
      
      <p>만약 이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.</p>
    </div>
    <div class="footer">
      <p>© 2024 포켓리즘. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 6단계: 저장 및 테스트

1. **템플릿 저장**
   - 수정한 내용을 **Save** 버튼으로 저장

2. **테스트**
   - 회원가입을 다시 시도하여 이메일이 올바르게 발송되는지 확인
   - 받은 이메일에서 제목과 내용이 변경되었는지 확인

### 참고사항

- 이메일 템플릿은 즉시 적용됩니다
- HTML을 사용하면 더 세련된 이메일을 만들 수 있습니다
- 모든 템플릿을 포켓리즘 브랜드에 맞게 수정하는 것을 권장합니다
- 이메일 발송은 Supabase의 SMTP 설정에 따라 달라질 수 있습니다

