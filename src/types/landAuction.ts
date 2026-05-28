export type LandAuctionStatus = 'upcoming' | 'auctioning' | 'completed'

export interface LandAuctionStats {
  upcoming: number
  auctioning: number
  completed: number
  total: number
}

export interface LandAuctionItem {
  id: number
  title: string
  metaLine: string
  timeLine: string
  auctionStatus: LandAuctionStatus
  districtRegionId: number | null
  region: string
  areaMu: number | null
  transferTerm?: string
  taxPerMu?: number | null
  investmentPerMu?: number | null
  depositWan?: number | null
  startPriceWan: number | null
  dealPriceWan: number | null
  avgPricePerMu?: number | null
  buyerInfo?: string
}

export interface LandAuctionSummary {
  stats: LandAuctionStats
}

export interface LandAuctionDetail {
  id: number
  title: string
  districtRegionId: number | null
  region: string
  areaMu: number | null
  transferTerm: string
  taxPerMu: number | null
  investmentPerMu: number | null
  depositWan: number | null
  startPriceWan: number | null
  dealPriceWan: number | null
  avgPricePerMu: number | null
  buyerInfo: string
  auctionStatus: LandAuctionStatus
  listingDate: string
  auctionStartAt: string
  auctionEndAt: string
  completedAt: string
  remark: string
  published: boolean
  sortOrder: number
  updatedAt: string
  canEdit: boolean
}

export interface LandAuctionFormPayload {
  title: string
  districtRegionId: number
  areaMu?: number | null
  transferTerm?: string | null
  taxPerMu?: number | null
  investmentPerMu?: number | null
  depositWan?: number | null
  startPriceWan?: number | null
  dealPriceWan?: number | null
  avgPricePerMu?: number | null
  buyerInfo?: string | null
  auctionStatus: LandAuctionStatus
  listingDate?: string | null
  auctionStartAt?: string | null
  auctionEndAt?: string | null
  completedAt?: string | null
  remark?: string
  published?: boolean
  sortOrder?: number
}
