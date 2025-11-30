/**
 * 보안 관련 유틸리티 함수
 */

/**
 * 비밀번호 강도 검증
 * @param password 비밀번호
 * @returns 에러 메시지 또는 null (유효한 경우)
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.'
  }
  if (!/[A-Z]/.test(password)) {
    return '비밀번호에 대문자가 포함되어야 합니다.'
  }
  if (!/[a-z]/.test(password)) {
    return '비밀번호에 소문자가 포함되어야 합니다.'
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자가 포함되어야 합니다.'
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return '비밀번호에 특수문자가 포함되어야 합니다.'
  }
  
  // 일반적인 약한 비밀번호 체크
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return '너무 일반적인 비밀번호는 사용할 수 없습니다.'
  }
  
  return null
}

/**
 * 이메일 형식 검증
 * @param email 이메일 주소
 * @returns 유효한 경우 true
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 민감한 정보를 로그에서 제거
 * @param data 로그 데이터
 * @returns 민감한 정보가 제거된 데이터
 */
export function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
  const sanitized = { ...data }
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key])
    }
  }
  
  return sanitized
}

/**
 * 로그인 시도 제한 체크 (클라이언트 측)
 * @param failedAttempts 실패 횟수
 * @returns 잠금 여부
 */
export function checkLoginLockout(failedAttempts: number): boolean {
  return failedAttempts >= 5
}

/**
 * 잠금 해제까지 남은 시간 계산 (초)
 * @param lockoutTime 잠금 시작 시간 (timestamp)
 * @param lockoutDuration 잠금 지속 시간 (초, 기본 15분)
 * @returns 남은 시간 (초) 또는 0 (잠금 해제됨)
 */
export function getRemainingLockoutTime(
  lockoutTime: number,
  lockoutDuration: number = 15 * 60
): number {
  const elapsed = Math.floor((Date.now() - lockoutTime) / 1000)
  const remaining = lockoutDuration - elapsed
  return remaining > 0 ? remaining : 0
}

