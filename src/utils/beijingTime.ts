/** Beijing time (Asia/Shanghai) — miniapp display & pickers. */

const BJ_TZ = 'Asia/Shanghai'

function beijingParts(date: Date = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: BJ_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const map = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]))
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
  }
}

export function formatBeijingYmdHm(date: Date = new Date()) {
  const p = beijingParts(date)
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`
}

export function nowBeijingYmdHm(): string {
  return formatBeijingYmdHm()
}

export function formatBeijingDisplay(input: unknown): string {
  const s = String(input ?? '').trim().replace('T', ' ')
  if (!s) return ''
  const m = s.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})/)
  if (!m) return s.replace('T', ' ')
  const pad = (n: string) => n.padStart(2, '0')
  return `${m[1]} ${pad(m[2])}:${pad(m[3])}`
}

export function toMysqlDateTime(input: unknown): string | null {
  const s = String(input ?? '').trim()
  if (!s) return null
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/)
  if (!m) return null
  const pad = (n: string | number) => String(n).padStart(2, '0')
  return `${m[1]}-${m[2]}-${pad(m[3])} ${pad(m[4])}:${pad(m[5])}:00`
}

/** Default slot: tomorrow 14:00 Beijing + 90min end */
export function defaultViewingSlotBeijing() {
  const base = parseBeijingNaiveToInstant(formatBeijingYmdHm()) ?? new Date()
  const start = new Date(base.getTime() + 24 * 60 * 60 * 1000)
  const p = beijingParts(start)
  p.hour = '14'
  p.minute = '00'
  const startStr = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`
  const end = new Date(parseBeijingNaiveToInstant(startStr)!.getTime() + 90 * 60 * 1000)
  return { start: startStr, end: formatBeijingYmdHm(end) }
}

/** Follow-up timeline line: normalize date prefix before ` · `. */
export function formatTimelineLine(line: string): string {
  const s = String(line || '').trim()
  const sep = s.indexOf(' · ')
  if (sep < 0) return formatBeijingDisplay(s) || s
  const head = formatBeijingDisplay(s.slice(0, sep).trim()) || s.slice(0, sep).trim()
  return `${head}${s.slice(sep)}`
}

export function parseBeijingNaiveToInstant(input: unknown): Date | null {
  const mysql = toMysqlDateTime(input)
  if (!mysql) return null
  const m = mysql.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (!m) return null
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+08:00`)
}
