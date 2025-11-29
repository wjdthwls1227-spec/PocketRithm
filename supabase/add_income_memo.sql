-- 수입 테이블에 메모 필드 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.incomes 
ADD COLUMN IF NOT EXISTS memo TEXT;

