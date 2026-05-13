import { get, post } from '@/utils/request'
import type { MessageItem } from '@/mock/data/messages'

export function fetchMessageList() {
  return get<{ list: MessageItem[] }>('/api/message/list')
}

export function fetchAnnouncementList() {
  return get<{ list: typeof import('@/mock/data/messages').mockAnnouncements }>('/api/announcement/list')
}

export function postAction(path: string, data?: Record<string, unknown>) {
  return post<{ ok: boolean }>(`/api/action/${path}`, data)
}
