import { post } from '@/utils/request'
import type { MiniLoginResult } from '@/types/auth'

/**
 * Production login: WeChat button open-type="getPhoneNumber" → detail.code.
 * Server exchanges code at WeChat API, then checks whitelist + staff and returns JWT-like mini token.
 */
export function miniLoginByWechatPhoneCode(code: string) {
  return post<MiniLoginResult>('/api/auth/mini-wechat-phone', { code })
}

/**
 * Dev / simulator fallback: 11-digit phone in body (same rules as backend mini-session).
 * Enable UI via VITE_MINI_LOGIN_PHONE_FALLBACK=true — do not ship to production users.
 */
export function miniLoginByPhoneDigits(phone11Digits: string) {
  const phone = String(phone11Digits || '').replace(/\D/g, '')
  return post<MiniLoginResult>('/api/auth/mini-session', { phone })
}
