-- 월별 예산 기능 추가
-- monthly_budgets와 category_monthly_budgets 테이블 생성

-- 월별 예산 테이블
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식 (예: "2024-11")
  total_budget INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 카테고리별 월별 예산 테이블
CREATE TABLE IF NOT EXISTS public.category_monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.user_categories(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식
  budget INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_month ON public.monthly_budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_category_monthly_budgets_user_month ON public.category_monthly_budgets(user_id, month);

-- RLS 활성화
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_monthly_budgets ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (SELECT, INSERT, UPDATE, DELETE 각각 명시)
CREATE POLICY "Users can view own monthly budgets" ON public.monthly_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly budgets" ON public.monthly_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly budgets" ON public.monthly_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly budgets" ON public.monthly_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- 카테고리별 월별 예산 RLS 정책
CREATE POLICY "Users can view own category monthly budgets" ON public.category_monthly_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category monthly budgets" ON public.category_monthly_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category monthly budgets" ON public.category_monthly_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category monthly budgets" ON public.category_monthly_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거 (기존 트리거가 있으면 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_monthly_budgets_updated_at ON public.monthly_budgets;
CREATE TRIGGER update_monthly_budgets_updated_at BEFORE UPDATE ON public.monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_monthly_budgets_updated_at ON public.category_monthly_budgets;
CREATE TRIGGER update_category_monthly_budgets_updated_at BEFORE UPDATE ON public.category_monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

