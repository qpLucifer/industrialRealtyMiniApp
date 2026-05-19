import { get, post } from '@/utils/request'
import type { VideoFaqItem } from '@/types/videoFaq'
import type { DealFormDefaults, ViewingDetail, ViewingListItem } from '@/types/viewingDeal'

export function fetchVideoFaqList() {
  return get<{ list: VideoFaqItem[] }>('/api/video-faq/list')
}

export function fetchViewingList() {
  return get<{ list: ViewingListItem[] }>('/api/viewing/list')
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
