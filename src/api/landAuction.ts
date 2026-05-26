import { get, post, put } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import type {
  LandAuctionDetail,
  LandAuctionFormPayload,
  LandAuctionItem,
  LandAuctionStatus,
  LandAuctionSummary,
} from '@/types/landAuction'

export function fetchLandAuctionSummary(params?: {
  districtRegionId?: number | null
  q?: string
}) {
  return get<LandAuctionSummary>('/api/land-auction/summary', {
    ...(params?.q?.trim() ? { q: params.q.trim() } : {}),
    ...(params?.districtRegionId != null && params.districtRegionId > 0
      ? { districtRegionId: params.districtRegionId }
      : {}),
  })
}

export function fetchLandAuctionList(params: {
  status: LandAuctionStatus
  page?: number
  pageSize?: number
  districtRegionId?: number | null
  q?: string
}) {
  return get<PagedListResponse<LandAuctionItem>>('/api/land-auction/list', {
    status: params.status,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...(params.q?.trim() ? { q: params.q.trim() } : {}),
    ...(params.districtRegionId != null && params.districtRegionId > 0
      ? { districtRegionId: params.districtRegionId }
      : {}),
  })
}

export function fetchLandAuctionDetail(id: number | string) {
  return get<LandAuctionDetail>(`/api/land-auction/${encodeURIComponent(String(id))}`)
}

export function createLandAuction(payload: LandAuctionFormPayload) {
  return post<{ success: boolean; id: number }>('/api/land-auction', payload as Record<string, unknown>)
}

export function updateLandAuction(id: number | string, payload: LandAuctionFormPayload) {
  return put<{ success: boolean }>(
    `/api/land-auction/${encodeURIComponent(String(id))}`,
    payload as Record<string, unknown>,
  )
}
