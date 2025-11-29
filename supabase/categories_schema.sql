-- 사용자 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  icon TEXT, -- 이모지 또는 아이콘 이름
  color TEXT, -- 색상 코드 (선택사항)
  order_index INTEGER DEFAULT 0, -- 정렬 순서
  is_default BOOLEAN DEFAULT false, -- 기본 카테고리 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type) -- 같은 사용자의 같은 타입에서 카테고리 이름 중복 방지
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_type ON public.user_categories(type);

-- RLS 정책
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 카테고리만 조회/수정/삭제 가능
CREATE POLICY "Users can view own categories" ON public.user_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.user_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.user_categories
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_user_categories_updated_at BEFORE UPDATE ON public.user_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

