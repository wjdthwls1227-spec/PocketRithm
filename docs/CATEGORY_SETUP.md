# 카테고리 관리 기능 설정 가이드

## 📋 개요

사용자가 지출/수입 카테고리를 직접 관리할 수 있는 기능이 추가되었습니다.

## 🗄️ 데이터베이스 설정

### 1단계: 카테고리 테이블 생성

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
-- User Categories 테이블
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

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_type ON public.user_categories(type);

-- RLS 활성화
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- RLS 정책
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
```

또는 `supabase/schema.sql` 파일의 최신 버전을 실행하세요.

## 🎨 기능 설명

### 카테고리 관리 페이지
- 경로: `/dashboard/settings/categories`
- 지출/수입 카테고리를 별도로 관리
- 기본 카테고리 자동 추가 기능
- 카테고리 추가/수정/삭제
- 아이콘(이모지) 설정

### 지출/수입 입력 UI 개선
- **큰 금액 표시**: 입력한 금액이 크게 표시됨
- **숫자 키패드**: 터치 친화적인 숫자 키패드
- **카테고리 그리드**: 카테고리를 아이콘과 함께 그리드로 빠르게 선택
- **간편한 입력**: 최소한의 입력으로 빠르게 기록 가능

## 📱 사용 방법

### 1. 카테고리 설정
1. 설정 → 카테고리 관리
2. 지출/수입 탭 선택
3. 기본 카테고리 추가 (처음 사용 시)
4. 카테고리 추가/수정/삭제

### 2. 지출 입력
1. 가계부 → 지출 관리 → 지출 추가
2. 숫자 키패드로 금액 입력
3. 카테고리 그리드에서 선택
4. 지출 유형 선택 (필요/욕망/결핍)
5. 날짜 선택 및 저장

### 3. 수입 입력
1. 가계부 → 수입 관리 → 수입 추가
2. 숫자 키패드로 금액 입력
3. 수입원 카테고리 선택
4. 날짜 선택 및 저장

## ⚠️ 주의사항

- 기본 카테고리는 삭제할 수 없습니다
- 같은 타입(지출/수입)에서 카테고리 이름은 중복될 수 없습니다
- 카테고리가 없으면 기존 기록에서 자동으로 추출하여 표시합니다

## 🔄 마이그레이션

기존 사용자의 경우:
- 카테고리 관리 페이지에서 "기본 카테고리 추가" 버튼 클릭
- 또는 기존 지출/수입 기록에서 자동으로 카테고리 추출


