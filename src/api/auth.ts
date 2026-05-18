import { post } from '@/utils/request'
import type { MiniLoginResult, MiniLoginWechatExtras } from '@/types/auth'

/**
 * Production login: WeChat button open-type="getPhoneNumber" → detail.code.
 * Optional loginCode (wx.login) + nickName / avatarUrl saved to staff on success.
 */
export function miniLoginByWechatPhoneCode(code: string, extras?: MiniLoginWechatExtras) {
  return post<MiniLoginResult>('/api/auth/mini-wechat-phone', {
    code,
    loginCode: extras?.loginCode,
    nickName: extras?.nickName,
    avatarUrl: extras?.avatarUrl,
  })
}

/**
 * Dev / simulator fallback: 11-digit phone in body (same rules as backend mini-session).
 */
export function miniLoginByPhoneDigits(phone11Digits: string, extras?: MiniLoginWechatExtras) {
  const phone = String(phone11Digits || '').replace(/\D/g, '')
  return post<MiniLoginResult>('/api/auth/mini-session', {
    phone,
    loginCode: extras?.loginCode,
    nickName: extras?.nickName,
    avatarUrl: extras?.avatarUrl,
  })
}
