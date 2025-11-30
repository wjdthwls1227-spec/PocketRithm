# 회원 탈퇴 기능 가이드

## 🔧 Service Role Key 설정 (필수)

회원 탈퇴 시 Supabase Authentication에서 사용자를 완전히 삭제하려면 Service Role Key가 필요합니다.

### 1단계: Service Role Key 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → API**
   - **service_role key** 복사
   - ⚠️ 이 키는 절대 클라이언트에 노출하지 마세요!

### 2단계: .env.local에 추가

`.env.local` 파일에 추가:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3단계: 개발 서버 재시작

```bash
# 개발 서버 중지 (Ctrl+C)
npm run dev
```

## 📋 회원 탈퇴 프로세스

### 자동 삭제 (Service Role Key 설정된 경우)

1. 사용자 관련 데이터 삭제:
   - expenses, incomes, daily_logs
   - retrospective_entries, weekly_reflections, monthly_reflections
   - challenge_participants, profiles

2. Supabase Admin API로 사용자 계정 삭제
   - Authentication에서 완전히 제거

3. 자동 로그아웃 및 홈으로 리다이렉트

### 수동 삭제 (Service Role Key 없는 경우)

Service Role Key가 없으면:
- 사용자 데이터는 삭제됨
- 하지만 Authentication에서 사용자는 남아있음
- Supabase 대시보드에서 수동으로 삭제 필요

**수동 삭제 방법:**
1. Supabase 대시보드 → Authentication → Users
2. 삭제할 사용자 검색
3. 사용자 클릭 → "Delete user" 클릭

## ⚠️ 주의사항

- Service Role Key는 서버에서만 사용
- 클라이언트 코드에 노출하지 마세요
- Git에 커밋하지 마세요 (.env.local은 .gitignore에 포함)
- 프로덕션에서는 환경 변수로 관리

## 🔍 문제 해결

### 문제: "사용자 계정 삭제 중 오류가 발생했습니다"

**원인:**
- Service Role Key가 잘못되었거나 없음
- Supabase 프로젝트가 일시정지됨

**해결:**
1. Service Role Key 확인 및 재설정
2. Supabase 프로젝트 상태 확인
3. 개발 서버 재시작

### 문제: 데이터는 삭제되었지만 Authentication에 남아있음

**원인:**
- Service Role Key가 설정되지 않음

**해결:**
1. Service Role Key를 `.env.local`에 추가
2. 개발 서버 재시작
3. 또는 Supabase 대시보드에서 수동 삭제


