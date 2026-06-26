import { okResult, type ApiResult } from '@/utils/result'

function failResult(code: number, message: string): ApiResult<null> {
  return { code, message, result: null }
}
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
import { maskPhone } from '@/utils/phoneMask'
import { defaultStatusLabelForRentSale } from '@/utils/propertyListingStatus'
import { mockVideoFaqList } from '@/mock/data/videoFaq'
import { mockDealFormDefaults, mockViewingList } from '@/mock/data/viewingDeal'
import { mockWorkbench } from '@/mock/data/workbench'
import {
  filterMockLandAuctionRows,
  filterMockLandAuctionScope,
  getMockLandAuctionDetail,
  landAuctionDetailToListItem,
  mockLandAuctionDetails,
  mockLandAuctionStatsFromRows,
} from '@/mock/data/landAuction'
import type { LandAuctionDetail, LandAuctionStatus } from '@/types/landAuction'
import { pickActivePopupAnnouncements } from '@/utils/announcement'

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

function paginateMockRows<T>(rows: T[], query: Record<string, string>) {
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10))
  const total = rows.length
  const start = (page - 1) * pageSize
  const list = rows.slice(start, start + pageSize)
  return { list, total, page, pageSize, hasMore: page * pageSize < total }
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
  const available = query.available === '1' || query.available === 'true'
  if (available) {
    rows = rows.filter((p) => p.status === '出租' || p.status === '出售' || p.status === '待租' || p.status === '待售')
  } else {
    const status = (query.status || '').trim()
    if (status) rows = rows.filter((p) => p.status === status)
  }
  const featuredOnly = query.featured === '1' || query.featured === 'true' || query.featured === 1
  if (featuredOnly) {
    rows = rows.filter((p) => Boolean((p as { featured?: boolean }).featured))
  }
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

function beijingTodayYmdMock() {
  return new Date().toLocaleString('en-CA', { timeZone: 'Asia/Shanghai', hour12: false }).slice(0, 10)
}

function isMockReminderOnOrAfterToday(c: { nextReminderAt?: string; nextReminder?: string }) {
  const raw = c.nextReminderAt || c.nextReminder
  if (!raw || raw === '—') return false
  const normalized = String(raw).trim().replace('T', ' ').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) && normalized >= beijingTodayYmdMock()
}

function mapMockListReminderDisplay<T extends { nextReminder?: string; nextReminderAt?: string; nextLine?: string }>(
  c: T,
): T {
  if (!isMockReminderOnOrAfterToday(c)) {
    return { ...c, nextReminder: '', nextLine: '—' }
  }
  return c
}

