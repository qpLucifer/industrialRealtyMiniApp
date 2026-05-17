import { get, post } from '@/utils/request'
import type { AnnouncementItem, MessageItem } from '@/types/message'

export function fetchMessageList() {
  return get<{ list: MessageItem[] }>('/api/message/list')
}

export function fetchAnnouncementList() {
  return get<{ list: AnnouncementItem[] }>('/api/announcement/list')
}

export function postAction<T extends { ok: boolean } = { ok: boolean }>(
  path: string,
  data?: Record<string, unknown>,
) {
  return post<T>(`/api/action/${path}`, data)
}
