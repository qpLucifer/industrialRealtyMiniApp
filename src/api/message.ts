import { get, post } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import { MINI_LIST_PAGE_SIZE } from '@/utils/pagedList'
import type { AnnouncementListResult, MessageItem } from '@/types/message'

export function fetchMessageList(query?: { page?: number; pageSize?: number }) {
  return get<PagedListResponse<MessageItem>>('/api/message/list', {
    page: query?.page ?? 1,
    pageSize: query?.pageSize ?? MINI_LIST_PAGE_SIZE,
  })
}

export function dismissMessage(messageId: string) {
  return post<{ success: boolean }>('/api/message/dismiss', { id: messageId })
}

export function fetchAnnouncementList(query?: { page?: number; pageSize?: number }) {
  return get<AnnouncementListResult & PagedListResponse<AnnouncementListResult['list'][number]>>(
    '/api/announcement/list',
    {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? MINI_LIST_PAGE_SIZE,
    },
  )
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
