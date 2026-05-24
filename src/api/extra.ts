import { get, post } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import { MINI_LIST_PAGE_SIZE } from '@/utils/pagedList'
import type { VideoFaqItem } from '@/types/videoFaq'
import type { DealFormDefaults, ViewingDetail, ViewingListItem } from '@/types/viewingDeal'

export function fetchVideoFaqList(query?: { page?: number; pageSize?: number }) {
  return get<PagedListResponse<VideoFaqItem>>('/api/video-faq/list', {
    page: query?.page ?? 1,
    pageSize: query?.pageSize ?? MINI_LIST_PAGE_SIZE,
  })
}

export function fetchViewingList(query?: { week?: boolean; page?: number; pageSize?: number }) {
  const params: Record<string, string | number> = {
    page: query?.page ?? 1,
    pageSize: query?.pageSize ?? MINI_LIST_PAGE_SIZE,
  }
  if (query?.week) params.week = '1'
  return get<PagedListResponse<ViewingListItem>>('/api/viewing/list', params)
}

export function fetchViewingDetail(id: number) {
  return get<ViewingDetail>('/api/viewing/detail', { id })
}

export function updateViewing(payload: Record<string, unknown>) {
  return post<{ ok: boolean; id?: number }>('/api/action/viewing-update', payload)
}

export function deleteViewing(id: number) {
  return post<{ ok: boolean }>('/api/action/viewing-delete', { id })
}

export function fetchDealFormDefaults() {
  return get<DealFormDefaults>('/api/deal/form-defaults')
}
