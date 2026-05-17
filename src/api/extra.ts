import { get } from '@/utils/request'
import type { VideoFaqItem } from '@/types/videoFaq'
import type { DealFormDefaults, ViewingListItem } from '@/types/viewingDeal'

export function fetchVideoFaqList() {
  return get<{ list: VideoFaqItem[] }>('/api/video-faq/list')
}

export function fetchViewingList() {
  return get<{ list: ViewingListItem[] }>('/api/viewing/list')
}

export function fetchDealFormDefaults() {
  return get<DealFormDefaults>('/api/deal/form-defaults')
}
