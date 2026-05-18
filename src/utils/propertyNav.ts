/** Unified property route key (DB id or business code — server accepts both). */

export type PropertyKeySource = { id: string; code?: string }

const DETAIL_REFRESH_PREFIX = 'property_detail_refresh:'

/** Prefer primary list id; fall back to code when id missing. */
export function propertyNavKey(p: PropertyKeySource | string): string {
  if (typeof p === 'string') return String(p || '').trim()
  return String(p.id || p.code || '').trim()
}

/** Read route query — supports legacy param names during migration. */
export function parsePropertyRouteKey(q?: Record<string, string | undefined> | null): string {
  if (!q) return ''
  const raw = q.key ?? q.id ?? q.code ?? q.editId ?? q.propId
  return raw != null ? String(raw).trim() : ''
}

export function navigateToPropertyDetail(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  uni.navigateTo({ url: `/pages/property/detail?key=${encodeURIComponent(k)}` })
}

export function navigateToPropertyPublish(key?: string, opts?: { clear?: boolean }) {
  const q: string[] = []
  if (opts?.clear) q.push('clear=1')
  else if (key) q.push(`key=${encodeURIComponent(key)}`)
  const qs = q.length ? `?${q.join('&')}` : ''
  uni.navigateTo({ url: `/pages/property/publish${qs}` })
}

export function navigateToPropertyLog(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  uni.navigateTo({ url: `/pages/property/log?key=${encodeURIComponent(k)}` })
}

export function navigateToViewingNew(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  uni.navigateTo({ url: `/pages/viewing/new?key=${encodeURIComponent(k)}` })
}

export function markPropertyDetailStale(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  try {
    uni.setStorageSync(`${DETAIL_REFRESH_PREFIX}${k}`, '1')
  } catch {
    /* ignore */
  }
}

export function consumePropertyDetailRefresh(key: string): boolean {
  const k = String(key || '').trim()
  if (!k) return false
  const storageKey = `${DETAIL_REFRESH_PREFIX}${k}`
  try {
    if (uni.getStorageSync(storageKey) === '1') {
      uni.removeStorageSync(storageKey)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}
