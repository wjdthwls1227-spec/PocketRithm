-- 카테고리 테이블만 추가하는 SQL
-- 이미 다른 테이블들이 생성되어 있는 경우 이 SQL만 실행하세요

-- User Categories 테이블 생성 (이미 있으면 건너뜀)
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

-- 인덱스 생성 (이미 있으면 건너뜀)
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_type ON public.user_categories(type);

-- RLS 활성화 (이미 활성화되어 있어도 오류 없음)
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.user_categories;

-- RLS 정책 생성
CREATE POLICY "Users can view own categories" ON public.user_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.user_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.user_categories
  FOR DELETE USING (auth.uid() = user_id);

-- 트리거가 이미 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_user_categories_updated_at ON public.user_categories;

-- updated_at 트리거 생성
CREATE TRIGGER update_user_categories_updated_at 
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();


