/** Throttle home workbench refetch; force refresh via storage flag. */

const FORCE_KEY = 'workbench_refresh:force'
const STALE_MS = 30_000
let lastFetchedAt = 0

export function markWorkbenchStale() {
  try {
    uni.setStorageSync(FORCE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function shouldRefreshWorkbench(): boolean {
  try {
    if (uni.getStorageSync(FORCE_KEY) === '1') {
      uni.removeStorageSync(FORCE_KEY)
      return true
    }
  } catch {
    /* ignore */
  }
  if (!lastFetchedAt) return true
  return Date.now() - lastFetchedAt > STALE_MS
}

export function touchWorkbenchFetched() {
  lastFetchedAt = Date.now()
}
