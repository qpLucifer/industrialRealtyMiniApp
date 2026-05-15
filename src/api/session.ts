import { post } from '@/utils/request'
import type { MiniLoginResult } from '@/types/auth'

export type MiniSessionResult = MiniLoginResult

/** Silent renew: requires stored Bearer token; server re-checks whitelist + staff. */
export function refreshMiniSession() {
  return post<MiniSessionResult>('/api/auth/mini-refresh', {})
}