function parseMockReminderAt(c: { nextReminderAt?: string; nextReminder?: string }) {
  const raw = c.nextReminderAt || c.nextReminder
  if (!raw || raw === '—') return null
  const d = new Date(String(raw).replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? null : d
}

function filterMockCustomerList(query: Record<string, string>) {
  let rows = [...mockCustomerList]
  const scope = (query.scope || '').trim()
  if (scope === 'mine') rows = rows.filter((c) => c.scope === '私有')
  else if (scope === 'public') rows = rows.filter((c) => c.scope === '公有')
  else if (scope === 'visible') rows = rows.filter((c) => c.scope === '公有' || c.scope === '私有')
  const regionId = Number(query.districtRegionId)
  if (Number.isFinite(regionId) && regionId > 0) {
    rows = rows.filter((c) => c.districtRegionId === regionId)
  }
  const grade = (query.grade || '').trim()
  if (grade) rows = rows.filter((c) => c.grade === grade)
  const dealStatus = (query.dealStatus || '').trim()
  if (dealStatus) rows = rows.filter((c) => c.dealStatus === dealStatus)
  const reminder = (query.reminder || '').trim()
  if (reminder) {
    const now = Date.now()
    const weekEnd = now + 7 * 24 * 60 * 60 * 1000
    rows = rows.filter((c) => {
      const d = parseMockReminderAt(c)
      if (!d) return false
      const t = d.getTime()
      if (reminder === 'due') return true
      if (reminder === 'overdue') return t <= now
      if (reminder === 'week') return t > now && t <= weekEnd
      return true
    })
  }
  const q = (query.q || '').trim().toLowerCase()
  if (q) {
    rows = rows.filter((c) =>
      [c.company, c.contactName, c.titleLine, c.id, c.district, c.dealStatus].some((s) =>
        String(s || '').toLowerCase().includes(q),
      ),
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
    auditState: d.auditKey,
    canEditProperty: d.canEditProperty ?? d.auditKey !== 'live',
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
  let kv = buildPropertyDetailKvFromForm(form, {
    type: d.propertyType,
    district: d.district,
    company: d.company,
    statusTag: d.externalStatus || d.leaseChip,
    priceLine: d.priceLine,
  })
  if (mockSecuritySettings.maskPropertyContact) {
    const maskRows = (rows: { dt: string; dd: string }[]) =>
      rows.map((r) => {
        if (r.dt === '联系人电话' || r.dt === '业主联系人') {
          const raw = String(r.dd || '').trim()
          if (!raw || raw === '—') return r
          return { ...r, dd: maskPhone(raw) }
        }
        return r
      })
    kv = { ...kv, s1: maskRows(kv.s1), s8: maskRows(kv.s8) }
  }
  const rejectReason = d.auditKey === 'rejected' ? d.rejectReason || d.auditHint : ''
  return {
    ...d,
    canViewPrivacy: d.canViewPrivacy !== false,
    canEditProperty:
      d.canEditProperty === true || d.auditKey === 'draft' || d.auditKey === 'rejected',
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

  if (method === 'POST' && path === '/api/auth/mini-reviewer-phone') {
    return okResult({
      token: 'mock-miniapp-token',
      expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
      expiresIn: 365 * 24 * 60 * 60,
      profile: mockUserProfile,
    })
  }

  if (method === 'GET' && path === '/api/workbench/summary') {
    const ann = buildMockAnnouncementList()
    const popup = pickActivePopupAnnouncements(ann.list)[0] ?? null
    return okResult({
      ...mockWorkbench,
      unreadAnnounceCount: ann.unreadCount,
      popupAnnouncement: popup,
    })
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
    const all = [
      { id: 'mock-peer-1', name: '王莉', regionIds: [1] },
      { id: 'mock-peer-2', name: '刘洋', regionIds: [2, 3] },
    ]
    const regionRaw = query.districtRegionId ?? query.regionId
    const regionId = regionRaw != null && regionRaw !== '' ? Number(regionRaw) : NaN
    let list =
      Number.isFinite(regionId) && regionId > 0
        ? all.filter((p) => p.regionIds.includes(regionId)).map(({ id, name }) => ({ id, name }))
        : all.map(({ id, name }) => ({ id, name }))
    const q = String(query.q || '')
      .trim()
      .toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    return okResult({
      list,
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
    return okResult(paginateMockRows(filterMockPropertyList(query), query))
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

  if (method === 'POST' && path === '/api/property/follow-up') {
    return okResult({ success: true })
  }

  if (method === 'POST' && path === '/api/property/share-link') {
    const code = String(body?.code || body?.id || body?.key || 'P-8821')
    const token = `mock${Date.now().toString(36)}`
    return okResult({
      token,
      sharePath: `pages/property/share-view?token=${encodeURIComponent(token)}`,
      imageUrl: 'https://picsum.photos/400/300',
      shareCoverUrl: `https://jiayizhou.top/api/public/property-share-cover?token=${encodeURIComponent(token)}`,
      expiresAt: '2026-06-09 14:00:00',
      ttlHours: 72,
      title: `Mock · ${code}`,
    })
  }

  if (method === 'GET' && path === '/api/public/property-share') {
    const d = getPropertyDetail('P-8821')
    return okResult({
      title: d.detailTitle,
      specLine: d.specLine,
      mediaImages: d.mediaImages ?? [],
      mediaVideos: d.mediaVideos ?? [],
      viewOnly: true,
    })
  }

  if (method === 'GET' && path === '/api/property/my-published') {
    return okResult(paginateMockRows(mockMyPublishedProperties, query))
  }

  if (method === 'GET' && path === '/api/customer/list') {
    const rows = filterMockCustomerList(query).map((c) => mapMockListReminderDisplay(c))
    return okResult(paginateMockRows(rows, query))
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
    return okResult(paginateMockRows(mockMessages, query))
  }

  if (method === 'GET' && path === '/api/land-auction/summary') {
    const rows = filterMockLandAuctionScope(mockLandAuctionDetails, query)
    return okResult({ stats: mockLandAuctionStatsFromRows(rows) })
  }

  if (method === 'GET' && path === '/api/land-auction/list') {
    const rows = filterMockLandAuctionRows(mockLandAuctionDetails, query)
    const list = rows.map(landAuctionDetailToListItem)
    return okResult(paginateMockRows(list, query))
  }

  const landDetailMatch = method === 'GET' && path.match(/^\/api\/land-auction\/(\d+)$/)
  if (landDetailMatch) {
    const id = Number(landDetailMatch[1])
    const row = getMockLandAuctionDetail(id)
    if (!row) return failResult(404, '记录不存在或无权查看')
    return okResult(row)
  }

  if (method === 'POST' && path === '/api/land-auction') {
    const nextId = Math.max(0, ...mockLandAuctionDetails.map((r) => r.id)) + 1
    const status = (body?.auctionStatus as LandAuctionStatus) || 'upcoming'
    const row: LandAuctionDetail = {
      id: nextId,
      title: String(body?.title || '未命名地块'),
      districtRegionId: Number(body?.districtRegionId) || null,
      region: String(body?.region || ''),
      areaMu: body?.areaMu != null && body.areaMu !== '' ? Number(body.areaMu) : null,
      startPriceWan:
        body?.startPriceWan != null && body.startPriceWan !== '' ? Number(body.startPriceWan) : null,
      dealPriceWan:
        body?.dealPriceWan != null && body.dealPriceWan !== '' ? Number(body.dealPriceWan) : null,
      auctionStatus: status,
      listingDate: String(body?.listingDate || ''),
      auctionStartAt: String(body?.auctionStartAt || ''),
      auctionEndAt: String(body?.auctionEndAt || ''),
      completedAt: String(body?.completedAt || ''),
      remark: String(body?.remark || ''),
      published: body?.published === false ? false : true,
      sortOrder: Number(body?.sortOrder) || 0,
      updatedAt: '2026-05-25 12:00',
      canEdit: true,
    }
    mockLandAuctionDetails.unshift(row)
    return okResult({ success: true, id: nextId })
  }

  const landPutMatch = method === 'PUT' && path.match(/^\/api\/land-auction\/(\d+)$/)
  if (landPutMatch) {
    const id = Number(landPutMatch[1])
    const idx = mockLandAuctionDetails.findIndex((r) => r.id === id)
    if (idx < 0) return failResult(404, '记录不存在')
    const prev = mockLandAuctionDetails[idx]!
    mockLandAuctionDetails[idx] = {
      ...prev,
      title: String(body?.title ?? prev.title),
      districtRegionId:
        body?.districtRegionId != null ? Number(body.districtRegionId) : prev.districtRegionId,
      region: String(body?.region ?? prev.region),
      areaMu: body?.areaMu != null && body.areaMu !== '' ? Number(body.areaMu) : prev.areaMu,
      startPriceWan:
        body?.startPriceWan != null && body.startPriceWan !== ''
          ? Number(body.startPriceWan)
          : prev.startPriceWan,
      dealPriceWan:
        body?.dealPriceWan != null && body.dealPriceWan !== ''
          ? Number(body.dealPriceWan)
          : prev.dealPriceWan,
      auctionStatus: (body?.auctionStatus as LandAuctionStatus) || prev.auctionStatus,
      listingDate: body?.listingDate != null ? String(body.listingDate) : prev.listingDate,
      auctionStartAt: body?.auctionStartAt != null ? String(body.auctionStartAt) : prev.auctionStartAt,
      auctionEndAt: body?.auctionEndAt != null ? String(body.auctionEndAt) : prev.auctionEndAt,
      completedAt: body?.completedAt != null ? String(body.completedAt) : prev.completedAt,
      remark: body?.remark != null ? String(body.remark) : prev.remark,
      updatedAt: '2026-05-25 12:00',
    }
    return okResult({ success: true })
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
    const full = buildMockAnnouncementList()
    const paged = paginateMockRows(full.list, query)
    return okResult({ ...paged, unreadCount: full.unreadCount })
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
    const rows = mockVideoFaqList.filter((x) => x.miniProgramSearch !== false)
    return okResult(paginateMockRows(rows, query))
  }

  if (method === 'GET' && path === '/api/viewing/list') {
    return okResult(paginateMockRows(mockViewingList, query))
  }

  if (method === 'GET' && path === '/api/deal/form-defaults') {
    return okResult(mockDealFormDefaults)
  }

  if (method === 'GET' && path === '/api/upload/limits') {
    return okResult({
      maxImageBytes: 50 * 1024 * 1024,
      maxVideoBytes: 500 * 1024 * 1024,
      maxImagesPerPick: 5,
      maxVideosPerPick: 1,
      multipartChunkBytes: 5 * 1024 * 1024,
    })
  }

  if (method === 'POST' && path === '/api/upload/oss/multipart/init') {
    return okResult({
      sessionId: `mock-session-${Date.now()}`,
      chunkSize: 5 * 1024 * 1024,
      totalParts: 3,
    })
  }

  if (method === 'POST' && path === '/api/upload/oss/multipart/part') {
    return okResult({ partNumber: 1, receivedParts: 1, uploadedBytes: 1, totalBytes: 1 })
  }

  if (method === 'POST' && path === '/api/upload/oss/multipart/complete') {
    return okResult({
      url: 'https://example.com/mock-oss/video.mp4',
      key: 'mock/video.mp4',
    })
  }

  if (method === 'GET' && path === '/api/settings/security') {
    return okResult(mockSecuritySettings)
  }

  if (method === 'POST' && path === '/api/settings/security') {
    return { code: 403, message: '仅管理员可修改安全策略', result: null }
  }

  if (method === 'POST' && path === '/api/message/dismiss') {
    return okResult({ success: true })
  }

  if (method === 'PUT' && path === '/api/property/listing-status') {
    const code = String((body as Record<string, unknown>)?.code || '').trim()
    const externalStatus = String((body as Record<string, unknown>)?.externalStatus || '').trim()
    const featured =
      (externalStatus === '出售' || externalStatus === '待售') &&
      (body as Record<string, unknown>)?.featured === true
    return okResult({
      externalStatus: externalStatus || '出租',
      featured,
      listingLine1: externalStatus || '出租',
      listingLine2: `Mock · ${code || '—'}`,
    })
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
      const auditOn = mockSecuritySettings.auditPublish
      const rentSale = String(payload.rentSaleType || '出租')
      const liveStatus = defaultStatusLabelForRentSale(rentSale)
      return okResult({
        ok: true,
        code: generatedCode,
        auditState: auditOn ? 'pending' : 'live',
        externalStatus: auditOn ? '待审核' : liveStatus,
        auditHint: auditOn ? '已提交发布 · 等待管理员审核' : '已发布上架 · 无需管理员审核',
      })
    }
    return okResult({ ok: true })
  }

  return { code: 404, message: `No mock for ${method} ${path}`, result: null }
}
