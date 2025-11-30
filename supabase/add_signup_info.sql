-- 회원가입 경로 및 가입 이유 필드 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signup_source TEXT,
ADD COLUMN IF NOT EXISTS signup_reason TEXT;

