# 빠른 설정 가이드

## ✅ 2단계: API 키 복사하기

1. **Supabase 대시보드에서**
   - 왼쪽 사이드바에서 ⚙️ **Settings** 클릭
   - **API** 메뉴 클릭

2. **다음 3가지 값을 복사하세요:**
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 (긴 문자열)
   - **service_role** 키 (⚠️ 비밀! 긴 문자열)

3. **복사한 값들을 알려주시면 .env.local 파일에 입력해드리겠습니다!**

---

## ✅ 3단계: 데이터베이스 스키마 실행하기

1. **Supabase 대시보드에서**
   - 왼쪽 사이드바에서 📝 **SQL Editor** 클릭
   - **New query** 버튼 클릭

2. **스키마 파일 열기**
   - 프로젝트 폴더의 `supabase/schema.sql` 파일을 열어서
   - 전체 내용 복사 (Ctrl+A → Ctrl+C)

3. **SQL Editor에 붙여넣기**
   - Supabase SQL Editor에 붙여넣기 (Ctrl+V)
   - **RUN** 버튼 클릭 (또는 F5)

4. **성공 확인**
   - "Success. No rows returned" 메시지 확인
   - 왼쪽 사이드바에서 **Table Editor** 클릭
   - 테이블들이 생성되었는지 확인


