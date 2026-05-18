import { post } from '@/utils/request'
import type { MiniLoginResult } from '@/types/auth'

/** Production login: WeChat button open-type="getPhoneNumber" → detail.code. */
export function miniLoginByWechatPhoneCode(code: string) {
  return post<MiniLoginResult>('/api/auth/mini-wechat-phone', { code })
}

/** Dev / simulator fallback: 11-digit phone in body (same rules as backend mini-session). */
export function miniLoginByPhoneDigits(phone11Digits: string) {
  const phone = String(phone11Digits || '').replace(/\D/g, '')
  return post<MiniLoginResult>('/api/auth/mini-session', { phone })
}
