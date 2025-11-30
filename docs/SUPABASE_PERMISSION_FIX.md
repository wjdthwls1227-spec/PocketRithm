# Supabase 권한 오류 해결 가이드

## ❌ 오류: "Failed to fetch permissions: Unauthorized"

Supabase 대시보드에서 권한 오류가 발생하는 경우 해결 방법입니다.

## 🔧 해결 방법

### 방법 1: 브라우저 새로고침 및 재로그인 (가장 흔한 해결책)

1. **브라우저 완전 새로고침**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - 또는 `F5` 여러 번 누르기

2. **Supabase 로그아웃 후 재로그인**
   - 우측 상단 프로필 아이콘 클릭
   - "Sign Out" 클릭
   - 다시 로그인

3. **시크릿/프라이빗 모드에서 시도**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

### 방법 2: 쿠키 및 캐시 삭제

1. **Chrome/Edge**
   - `Ctrl + Shift + Delete`
   - "쿠키 및 기타 사이트 데이터" 선택
   - "전체 기간" 선택
   - "데이터 삭제" 클릭

2. **Firefox**
   - `Ctrl + Shift + Delete`
   - "쿠키" 선택
   - "전체 기간" 선택
   - "지금 지우기" 클릭

3. **Supabase 사이트 재접속**
   - https://supabase.com/dashboard
   - 다시 로그인

### 방법 3: 다른 브라우저에서 시도

- Chrome에서 오류가 나면 Firefox나 Edge에서 시도
- 또는 모바일 브라우저에서 시도

### 방법 4: Supabase 프로젝트 확인

1. **올바른 프로젝트 선택 확인**
   - 대시보드에서 프로젝트가 선택되어 있는지 확인
   - 프로젝트가 일시정지되었는지 확인

2. **프로젝트 권한 확인**
   - 프로젝트 소유자인지 확인
   - 팀 멤버인 경우 권한이 있는지 확인

### 방법 5: Supabase CLI 사용 (대안)

대시보드가 계속 문제가 있다면 Supabase CLI를 사용하여 SQL을 실행할 수 있습니다:

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-ref

# SQL 실행
supabase db push
```

또는 직접 SQL 파일 실행:

```bash
supabase db execute -f supabase/schema.sql
```

## 📝 카테고리 테이블 수동 생성 (대시보드 대신)

대시보드가 계속 문제가 있다면, 다음 SQL을 직접 실행할 수 있습니다:

### SQL Editor에서 실행할 SQL

```sql
-- User Categories 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_type ON public.user_categories(type);

-- RLS 활성화
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view own categories" ON public.user_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.user_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.user_categories
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거 (이미 함수가 있다면)
CREATE TRIGGER update_user_categories_updated_at 
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
```

## 🔍 문제가 계속되는 경우

1. **Supabase 상태 확인**
   - https://status.supabase.com
   - 서비스 장애 여부 확인

2. **Supabase 지원팀에 문의**
   - https://supabase.com/dashboard/support
   - 오류 메시지와 스크린샷 첨부

3. **프로젝트 재생성 (최후의 수단)**
   - 새 프로젝트 생성
   - 기존 스키마 다시 실행

## 💡 빠른 해결 팁

가장 빠른 해결책:
1. **시크릿 모드에서 Supabase 접속**
2. **로그인 후 SQL Editor 열기**
3. **위의 SQL 실행**

또는:
1. **브라우저 완전 종료 후 재시작**
2. **Supabase 로그아웃/로그인**
3. **SQL Editor에서 실행**

## ✅ 확인 방법

SQL 실행 후 다음 쿼리로 확인:

```sql
-- 테이블이 생성되었는지 확인
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_categories';

-- RLS 정책 확인
SELECT * FROM pg_policies 
WHERE tablename = 'user_categories';
```


