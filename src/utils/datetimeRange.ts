import { parseBeijingNaiveToInstant } from '@/utils/beijingTime'

export const END_AFTER_START_MSG = '结束时间须晚于开始时间'

/** True when both parse as Beijing naive datetimes and end is strictly after start. */
export function isEndAfterStart(start: string, end: string): boolean {
  const s = parseBeijingNaiveToInstant(start)?.getTime()
  const e = parseBeijingNaiveToInstant(end)?.getTime()
  if (s == null || e == null) return false
  return e > s
}

export function assertEndAfterStart(start: string, end: string): string | null {
  const startS = String(start || '').trim()
  const endS = String(end || '').trim()
  if (!startS || !endS) return '请填写开始与结束时间'
  if (!isEndAfterStart(startS, endS)) return END_AFTER_START_MSG
  return null
}
