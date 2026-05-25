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
  startPriceWan: number | null
  dealPriceWan: number | null
}

export interface LandAuctionSummary {
  stats: LandAuctionStats
}
