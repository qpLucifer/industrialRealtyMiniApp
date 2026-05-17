import type { AnnouncementItem } from '@/types/message'

const DISMISS_STORAGE_KEY = 'mini_announce_dismissed_ids'

/** Parse API datetime (YYYY-MM-DDTHH:mm or with space). */
export function parseAnnouncementDateTime(raw: string | undefined | null): number {
  const s = String(raw ?? '')
    .trim()
    .replace(' ', 'T')
  if (!s) return NaN
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : NaN
}

export function isAnnouncementPopupActive(item: AnnouncementItem, nowMs = Date.now()): boolean {
  if (String(item.popup ?? '').trim() !== '是') return false
  const start = parseAnnouncementDateTime(item.popupStart)
  const end = parseAnnouncementDateTime(item.popupEnd)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false
  return nowMs >= start && nowMs <= end
}

export function getDismissedAnnouncementIds(): Set<string> {
  try {
    const raw = uni.getStorageSync(DISMISS_STORAGE_KEY)
    if (Array.isArray(raw)) return new Set(raw.map((x) => String(x)))
    if (typeof raw === 'string' && raw.trim()) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return new Set(parsed.map((x) => String(x)))
    }
  } catch {
    /* ignore corrupt storage */
  }
  return new Set()
}

export function dismissAnnouncementId(id: string) {
  const set = getDismissedAnnouncementIds()
  set.add(String(id))
  uni.setStorageSync(DISMISS_STORAGE_KEY, [...set])
}

export function pickActivePopupAnnouncements(
  list: AnnouncementItem[],
  nowMs = Date.now(),
): AnnouncementItem[] {
  const dismissed = getDismissedAnnouncementIds()
  return list
    .filter((a) => {
      const id = String(a.id ?? '').trim()
      if (!id) return false
      if (dismissed.has(id)) return false
      return isAnnouncementPopupActive(a, nowMs)
    })
    .sort((a, b) => Number(b.id) - Number(a.id))
}
