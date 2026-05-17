import type { AnnouncementItem } from '@/types/message'

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

export function countUnreadAnnouncements(list: AnnouncementItem[]): number {
  return list.filter((a) => !a.read).length
}

export function pickActivePopupAnnouncements(
  list: AnnouncementItem[],
  nowMs = Date.now(),
): AnnouncementItem[] {
  return list
    .filter((a) => {
      const id = String(a.id ?? '').trim()
      if (!id || a.read) return false
      return isAnnouncementPopupActive(a, nowMs)
    })
    .sort((a, b) => Number(b.id) - Number(a.id))
}
