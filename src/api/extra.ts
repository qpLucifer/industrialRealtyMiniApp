import { get } from '@/utils/request'

export function fetchVideoFaqList() {
  return get<{ list: typeof import('@/mock/data/videoFaq').mockVideoFaqList }>('/api/video-faq/list')
}

export function fetchViewingList() {
  return get<{ list: typeof import('@/mock/data/viewingDeal').mockViewingList }>('/api/viewing/list')
}

export function fetchDealFormDefaults() {
  return get<typeof import('@/mock/data/viewingDeal').mockDealFormDefaults>('/api/deal/form-defaults')
}
