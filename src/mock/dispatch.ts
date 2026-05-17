import { okResult } from '@/utils/result'
import { getCustomerDetail, mockCustomerList } from '@/mock/data/customers'
import { mockAnnouncements, mockMessages } from '@/mock/data/messages'
import {
  getPropertyDetail,
  mockMyPublishedProperties,
  mockPropertyList,
  mockPropertyLogs,
} from '@/mock/data/properties'
import type { PropertyEditForm } from '@/types/property'
import { buildPropertyDetailKvFromForm } from '@/utils/propertyDetailKv'
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

function mockEditFormForDetail(id: string): PropertyEditForm {
  const d = getPropertyDetail(id)
  return {
    code: id,
    types: d.propertyType ? [d.propertyType] : ['标准厂房'],
    listTitle: d.detailTitle,
    companyName: d.company,
    address: d.addrKv,
    district: d.district || '黄埔区',
    lat: d.lat || '',
    lng: d.lng || '',
    ownerContact: '王业主',
    riskTag: '无',
    photoChecklist: ['门口形象照', '车间全景', '配电房'],
    landMu: 12.5,
    buildingArea: 4200,
    workshopSize: '80×40×9',
    structureTypes: ['钢构'],
    powerKva: 800,
    freightLifts: 2,
    dining: '集中食堂',
    usageRemark: '空置可租',
    propertyRights: ['国有'],
    mortgageDispute: '无',
    firePass: '是',
    subsidy: '无',
    highlights: d.specLine,
    rentSaleType: '出租',
    propertyFee: 5,
    contactName: '李昭',
    contactPhone: '13800138000',
    internalNote: '业主配合度高',
  }
}

function buildPropertyDetailPayload(id: string) {
  const d = getPropertyDetail(id)
  const form = mockEditFormForDetail(id)
  const kv = buildPropertyDetailKvFromForm(form, {
    type: d.propertyType,
    district: d.district,
    company: d.company,
    statusTag: d.externalStatus || d.leaseChip,
    priceLine: d.priceLine,
  })
  const rejectReason = d.auditKey === 'rejected' ? d.rejectReason || d.auditHint : ''
  return {
    ...d,
    rejectReason,
    kv,
    mediaImages: d.mediaImages ?? [],
    mediaVideos: d.mediaVideos ?? [],
  }
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

  if (method === 'GET' && path === '/api/meta/regions') {
    return okResult({
      list: [
        { id: 'r1', name: '黄埔区' },
        { id: 'r2', name: '南沙区' },
        { id: 'r3', name: '增城区' },
      ],
    })
  }

  if (method === 'GET' && path === '/api/meta/code-master') {
    return okResult({
      list: ['标准厂房', '独门独院厂房', '仓库', '工业用地', '写字楼', '产业园商铺'],
    })
  }

  if (method === 'GET' && path === '/api/property/list') {
    return okResult({ list: mockPropertyList })
  }

  if (method === 'GET' && path === '/api/property/detail') {
    const id = query.id || 'P-8821'
    return okResult(buildPropertyDetailPayload(id))
  }

  if (method === 'GET' && path === '/api/property/edit-form') {
    const code = query.code || query.id || 'P-8821'
    return okResult(mockEditFormForDetail(code))
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
    const list = mockVideoFaqList.filter((x) => x.miniProgramSearch !== false)
    return okResult({ list })
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
