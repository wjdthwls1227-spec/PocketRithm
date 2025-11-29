// 데이터베이스 타입 정의

export type User = {
  id: string
  email: string
  name: string
  profileImage?: string
  plan: 'free' | 'pro' | 'challenge'
  monthlyBudget?: number
  createdAt: string
  preferences: {
    dailyReminder?: boolean
    weeklyReminder?: boolean
    monthlyReminder?: boolean
  }
}

export type Expense = {
  id: string
  userId: string
  amount: number
  category: string
  type: 'desire' | 'lack' | 'need'
  emotions: string[]
  reason?: string
  date: string
  createdAt: string
}

export type Income = {
  id: string
  userId: string
  amount: number
  source: string
  date: string
  createdAt: string
}

export type DailyLog = {
  id: string
  userId: string
  content: string
  emotionTags: string[]
  date: string
  createdAt: string
}

export type RetrospectiveEntry = {
  id: string
  userId: string
  type: '4L' | 'KPT' | 'FREE'
  date: string
  templateData: Record<string, any>
  images: string[]
  styledContent: string
  createdAt: string
  updatedAt: string
}

export type WeeklyReflection = {
  id: string
  userId: string
  week: string // YYYY-WW 형식
  summary: string
  patterns: Record<string, any>
  insights: Record<string, any>
  createdAt: string
}

export type Weekly4L = {
  id: string
  userId: string
  week: string
  loved: string
  learned: string
  lacked: string
  longedFor: string
  createdAt: string
}

export type MonthlyReflection = {
  id: string
  userId: string
  month: string // YYYY-MM 형식
  answers: Record<string, any>
  report: Record<string, any>
  createdAt: string
}

export type ScheduledReflection = {
  id: string
  userId: string
  type: 'weekly-expense' | 'weekly-4L' | 'monthly-expense'
  scheduledAt: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export type Challenge = {
  id: string
  title: string
  description: string
  cohort: number
  startDate: string
  endDate: string
  location?: string
  capacity: number
  enrolled: number
  fee?: number
  status: 'recruiting' | 'ongoing' | 'completed'
  createdAt: string
}

export type ChallengeParticipant = {
  id: string
  challengeId: string
  userId: string
  attendance: number[] // week index 배열
  completed: boolean
  refunded: boolean
  createdAt: string
}

export type Article = {
  id: string
  title: string
  subtitle?: string
  content: string
  category: string
  thumbnail?: string
  tags: string[]
  readingTime: number
  publishedAt: string
  createdAt: string
}

