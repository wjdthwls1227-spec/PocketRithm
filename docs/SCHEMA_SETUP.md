# 데이터베이스 스키마 실행 가이드

## 📝 단계별 가이드

### 1단계: Supabase 대시보드 접속
- https://supabase.com/dashboard 접속
- 생성한 프로젝트 클릭

### 2단계: SQL Editor 열기
1. 왼쪽 사이드바에서 **"SQL Editor"** 아이콘 클릭
   - 아이콘 모양: 📝 또는 SQL이라고 적혀있음
   - 사이드바 상단에 있을 수 있음

2. **"New query"** 버튼 클릭
   - 또는 빈 쿼리 창이 이미 열려있을 수 있음

### 3단계: 스키마 파일 내용 복사
1. 프로젝트 폴더에서 `supabase/schema.sql` 파일 열기
2. 전체 내용 선택 (Ctrl+A)
3. 복사 (Ctrl+C)

### 4단계: SQL Editor에 붙여넣기
1. Supabase SQL Editor의 빈 텍스트 영역 클릭
2. 붙여넣기 (Ctrl+V)
3. 전체 SQL 코드가 입력되었는지 확인

### 5단계: 실행
1. 우측 하단의 **"RUN"** 버튼 클릭
   - 또는 키보드 단축키: **F5** 또는 **Ctrl+Enter**
2. 잠시 기다리기 (몇 초 소요)

### 6단계: 성공 확인
- ✅ **성공 시**: "Success. No rows returned" 또는 "Success" 메시지 표시
- ❌ **실패 시**: 빨간색 에러 메시지 표시 (에러 내용 확인 필요)

### 7단계: 테이블 확인
1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. 다음 테이블들이 보이는지 확인:
   - profiles
   - expenses
   - incomes
   - daily_logs
   - retrospective_entries
   - weekly_reflections
   - weekly_4l
   - monthly_reflections
   - scheduled_reflections
   - challenges
   - challenge_participants
   - articles

## ⚠️ 주의사항
- 스키마는 한 번만 실행하면 됩니다
- 이미 테이블이 있으면 에러가 날 수 있습니다
- 에러가 나면 에러 메시지를 확인하고 알려주세요


