-- monthly_budgets 테이블 RLS 정책 수정
-- 406 오류 해결을 위한 RLS 정책 재생성

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can manage own monthly budgets" ON public.monthly_budgets;
DROP POLICY IF EXISTS "Users can manage own category monthly budgets" ON public.category_monthly_budgets;

-- RLS 정책 재생성 (SELECT, INSERT, UPDATE, DELETE 각각 명시)
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

