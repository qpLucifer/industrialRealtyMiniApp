import { get, patch, post } from '@/utils/request'
import type { SecuritySettings, UserProfile } from '@/types/user'

export function fetchUserProfile() {
  return get<UserProfile>('/api/user/profile')
}

export function updateUserProfile(body: { avatarUrl?: string }) {
  return patch<UserProfile>('/api/user/profile', body)
}

export function fetchSecuritySettings() {
  return get<SecuritySettings>('/api/settings/security')
}

/** Deprecated for mini staff — server rejects non-admin tokens (403). Policy edits use admin console PUT. */
export function saveSecuritySettings(body: SecuritySettings) {
  return post<{ saved: boolean }>('/api/settings/security', body as unknown as Record<string, unknown>)
}
