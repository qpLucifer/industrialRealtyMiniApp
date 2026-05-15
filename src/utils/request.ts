import { dispatchMock } from '@/mock/dispatch'
import type { ApiResult } from '@/utils/result'
import { unwrapResult } from '@/utils/result'
import { clearMiniSessionAndGoLogin } from '@/utils/session'

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'
const API_BASE = String(import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

function resolveUrl(url: string) {
  if (USE_MOCK) return url
  if (/^https?:\/\//i.test(url)) return url
  const base = API_BASE
  if (!base) return url
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

function joinUrl(url: string, query?: Record<string, string | number | boolean | undefined>) {
  if (!query || Object.keys(query).length === 0) return url
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return qs ? `${url}?${qs}` : url
}

export async function get<T>(url: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const full = joinUrl(url, query)
  if (USE_MOCK) {
    const raw = await dispatchMock('GET', full)
    return unwrapResult<T>(raw)
  }
  const resolved = resolveUrl(full)
  const headers: Record<string, string> = { 'X-Client': 'miniapp' }
  const token = uni.getStorageSync('mini_token')
  if (token && typeof token === 'string') {
    headers.Authorization = `Bearer ${token}`
    // Duplicate for proxies / runtimes that mishandle Authorization (WeChat legal-domain requests).
    headers['X-Mini-Token'] = token
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: resolved,
      method: 'GET',
      header: headers,
      success(res) {
        try {
          if (res == null) {
            reject(new Error('uni.request: empty response'))
            return
          }
          const sc = res.statusCode ?? 0
          if (sc === 401 && !USE_MOCK) {
            const data = res.data as ApiResult<unknown> | undefined
            const msg = data && typeof data === 'object' && 'message' in data ? String((data as ApiResult<unknown>).message) : ''
            clearMiniSessionAndGoLogin(msg)
            reject(new Error(msg || 'Unauthorized'))
            return
          }
          resolve(unwrapResult<T>(res.data))
        } catch (e) {
          reject(e)
        }
      },
      fail(err) {
        reject(err ?? new Error('uni.request failed'))
      },
    })
  })
}

export async function post<T>(
  url: string,
  data?: Record<string, unknown>,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const full = joinUrl(url, query)
  if (USE_MOCK) {
    const raw = await dispatchMock('POST', full, data)
    return unwrapResult<T>(raw)
  }
  const resolved = resolveUrl(full)
  const headers: Record<string, string> = { 'X-Client': 'miniapp', 'Content-Type': 'application/json' }
  const token = uni.getStorageSync('mini_token')
  if (token && typeof token === 'string') {
    headers.Authorization = `Bearer ${token}`
    headers['X-Mini-Token'] = token
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: resolved,
      method: 'POST',
      data,
      header: headers,
      success(res) {
        try {
          if (res == null) {
            reject(new Error('uni.request: empty response'))
            return
          }
          const sc = res.statusCode ?? 0
          if (sc === 401 && !USE_MOCK) {
            const data = res.data as ApiResult<unknown> | undefined
            const msg = data && typeof data === 'object' && 'message' in data ? String((data as ApiResult<unknown>).message) : ''
            clearMiniSessionAndGoLogin(msg)
            reject(new Error(msg || 'Unauthorized'))
            return
          }
          resolve(unwrapResult<T>(res.data))
        } catch (e) {
          reject(e)
        }
      },
      fail(err) {
        reject(err ?? new Error('uni.request failed'))
      },
    })
  })
}

export function rawMockResponse<T>(result: T): ApiResult<T> {
  return { code: 200, message: 'success', result }
}
