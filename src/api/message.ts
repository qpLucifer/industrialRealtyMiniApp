import { get, post } from '@/utils/request'
import type { AnnouncementListResult, MessageItem } from '@/types/message'

export function fetchMessageList() {
  return get<{ list: MessageItem[] }>('/api/message/list')
}

export function fetchAnnouncementList() {
  return get<AnnouncementListResult>('/api/announcement/list')
}

export function markAnnouncementReadApi(announcementId: string) {
  return post<{ success: boolean }>(`/api/announcement/${encodeURIComponent(announcementId)}/read`)
}

export function postAction<T extends { ok: boolean } = { ok: boolean }>(
  path: string,
  data?: Record<string, unknown>,
) {
  return post<T>(`/api/action/${path}`, data)
}
