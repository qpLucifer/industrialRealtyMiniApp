/**
 * Industrial mini session: `{payloadBase64url}.{hmacSig}` (exactly two segments).
 * Standard JWT has three segments — reject those client-side so wrong API/cache does not persist.
 */

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Decode standard base64 (with padding) to UTF-8 string. Works on WeChat real device (no atob). */
function base64ToUtf8(b64: string): string {
  if (typeof atob === 'function') {
    return atob(b64)
  }
  const wxApi = typeof wx !== 'undefined' ? wx : undefined
  if (wxApi && typeof wxApi.base64ToArrayBuffer === 'function') {
    const ab = wxApi.base64ToArrayBuffer(b64) as ArrayBuffer
    const u8 = new Uint8Array(ab)
    let out = ''
    for (let i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i])
    return out
  }
  if (typeof uni !== 'undefined' && typeof uni.base64ToArrayBuffer === 'function') {
    const ab = uni.base64ToArrayBuffer(b64) as ArrayBuffer
    const u8 = new Uint8Array(ab)
    let out = ''
    for (let i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i])
    return out
  }
  return base64ToUtf8Manual(b64)
}

function base64ToUtf8Manual(b64: string): string {
  const s = b64.replace(/=+$/, '')
  const out: number[] = []
  for (let i = 0; i < s.length; i += 4) {
    const c1 = BASE64_ALPHABET.indexOf(s[i] ?? '')
    const c2 = BASE64_ALPHABET.indexOf(s[i + 1] ?? '')
    const c3 = BASE64_ALPHABET.indexOf(s[i + 2] ?? '')
    const c4 = BASE64_ALPHABET.indexOf(s[i + 3] ?? '')
    if (c1 < 0 || c2 < 0) break
    const n = (c1 << 18) | (c2 << 12) | ((c3 >= 0 ? c3 : 0) << 6) | (c4 >= 0 ? c4 : 0)
    out.push((n >> 16) & 255)
    if (s[i + 2] && s[i + 2] !== '=' && c3 >= 0) out.push((n >> 8) & 255)
    if (s[i + 3] && s[i + 3] !== '=' && c4 >= 0) out.push(n & 255)
  }
  let str = ''
  for (let i = 0; i < out.length; i++) str += String.fromCharCode(out[i])
  return str
}

export function decodeIndustrialMiniPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  try {
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (b64.length % 4)) % 4
    b64 += '='.repeat(pad)
    const raw = base64ToUtf8(b64)
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
