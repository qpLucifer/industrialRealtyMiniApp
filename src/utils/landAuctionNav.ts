import { markListStale, consumeListStale } from '@/utils/listStale'
import type { LandAuctionStatus } from '@/types/landAuction'

const LIST_KEY = 'land-auction-list'
const FOCUS_STATUS_KEY = 'land-auction-focus-status'

export function markLandAuctionListStale() {
  markListStale(LIST_KEY)
}

export function consumeLandAuctionListStale(): boolean {
  return consumeListStale(LIST_KEY)
}

export function markLandAuctionFocusStatus(status: LandAuctionStatus) {
  try {
    uni.setStorageSync(FOCUS_STATUS_KEY, status)
  } catch {
    /* ignore */
  }
}

export function consumeLandAuctionFocusStatus(): LandAuctionStatus | null {
  try {
    const raw = String(uni.getStorageSync(FOCUS_STATUS_KEY) || '').trim()
    uni.removeStorageSync(FOCUS_STATUS_KEY)
    if (raw === 'upcoming' || raw === 'auctioning' || raw === 'completed') return raw
  } catch {
    /* ignore */
  }
  return null
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
