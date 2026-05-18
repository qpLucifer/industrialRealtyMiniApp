/** Mark list pages to refresh on next show (after create/edit from sub-pages). */

function storageKey(key: string) {
  return `list_refresh:${key}`
}

export function markListStale(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  try {
    uni.setStorageSync(storageKey(k), '1')
  } catch {
    /* ignore */
  }
}

export function consumeListStale(key: string): boolean {
  const k = String(key || '').trim()
  if (!k) return false
  const sk = storageKey(k)
  try {
    if (uni.getStorageSync(sk) === '1') {
      uni.removeStorageSync(sk)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}
