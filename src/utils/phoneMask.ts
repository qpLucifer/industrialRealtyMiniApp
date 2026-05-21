/** Client-side phone mask — mirrors server maskPhone(). */

export function maskPhone(phone: string): string {
  const s = String(phone || '').replace(/\s/g, '')
  if (s.length < 7) return s || '—'
  return `${s.slice(0, 3)}****${s.slice(-4)}`
}
