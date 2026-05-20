import { okResult } from '@/utils/result'
import { getCustomerDetail, mockCustomerList } from '@/mock/data/customers'
import { mockAnnouncements, mockMessages } from '@/mock/data/messages'
import {
  getPropertyDetail,
  mockMyPublishedProperties,
  mockPropertyList,
  mockPropertyLogs,
  resolvePropertyDetailKey,
} from '@/mock/data/properties'
import type { PropertyEditForm } from '@/types/property'
import { buildPropertyDetailKvFromForm } from '@/utils/propertyDetailKv'
import { mockSecuritySettings, mockUserProfile } from '@/mock/data/user'
import { mockVideoFaqList } from '@/mock/data/videoFaq'
import { mockDealFormDefaults, mockViewingList } from '@/mock/data/viewingDeal'
import { mockWorkbench } from '@/mock/data/workbench'

/** Mock DB: announcement id -> content updatedAt snapshot when marked read */
const mockAnnouncementReadContentAt: Record<string, string> = {}

function buildMockAnnouncementList() {
  const list = mockAnnouncements.map((a) => {
    const updatedAt = String(a.updatedAt || '2026-05-17 10:00')
    const read = mockAnnouncementReadContentAt[a.id] === updatedAt
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      popup: a.popup,
      popupStart: a.popupStart,
      popupEnd: a.popupEnd,
      read,
    }
  })
  return { list, unreadCount: list.filter((x) => !x.read).length }
}

function parseMockBuildingArea(p: { buildingArea?: number; metaLine?: string }) {
  if (p.buildingArea != null && Number.isFinite(Number(p.buildingArea))) return Number(p.buildingArea)
  const m = String(p.metaLine || '').match(/(\d+(?:\.\d+)?)\s*㎡/)
  return m ? Number(m[1]) : 0
}

function filterMockPropertyList(query: Record<string, string>) {
  let rows = [...mockPropertyList]
  const q = (query.q || '').trim().toLowerCase()
  if (q) {
    rows = rows.filter((p) =>
      [p.title, p.code, p.id, p.metaLine].some((s) => String(s).toLowerCase().includes(q)),
    )
  }
  const status = (query.status || '').trim()
  if (status) rows = rows.filter((p) => p.status === status)
  const regionId = query.districtRegionId != null && String(query.districtRegionId).trim() !== ''
    ? Number(query.districtRegionId)
    : NaN
  if (Number.isFinite(regionId)) {
    rows = rows.filter((p) => p.districtRegionId === regionId)
  }
  const minArea = query.minArea != null && String(query.minArea).trim() !== '' ? Number(query.minArea) : NaN
  const maxArea = query.maxArea != null && String(query.maxArea).trim() !== '' ? Number(query.maxArea) : NaN
  if (Number.isFinite(minArea)) {
    rows = rows.filter((p) => parseMockBuildingArea(p) >= minArea)
  }
  if (Number.isFinite(maxArea)) {
    rows = rows.filter((p) => {
      const a = parseMockBuildingArea(p)
      return a > 0 && a <= maxArea
    })
  }
  return rows
}

function filterMockCustomerList(query: Record<string, string>) {
  let rows = [...mockCustomerList]
  const scope = (query.scope || '').trim()
  if (scope === 'mine') rows = rows.filter((c) => c.scope === '私有')
  else if (scope === 'public') rows = rows.filter((c) => c.scope === '公有')
  const q = (query.q || '').trim().toLowerCase()
  if (q) {
    rows = rows.filter((c) =>
      [c.company, c.contactName, c.titleLine, c.id].some((s) => String(s).toLowerCase().includes(q)),
    )
  }
  return rows
}

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

