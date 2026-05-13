import { dispatchMock } from '@/mock/dispatch'
import type { ApiResult } from '@/utils/result'
import { unwrapResult } from '@/utils/result'

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

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
  return new Promise((resolve, reject) => {
    uni.request({
      url: full,
      method: 'GET',
      success(res) {
        try {
          if (res == null) {
            reject(new Error('uni.request: empty response'))
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
  return new Promise((resolve, reject) => {
    uni.request({
      url: full,
      method: 'POST',
      data,
      success(res) {
        try {
          if (res == null) {
            reject(new Error('uni.request: empty response'))
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
