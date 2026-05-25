import { get } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import type { LandAuctionItem, LandAuctionStatus, LandAuctionSummary } from '@/types/landAuction'

export function fetchLandAuctionSummary(params?: { districtRegionId?: number | null }) {
  return get<LandAuctionSummary>('/api/land-auction/summary', {
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
}) {
  return get<PagedListResponse<LandAuctionItem>>('/api/land-auction/list', {
    status: params.status,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...(params.districtRegionId != null && params.districtRegionId > 0
      ? { districtRegionId: params.districtRegionId }
      : {}),
  })
}
