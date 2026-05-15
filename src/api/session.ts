import { post } from '@/utils/request'

export type MiniSessionResult = {
  token: string
  expiresAt: string
  expiresIn: number
  profile: Record<string, unknown>
}

/** Silent renew: requires stored Bearer token; server re-checks whitelist + staff. */
export function refreshMiniSession() {
  return post<MiniSessionResult>('/api/auth/mini-refresh', {})
}
