import { get, post } from '@/utils/request'
import type { SecuritySettings, UserProfile } from '@/types/user'

export function fetchUserProfile() {
  return get<UserProfile>('/api/user/profile')
}

export function fetchSecuritySettings() {
  return get<SecuritySettings>('/api/settings/security')
}

export function saveSecuritySettings(body: SecuritySettings) {
  return post<{ saved: boolean }>('/api/settings/security', body as unknown as Record<string, unknown>)
}
