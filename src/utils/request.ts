import { dispatchMock } from '@/mock/dispatch'
import type { PropertyEditForm } from '@/types/property'
import type { ApiResult } from '@/utils/result'
import { unwrapResult } from '@/utils/result'
import { clearMiniSessionAndGoLogin } from '@/utils/session'

/** Explicit `VITE_USE_MOCK=true` only — production builds default to real API. */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
export const API_BASE = String(import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

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

/** API / gateway error body — `{ code, message }`, or `msg` / `error` / plain string. */
function messageFromApiBody(data: unknown): string {
  if (data == null) return ''
  if (typeof data === 'string') {
    const t = data.trim()
    if (!t) return ''
    try {
      const o = JSON.parse(t) as Record<string, unknown>
      return messageFromApiBody(o)
    } catch {
      return t.length > 200 ? `${t.slice(0, 200)}…` : t
    }
  }
  if (typeof data !== 'object') return ''
  const o = data as Record<string, unknown>
  const candidates = [o.message, o.msg, o.error, o.error_description, o.detail]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

function handleHttpResponse<T>(res: UniApp.RequestSuccessCallbackResult): T {
  if (res == null) {
    throw new Error('uni.request: empty response')
  }
  const sc = res.statusCode ?? 0
  if (sc === 401 && !USE_MOCK) {
    const msg = messageFromApiBody(res.data)
    clearMiniSessionAndGoLogin(msg)
    throw new Error(msg || 'Unauthorized')
  }
  if (sc >= 400) {
    const msg = messageFromApiBody(res.data) || `请求失败 (${sc})`
    throw new Error(msg)
  }
  return unwrapResult<T>(res.data)
}

/** Meta APIs live here so mp-weixin pages only require utils/request.js (see .cursor/rules/mp-weixin.mdc). */
export function fetchRegionDefs() {
  return get<{ list: { id: string; name: string }[] }>('/api/meta/regions')
}

export function fetchCodeMasterLabels(type: string) {
  return get<{ list: string[] }>('/api/meta/code-master', { type })
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
          resolve(handleHttpResponse<T>(res))
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

export async function patch<T>(
  url: string,
  data?: Record<string, unknown>,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const full = joinUrl(url, query)
  if (USE_MOCK) {
    const raw = await dispatchMock('PATCH', full, data)
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
      method: 'PATCH',
      data,
      header: headers,
      success(res) {
        try {
          resolve(handleHttpResponse<T>(res))
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

export async function put<T>(
  url: string,
  data?: Record<string, unknown>,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const full = joinUrl(url, query)
  if (USE_MOCK) {
    const raw = await dispatchMock('PUT', full, data)
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
      method: 'PUT',
      data,
      header: headers,
      success(res) {
        try {
          resolve(handleHttpResponse<T>(res))
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
          resolve(handleHttpResponse<T>(res))
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

/** OSS / relative media paths — kept in request.ts for mp-weixin module graph stability. */
const OSS_PUBLIC_BASE = String(import.meta.env.VITE_OSS_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')

export function resolveMediaUrl(path: string): string {
  const p = String(path || '').trim()
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  if (OSS_PUBLIC_BASE) return `${OSS_PUBLIC_BASE}/${p.replace(/^\//, '')}`
  if (API_BASE && p.startsWith('/')) return `${API_BASE}${p}`
  return p
}

const VIDEO_DOMAIN_HINT =
  '视频无法播放：请在微信公众平台将 OSS/API 域名加入「downloadFile 合法域名」，并与 VITE_OSS_PUBLIC_BASE_URL 一致'

function showVideoDomainHint() {
  uni.showModal({ title: '视频播放', content: VIDEO_DOMAIN_HINT, showCancel: false })
}

export function previewNetworkVideo(url: string) {
  const resolved = resolveMediaUrl(url)
  if (!resolved) {
    uni.showToast({ title: '暂无视频地址', icon: 'none' })
    return
  }
  if (typeof uni.previewMedia === 'function') {
    uni.previewMedia({
      sources: [{ url: resolved, type: 'video' }],
      fail: () => {
        uni.showToast({ title: '预览失败，请检查合法域名', icon: 'none' })
        showVideoDomainHint()
      },
    })
    return
  }
  uni.showToast({ title: '当前环境不支持 previewMedia', icon: 'none' })
}

export function onVideoComponentError() {
  showVideoDomainHint()
}

function miniAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'X-Client': 'miniapp' }
  const token = uni.getStorageSync('mini_token')
  if (token && typeof token === 'string') {
    headers.Authorization = `Bearer ${token}`
    headers['X-Mini-Token'] = token
  }
  return headers
}

/** @deprecated Prefer uploadImagePath / uploadVideoFromPath from @/utils/mediaUpload */
export function uploadOssFile(filePath: string, folder = 'miniapp/properties') {
  return import('@/utils/mediaUpload').then((m) => m.uploadImagePath(filePath, folder))
}

/* --- Property publish form helpers (inlined for WeChat MP module graph) --- */

export function emptyPropertyForm(): PropertyEditForm {
  return {
    types: ['标准厂房'],
    companyName: '',
    address: '',
    district: '',
    districtRegionId: null,
    listTitle: '',
    listingLine1: '',
    listingLine2: '',
    riskTag: '',
    lat: '',
    lng: '',
    landMu: 0,
    actualLandMu: 0,
    buildingArea: 0,
    actualUseArea: 0,
    floors: 1,
    loadPerSqm: 0,
    workshopSize: '',
    powerKva: 0,
    transformers: 0,
    freightLifts: 0,
    liftLoadT: 0,
    dining: '集中',
    transitStation: '',
    vacantMonths: 0,
    usageRemark: '',
    structureTypes: [],
    structureOther: '',
    loadNote: '',
    liftDims: '',
    platformHeightCm: 0,
    turnRadiusM: 0,
    dormRent: 0,
    dormDistanceKm: 0,
    stationDistanceM: 0,
    selfUseSqm: 0,
    rentEstimateYear: 0,
    coTenantCount: 0,
    annualRent: null,
    tenantCompanies: '',
    contractYearsLeft: null,
    propertyRights: ['国有土地'],
    propertyRightsOther: '',
    landUse: [],
    landUseOther: '',
    certificates: [],
    mortgageDispute: '无',
    mortgageNote: '',
    landlordPriceWan: null,
    tradeMode: '',
    taxFeeNote: '',
    rentSaleType: '出租',
    rentListSqm: 0,
    propertyFee: 0,
    fireSystems: [],
    fireOther: '',
    firePass: '是',
    monitorCoverage: '全厂区',
    fireFailReason: '',
    highwayKm: 0,
    portAirportKm: 0,
    roadLimits: '',
    rushHour: '无',
    subsidy: '无',
    subsidyDetail: '',
    taxBenefit: '',
    envLevel: '',
    dischargePermit: '有',
    solar: '可接入',
    highlights: '',
    risks: '',
    assessment: '',
    allowedIndustries: '',
    specialLimits: '',
    contactName: '',
    contactPhone: '',
    viewingNote: '',
    internalNote: '',
    ownerContact: '',
    mediaImageUrls: '',
    mediaVideoUrls: '',
    mediaUrls: '',
    photoChecklist: [],
    auditState: 'draft',
    externalStatus: '草稿',
    auditHint: '未发布 · 保存后仍为草稿',
    featured: false,
  }
}

export function parseMediaLines(raw: unknown): string[] {
  return String(raw ?? '')
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((u) => u.length > 0)
}

export function joinMediaLines(urls: string[]): string {
  return urls.filter(Boolean).join('\n')
}

export function applyPropertyApiForm(target: PropertyEditForm, api: PropertyEditForm) {
  const base = emptyPropertyForm()
  Object.assign(target, base, api)
  if (api.code) target.code = String(api.code)
  if (!Array.isArray(target.types) || !target.types.length) {
    target.types = ['标准厂房']
  }
  if (!Array.isArray(target.propertyRights) || !target.propertyRights.length) {
    target.propertyRights = ['国有土地']
  }
  if (!Array.isArray(target.fireSystems)) target.fireSystems = []
  if (!Array.isArray(target.photoChecklist)) target.photoChecklist = []
  if (!Array.isArray(target.landUse)) target.landUse = []
  if (!Array.isArray(target.certificates)) target.certificates = []
  if (!Array.isArray(target.structureTypes)) target.structureTypes = []
  if (api.auditState != null && String(api.auditState).trim()) {
    target.auditState = String(api.auditState).trim()
  }
  if (api.externalStatus != null && String(api.externalStatus).trim()) {
    target.externalStatus = String(api.externalStatus).trim()
  }
  if (api.auditHint != null) target.auditHint = String(api.auditHint)
  if (api.featured != null) target.featured = Boolean(api.featured)
  normalizePropertyFormNumbers(target)
}

function numOrEmpty(v: unknown): number | '' {
  if (v === '' || v == null) return ''
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}

function numOrZero(v: unknown): number {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function numOrNull(v: unknown): number | null {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Align numeric wizard fields with admin JSON (numbers, not MP input strings). */
export function normalizePropertyFormNumbers(form: PropertyEditForm) {
  if (!form || typeof form !== 'object') return
  const intKeys = [
    'landMu',
    'actualLandMu',
    'buildingArea',
    'actualUseArea',
    'floors',
    'powerKva',
    'transformers',
    'freightLifts',
    'liftLoadT',
    'platformHeightCm',
    'dormRent',
    'stationDistanceM',
    'selfUseSqm',
    'rentEstimateYear',
    'coTenantCount',
    'vacantMonths',
    'rentListSqm',
    'propertyFee',
  ] as const
  const decKeys = ['loadPerSqm', 'turnRadiusM', 'dormDistanceKm', 'highwayKm', 'portAirportKm'] as const
  for (const k of intKeys) {
    if (k in form) (form as Record<string, unknown>)[k] = numOrZero(form[k])
  }
  for (const k of decKeys) {
    if (k in form) (form as Record<string, unknown>)[k] = numOrZero(form[k])
  }
  if ('annualRent' in form) form.annualRent = numOrNull(form.annualRent)
  if ('contractYearsLeft' in form) form.contractYearsLeft = numOrNull(form.contractYearsLeft)
  if ('landlordPriceWan' in form) form.landlordPriceWan = numOrNull(form.landlordPriceWan)
}

export function buildPropertySubmitPayload(form: PropertyEditForm): PropertyEditForm {
  const images = joinMediaLines(parseMediaLines(form.mediaImageUrls))
  const videos = joinMediaLines(parseMediaLines(form.mediaVideoUrls))
  const types = Array.isArray(form.types) ? form.types.filter(Boolean) : ['标准厂房']
  const { canEditProperty: _omitCanEdit, ...formRest } = form
  const payload: PropertyEditForm = {
    ...formRest,
    code: form.code,
    listTitle: String(form.listTitle || '').trim() || `${form.companyName || '房源'} · ${types[0]}`,
    companyName: String(form.companyName || '').trim(),
    address: String(form.address || '').trim(),
    district: String(form.district || '').trim() || '未分区',
    types,
    lat: form.lat != null ? String(form.lat) : '',
    lng: form.lng != null ? String(form.lng) : '',
    landMu: numOrEmpty(form.landMu),
    actualLandMu: numOrEmpty(form.actualLandMu),
    buildingArea: numOrEmpty(form.buildingArea),
    actualUseArea: numOrEmpty(form.actualUseArea),
    floors: numOrEmpty(form.floors),
    loadPerSqm: numOrEmpty(form.loadPerSqm),
    powerKva: numOrEmpty(form.powerKva),
    transformers: numOrEmpty(form.transformers),
    freightLifts: numOrEmpty(form.freightLifts),
    liftLoadT: numOrEmpty(form.liftLoadT),
    platformHeightCm: numOrZero(form.platformHeightCm),
    turnRadiusM: numOrZero(form.turnRadiusM),
    dormRent: numOrZero(form.dormRent),
    dormDistanceKm: numOrZero(form.dormDistanceKm),
    stationDistanceM: numOrZero(form.stationDistanceM),
    selfUseSqm: numOrZero(form.selfUseSqm),
    rentEstimateYear: numOrZero(form.rentEstimateYear),
    coTenantCount: numOrZero(form.coTenantCount),
    annualRent: numOrNull(form.annualRent),
    contractYearsLeft: numOrNull(form.contractYearsLeft),
    landlordPriceWan: numOrNull(form.landlordPriceWan),
    highwayKm: numOrZero(form.highwayKm),
    portAirportKm: numOrZero(form.portAirportKm),
    vacantMonths: numOrEmpty(form.vacantMonths),
    rentListSqm: numOrEmpty(form.rentListSqm),
    propertyFee: numOrEmpty(form.propertyFee),
    mediaImageUrls: images,
    mediaVideoUrls: videos,
    mediaUrls: [images, videos].filter(Boolean).join('\n'),
    featured: Boolean(form.featured),
  }
  normalizePropertyFormNumbers(payload)
  return payload
}

export function chipListFromJoined(raw: string): string[] {
  return raw
    .split(/[、,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