function buildPropertyDetailPayload(key: string) {
  const resolved = resolvePropertyDetailKey(key)
  const d = getPropertyDetail(resolved)
  const form = mockEditFormForDetail(resolved)
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
        { id: 1, name: '黄埔区' },
        { id: 2, name: '南沙区' },
        { id: 3, name: '增城区' },
      ],
    })
  }

  if (method === 'GET' && path === '/api/mini/staff-peers') {
    return okResult({
      list: [
        { id: 'mock-peer-1', name: '王莉' },
        { id: 'mock-peer-2', name: '刘洋' },
      ],
      selfId: 'mock-self',
      selfName: mockUserProfile.name || '陈思远',
    })
  }

  if (method === 'GET' && path === '/api/meta/code-master') {
    return okResult({
      list: ['标准厂房', '独门独院厂房', '仓库', '工业用地', '写字楼', '产业园商铺'],
    })
  }

  if (method === 'GET' && path === '/api/property/list') {
    return okResult({ list: filterMockPropertyList(query) })
  }

  if (method === 'GET' && path === '/api/property/detail') {
    const key = query.key || query.id || query.code || 'P-8821'
    return okResult(buildPropertyDetailPayload(key))
  }

  if (method === 'GET' && path === '/api/property/edit-form') {
    const key = query.key || query.code || query.id || 'P-8821'
    return okResult(mockEditFormForDetail(resolvePropertyDetailKey(key)))
  }

  if (method === 'GET' && path === '/api/property/logs') {
    return okResult({ list: mockPropertyLogs })
  }

  if (method === 'GET' && path === '/api/property/my-published') {
    return okResult({ list: mockMyPublishedProperties })
  }

  if (method === 'GET' && path === '/api/customer/list') {
    return okResult({ list: filterMockCustomerList(query) })
  }

  if (method === 'GET' && path === '/api/customer/detail') {
    const id = query.id || 'zhangchen'
    return okResult(getCustomerDetail(id))
  }

  if (method === 'POST' && path === '/api/customer') {
    return okResult({ success: true, slug: 'cust-mock-new', id: 'cust-mock-new' })
  }

  if (method === 'POST' && path === '/api/customer/follow-up') {
    return okResult({ success: true })
  }

  const customerPutMatch = method === 'PUT' && path.match(/^\/api\/customer\/([^/]+)$/)
  if (customerPutMatch) {
    return okResult({ success: true })
  }

  if (method === 'GET' && path === '/api/message/list') {
    return okResult({ list: mockMessages })
  }

  if (method === 'GET' && path === '/api/user/profile') {
    return okResult(mockUserProfile)
  }

  if (method === 'PATCH' && path === '/api/user/profile') {
    const avatarUrl = typeof body?.avatarUrl === 'string' ? body.avatarUrl : mockUserProfile.avatarUrl
    Object.assign(mockUserProfile, { avatarUrl })
    return okResult({ ...mockUserProfile })
  }

  if (method === 'GET' && path === '/api/announcement/list') {
    return okResult(buildMockAnnouncementList())
  }

  const announceReadMatch = method === 'POST' && path.match(/^\/api\/announcement\/([^/]+)\/read$/)
  if (announceReadMatch) {
    const annId = announceReadMatch[1]
    const row = mockAnnouncements.find((a) => a.id === annId)
    if (!row) return okResult({ success: false })
    mockAnnouncementReadContentAt[annId] = String(row.updatedAt || '2026-05-17 10:00')
    return okResult({ success: true })
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

  if (method === 'POST' && path === '/api/message/dismiss') {
    return okResult({ success: true })
  }

  if (method === 'POST' && path.startsWith('/api/action/')) {
    const actionKey = path.replace('/api/action/', '')
    const payload = (body || {}) as Record<string, unknown>
    const existingCode = String(payload.code || '').trim()
    const generatedCode = existingCode || `P-MOCK-${Date.now()}`

    if (actionKey === 'save-draft') {
      return okResult({
        ok: true,
        code: generatedCode,
        auditState: 'draft',
        externalStatus: '草稿',
        auditHint: '未发布 · 保存后仍为草稿',
      })
    }
    if (actionKey === 'submit-property') {
      return okResult({
        ok: true,
        code: generatedCode,
        auditState: 'pending',
        externalStatus: '待审核',
        auditHint: '已提交发布 · 等待管理员审核',
      })
    }
    return okResult({ ok: true })
  }

  return { code: 404, message: `No mock for ${method} ${path}`, result: null }
}
