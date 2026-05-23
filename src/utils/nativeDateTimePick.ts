/** Helpers for inline WeChat native date/time pickers (page-level only). */

export function splitYmdHm(raw: string, fallbackTime = '14:00') {
  const m = String(raw || '').trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)
  if (m) return { date: m[1], time: m[2] }
  return { date: '', time: fallbackTime }
}

export function joinYmdHm(date: string, time: string) {
  return `${date} ${time}`.trim()
}
