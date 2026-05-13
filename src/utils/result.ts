/** Standard Result<T> envelope for API / mock */

export const API_SUCCESS_CODE = 200

export interface ApiResult<T> {
  code: number
  message: string
  result: T
}

export function okResult<T>(result: T, message = 'success'): ApiResult<T> {
  return { code: API_SUCCESS_CODE, message, result }
}

export function unwrapResult<T>(body: unknown): T {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid response')
  }
  const r = body as ApiResult<T>
  if (typeof r.code !== 'number') {
    throw new Error('Invalid response')
  }
  if (r.code !== API_SUCCESS_CODE) {
    throw new Error(r.message || 'Request failed')
  }
  return r.result
}
