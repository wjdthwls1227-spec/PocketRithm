# 이메일 인증 설정 가이드

## 문제: "Email not confirmed" 오류

Supabase는 기본적으로 이메일 인증을 요구합니다. 두 가지 해결 방법이 있습니다:

## 방법 1: Supabase에서 이메일 인증 비활성화 (개발 환경)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication 설정**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - **Providers** 메뉴 클릭
   - **Email** 섹션 찾기

3. **이메일 인증 비활성화**
   - **"Confirm email"** 옵션을 **OFF**로 변경
   - 또는 **"Enable email confirmations"** 체크 해제
   - 저장

4. **주의사항**
   - 개발 환경에서만 사용 권장
   - 프로덕션에서는 보안을 위해 이메일 인증을 활성화하는 것이 좋습니다

## 방법 2: 이메일 확인하기 (프로덕션 권장)

1. **회원가입 시 발송된 이메일 확인**
   - 가입 시 입력한 이메일 주소의 받은편지함 확인
   - 스팸 폴더도 확인

2. **이메일 재발송**
   - 로그인 페이지에서 "인증 이메일 다시 보내기" 버튼 클릭
   - 이메일 입력 후 재발송

3. **이메일 링크 클릭**
   - 이메일의 "Confirm your email" 또는 "이메일 확인" 링크 클릭
   - 자동으로 로그인되고 대시보드로 이동

## 방법 3: Supabase에서 수동으로 이메일 확인 (개발용)

1. **Supabase 대시보드 접속**
   - Authentication → Users 메뉴 클릭

2. **사용자 찾기**
   - 이메일로 사용자 검색

3. **이메일 확인 상태 변경**
   - 사용자 클릭
   - **"Email Confirmed"** 체크박스 활성화
   - 저장

## 개발 환경 추천 설정

개발 중에는 이메일 인증을 비활성화하는 것이 편리합니다:

1. Supabase 대시보드 → Authentication → Providers → Email
2. "Confirm email" 옵션 OFF
3. 저장

이렇게 하면 회원가입 후 바로 로그인할 수 있습니다.

