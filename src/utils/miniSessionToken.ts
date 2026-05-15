/**
 * Industrial mini session: `{payloadBase64url}.{hmacSig}` (exactly two segments).
 * Standard JWT has three segments — reject those client-side so wrong API/cache does not persist.
 */

export function decodeIndustrialMiniPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  try {
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (b64.length % 4)) % 4
    b64 += '='.repeat(pad)
    const raw = typeof atob === 'function' ? atob(b64) : ''
    const o = JSON.parse(raw) as Record<string, unknown>
    return o && typeof o === 'object' ? o : null
  } catch {
    return null
  }
}

export function isIndustrialMiniSessionToken(token: unknown): token is string {
  if (typeof token !== 'string' || !token.includes('.')) return false
  if (token.split('.').length !== 2) return false
  const p = decodeIndustrialMiniPayload(token)
  if (!p || p.typ !== 'mini') return false
  const digits = String(p.phone ?? '').replace(/\D/g, '')
  return digits.length === 11 && /^1\d{10}$/.test(digits)
}
