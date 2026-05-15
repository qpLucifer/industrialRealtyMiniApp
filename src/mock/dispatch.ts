import { okResult } from '@/utils/result'
import { getCustomerDetail, mockCustomerList } from '@/mock/data/customers'
import { mockAnnouncements, mockMessages } from '@/mock/data/messages'
import {
  getPropertyDetail,
  mockMyPublishedProperties,
  mockPropertyList,
  mockPropertyLogs,
  propertyDetailKv,
} from '@/mock/data/properties'
import { mockSecuritySettings, mockUserProfile } from '@/mock/data/user'
import { mockVideoFaqList } from '@/mock/data/videoFaq'
import { mockDealFormDefaults, mockViewingList } from '@/mock/data/viewingDeal'
import { mockWorkbench } from '@/mock/data/workbench'

function parseQuery(url: string): Record<string, string> {
  const q: Record<string, string> = {}
  const i = url.indexOf('?')
  if (i === -1) return q
  const search = url.slice(i + 1)
  search.split('&').forEach((pair) => {
    const [k, v] = pair.split('=').map((s) => decodeURIComponent(s || ''))
    if (k) q[k] = v || ''
  })
  return q
}

function stripQuery(url: string) {
  const i = url.indexOf('?')
  return i === -1 ? url : url.slice(0, i)
}

function buildPropertyDetailPayload(id: string) {
  const d = getPropertyDetail(id)
  const kv = JSON.parse(JSON.stringify(propertyDetailKv)) as typeof propertyDetailKv
  kv.s1[1].dd = d.company
  kv.s1[2].dd = d.addrKv
  return { ...d, kv }
}

/** Client-side mock router — returns full ApiResult JSON (same shape as future HTTP) */
export async function dispatchMock(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Promise<ReturnType<typeof okResult<unknown>>> {
  const path = stripQuery(url)
  const query = parseQuery(url)
  await Promise.resolve()

  if (method === 'POST' && path === '/api/auth/login') {
    return okResult({ token: 'mock-miniapp-token', profile: mockUserProfile })
  }

  if (method === 'POST' && path === '/api/auth/mini-refresh') {
    return okResult({
      token: 'mock-miniapp-token',
      expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
      expiresIn: 365 * 24 * 60 * 60,
      profile: mockUserProfile,
    })
  }

  if (method === 'POST' && path === '/api/auth/mini-wechat-phone') {
    return okResult({
      token: 'mock-miniapp-token',
      expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
      expiresIn: 365 * 24 * 60 * 60,
      profile: mockUserProfile,
    })
  }

  if (method === 'POST' && path === '/api/auth/mini-session') {
    return okResult({
      token: 'mock-miniapp-token',
      expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
      expiresIn: 365 * 24 * 60 * 60,
      profile: mockUserProfile,
    })
  }

  if (method === 'GET' && path === '/api/workbench/summary') {
    return okResult(mockWorkbench)
  }

  if (method === 'GET' && path === '/api/property/list') {
    return okResult({ list: mockPropertyList })
  }

  if (method === 'GET' && path === '/api/property/detail') {
    const id = query.id || 'P-8821'
    return okResult(buildPropertyDetailPayload(id))
  }

  if (method === 'GET' && path === '/api/property/logs') {
    return okResult({ list: mockPropertyLogs })
  }

  if (method === 'GET' && path === '/api/property/my-published') {
    return okResult({ list: mockMyPublishedProperties })
  }

  if (method === 'GET' && path === '/api/customer/list') {
    return okResult({ list: mockCustomerList })
  }

  if (method === 'GET' && path === '/api/customer/detail') {
    const id = query.id || 'zhangchen'
    return okResult(getCustomerDetail(id))
  }

  if (method === 'GET' && path === '/api/message/list') {
    return okResult({ list: mockMessages })
  }

  if (method === 'GET' && path === '/api/user/profile') {
    return okResult(mockUserProfile)
  }

  if (method === 'GET' && path === '/api/announcement/list') {
    return okResult({ list: mockAnnouncements })
  }

  if (method === 'GET' && path === '/api/video-faq/list') {
    return okResult({ list: mockVideoFaqList })
  }

  if (method === 'GET' && path === '/api/viewing/list') {
    return okResult({ list: mockViewingList })
  }

  if (method === 'GET' && path === '/api/deal/form-defaults') {
    return okResult(mockDealFormDefaults)
  }

  if (method === 'GET' && path === '/api/settings/security') {
    return okResult(mockSecuritySettings)
  }

  if (method === 'POST' && path === '/api/settings/security') {
    return okResult({ saved: true, ...(body || {}) })
  }

  if (method === 'POST' && path.startsWith('/api/action/')) {
    return okResult({ ok: true })
  }

  return { code: 404, message: `No mock for ${method} ${path}`, result: null }
}
