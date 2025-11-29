/**
 * 어드민 권한 체크 유틸리티
 */

const ADMIN_EMAIL = 'yeonibunny3@naver.com'

/**
 * 사용자가 어드민인지 확인
 * @param email 사용자 이메일
 * @returns 어드민 여부
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

