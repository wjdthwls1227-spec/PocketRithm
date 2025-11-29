-- 지출분석/회고 필드 추가
-- expenses 테이블에 analysis 컬럼 추가

ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS analysis TEXT;

