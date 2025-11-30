-- 포켓리즘 데이터베이스 스키마

-- Users 테이블 (Supabase Auth의 auth.users를 확장)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_image TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'challenge')),
  monthly_budget INTEGER,
  preferences JSONB DEFAULT '{"dailyReminder": false, "weeklyReminder": true, "monthlyReminder": true}'::jsonb,
  signup_source TEXT,
  signup_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses 테이블
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('desire', 'lack', 'need')),
  emotions TEXT[] DEFAULT '{}',
  reason TEXT,
  analysis TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incomes 테이블
CREATE TABLE public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL,
  memo TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Categories 테이블
CREATE TABLE public.user_categories (
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

-- Monthly Budgets 테이블
CREATE TABLE public.monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식 (예: "2024-11")
  total_budget INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Category Monthly Budgets 테이블
CREATE TABLE public.category_monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.user_categories(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식
  budget INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Daily Logs 테이블
CREATE TABLE public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  emotion_tags TEXT[] DEFAULT '{}',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retrospective Entries 테이블
CREATE TABLE public.retrospective_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('4L', 'KPT', 'FREE')),
  date DATE NOT NULL,
  template_data JSONB DEFAULT '{}'::jsonb,
  images TEXT[] DEFAULT '{}',
  styled_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reflections 테이블
CREATE TABLE public.weekly_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week TEXT NOT NULL, -- YYYY-WW 형식
  summary TEXT,
  patterns JSONB DEFAULT '{}'::jsonb,
  insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week)
);

-- Weekly 4L 테이블
CREATE TABLE public.weekly_4l (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week TEXT NOT NULL,
  loved TEXT,
  learned TEXT,
  lacked TEXT,
  longed_for TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week)
);

-- Monthly Reflections 테이블
CREATE TABLE public.monthly_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식
  answers JSONB DEFAULT '{}'::jsonb,
  report JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Scheduled Reflections 테이블
CREATE TABLE public.scheduled_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly-expense', 'weekly-4L', 'monthly-expense')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges 테이블
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cohort INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  enrolled INTEGER NOT NULL DEFAULT 0,
  fee INTEGER,
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Participants 테이블
CREATE TABLE public.challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attendance INTEGER[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  refunded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Articles 테이블
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX idx_incomes_date ON public.incomes(date);
CREATE INDEX idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX idx_retrospective_entries_user_id ON public.retrospective_entries(user_id);
CREATE INDEX idx_retrospective_entries_date ON public.retrospective_entries(date);
CREATE INDEX idx_weekly_reflections_user_id ON public.weekly_reflections(user_id);
CREATE INDEX idx_weekly_4l_user_id ON public.weekly_4l(user_id);
CREATE INDEX idx_monthly_reflections_user_id ON public.monthly_reflections(user_id);
CREATE INDEX idx_scheduled_reflections_user_id ON public.scheduled_reflections(user_id);
CREATE INDEX idx_scheduled_reflections_status ON public.scheduled_reflections(status);
CREATE INDEX idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX idx_user_categories_type ON public.user_categories(type);
CREATE INDEX idx_monthly_budgets_user_month ON public.monthly_budgets(user_id, month);
CREATE INDEX idx_category_monthly_budgets_user_month ON public.category_monthly_budgets(user_id, month);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_4l ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_monthly_budgets ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (기본: 사용자는 자신의 데이터만 접근 가능)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Expenses RLS
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Incomes RLS
CREATE POLICY "Users can view own incomes" ON public.incomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes" ON public.incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes" ON public.incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes" ON public.incomes
  FOR DELETE USING (auth.uid() = user_id);

-- User Categories RLS
CREATE POLICY "Users can view own categories" ON public.user_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.user_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.user_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.user_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Monthly Budgets RLS
CREATE POLICY "Users can view own monthly budgets" ON public.monthly_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly budgets" ON public.monthly_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly budgets" ON public.monthly_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly budgets" ON public.monthly_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Category Monthly Budgets RLS
CREATE POLICY "Users can view own category monthly budgets" ON public.category_monthly_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category monthly budgets" ON public.category_monthly_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category monthly budgets" ON public.category_monthly_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category monthly budgets" ON public.category_monthly_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Daily Logs RLS
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Retrospective Entries RLS
CREATE POLICY "Users can manage own retrospective entries" ON public.retrospective_entries
  FOR ALL USING (auth.uid() = user_id);

-- Weekly Reflections RLS
CREATE POLICY "Users can manage own weekly reflections" ON public.weekly_reflections
  FOR ALL USING (auth.uid() = user_id);

-- Weekly 4L RLS
CREATE POLICY "Users can manage own weekly 4l" ON public.weekly_4l
  FOR ALL USING (auth.uid() = user_id);

-- Monthly Reflections RLS
CREATE POLICY "Users can manage own monthly reflections" ON public.monthly_reflections
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled Reflections RLS
CREATE POLICY "Users can manage own scheduled reflections" ON public.scheduled_reflections
  FOR ALL USING (auth.uid() = user_id);

-- Challenge Participants RLS
CREATE POLICY "Users can manage own challenge participation" ON public.challenge_participants
  FOR ALL USING (auth.uid() = user_id);

-- Challenges는 공개 읽기, 어드민만 쓰기
CREATE POLICY "Anyone can view challenges" ON public.challenges
  FOR SELECT USING (true);

-- Articles는 공개 읽기
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

-- 프로필 생성 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON public.incomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retrospective_entries_updated_at BEFORE UPDATE ON public.retrospective_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_categories_updated_at BEFORE UPDATE ON public.user_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_budgets_updated_at BEFORE UPDATE ON public.monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_category_monthly_budgets_updated_at BEFORE UPDATE ON public.category_monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

