import { SupabaseClient } from '@supabase/supabase-js'

/**
 * 현재 월을 YYYY-MM 형식으로 반환
 */
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 특정 날짜의 월을 YYYY-MM 형식으로 반환
 */
export function getMonthFromDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 월별 예산 조회 (해당 월 예산이 없으면 기본 예산 반환)
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param month YYYY-MM 형식의 월
 * @param defaultBudget 기본 예산 (이미 조회한 경우 전달하여 중복 조회 방지)
 * @returns 예산 금액
 */
export async function getMonthlyBudget(
  supabase: SupabaseClient,
  userId: string,
  month: string,
  defaultBudget?: number
): Promise<number> {
  // 1. 먼저 해당 월의 예산 조회
  const { data: monthlyBudget, error } = await supabase
    .from('monthly_budgets')
    .select('total_budget')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  // 데이터가 있으면 반환
  if (monthlyBudget && !error) {
    return monthlyBudget.total_budget
  }

  // 2. 없으면 전달받은 기본 예산 사용 (프로필 조회 생략)
  if (defaultBudget !== undefined) {
    return defaultBudget
  }

  // 3. 기본 예산이 없으면 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('monthly_budget')
    .eq('id', userId)
    .maybeSingle()

  return profile?.monthly_budget || 0
}

/**
 * 카테고리별 월별 예산 조회
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param categoryId 카테고리 ID
 * @param month YYYY-MM 형식의 월
 * @returns 예산 금액 (없으면 null)
 */
export async function getCategoryMonthlyBudget(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  month: string
): Promise<number | null> {
  const { data } = await supabase
    .from('category_monthly_budgets')
    .select('budget')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('month', month)
    .maybeSingle()

  return data?.budget || null
}

/**
 * 특정 월의 모든 카테고리별 예산 조회
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param month YYYY-MM 형식의 월
 * @returns 카테고리 ID를 키로 하는 예산 맵
 */
export async function getAllCategoryMonthlyBudgets(
  supabase: SupabaseClient,
  userId: string,
  month: string
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('category_monthly_budgets')
    .select('category_id, budget')
    .eq('user_id', userId)
    .eq('month', month)

  if (!data) return {}

  return data.reduce((acc, item) => {
    acc[item.category_id] = item.budget
    return acc
  }, {} as Record<string, number>)
}

/**
 * 이번 달 수입 조회
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @returns 이번 달 총 수입
 */
export async function getCurrentMonthIncome(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', firstDay)
    .lte('date', lastDay)

  return incomes?.reduce((sum, i) => sum + i.amount, 0) || 0
}

/**
 * 특정 월의 수입 조회
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param month YYYY-MM 형식의 월
 * @returns 해당 월 총 수입
 */
export async function getMonthIncome(
  supabase: SupabaseClient,
  userId: string,
  month: string
): Promise<number> {
  const [year, monthNum] = month.split('-').map(Number)
  const firstDay = new Date(year, monthNum - 1, 1).toISOString().split('T')[0]
  const lastDay = new Date(year, monthNum, 0).toISOString().split('T')[0]

  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', firstDay)
    .lte('date', lastDay)

  return incomes?.reduce((sum, i) => sum + i.amount, 0) || 0
}

