import { markListStale, consumeListStale } from '@/utils/listStale'

const LIST_KEY = 'land-auction-list'

export function markLandAuctionListStale() {
  markListStale(LIST_KEY)
}

export function consumeLandAuctionListStale(): boolean {
  return consumeListStale(LIST_KEY)
}

export function markLandAuctionDetailStale(id: number | string) {
  const key = String(id || '').trim()
  if (!key) return
  markListStale(`land-auction-detail:${key}`)
}

export function consumeLandAuctionDetailRefresh(id: number | string): boolean {
  const key = String(id || '').trim()
  if (!key) return false
  return consumeListStale(`land-auction-detail:${key}`)
}
