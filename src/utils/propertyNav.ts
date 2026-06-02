/** Unified property route key (DB id or business code — server accepts both). */

export type PropertyKeySource = { id: string; code?: string }

const DETAIL_REFRESH_PREFIX = 'property_detail_refresh:'

/** Prefer primary list id; fall back to code when id missing. */
export function propertyNavKey(p: PropertyKeySource | string): string {
  if (typeof p === 'string') return String(p || '').trim()
  return String(p.id || p.code || '').trim()
}

const INTERNAL_ID_RE = /^p-id-\d+$/i

export function isInternalPropertyId(value: string) {
  return INTERNAL_ID_RE.test(String(value || '').trim())
}

/** Prefer business code for forms / viewing (avoid bare p-id-xxx in UI). */
export function propertyPickerNavKey(p: PropertyKeySource) {
  const code = String(p.code || '').trim()
  const id = String(p.id || '').trim()
  if (code) return code
  return id
}

/** User-facing property name — listing title, not internal id. */
export function propertyDisplayName(opts: {
  title?: string
  listTitle?: string
  code?: string
  fallbackKey?: string
}) {
  const title = String(opts.title || opts.listTitle || '').trim()
  const code = String(opts.code || '').trim()
  const key = String(opts.fallbackKey || '').trim()
  if (title) return title
  if (code && !isInternalPropertyId(code)) return code
  if (key && !isInternalPropertyId(key)) return key
  return '—'
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

export function navigateToPropertyFollow(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  uni.navigateTo({ url: `/pages/property/follow?key=${encodeURIComponent(k)}` })
}

const LOG_REFRESH_PREFIX = 'property_log_refresh:'

export function markPropertyLogStale(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  try {
    uni.setStorageSync(`${LOG_REFRESH_PREFIX}${k}`, '1')
  } catch {
    /* ignore */
  }
}

export function consumePropertyLogRefresh(key: string): boolean {
  const k = String(key || '').trim()
  if (!k) return false
  const storageKey = `${LOG_REFRESH_PREFIX}${k}`
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

export function navigateToViewingNew(key: string, opts?: { title?: string }) {
  const k = String(key || '').trim()
  if (!k) return
  const q = [`key=${encodeURIComponent(k)}`]
  const title = String(opts?.title || '').trim()
  if (title) q.push(`propertyTitle=${encodeURIComponent(title)}`)
  uni.navigateTo({ url: `/pages/viewing/new?${q.join('&')}` })
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
