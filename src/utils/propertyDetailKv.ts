import type { PropertyDetailKv, PropertyEditForm, PropertyKvRow } from '@/types/property'

/** dt labels hidden per tab — shown in detail header / hero / map */
const TAB_OMIT: Partial<Record<keyof PropertyDetailKv, string[]>> = {
  s1: ['挂牌标题', '对外状态', '租售类型'],
  s2: ['详细地址', '纬度', '经度'],
  s3: ['图片数量', '视频数量'],
  s8: ['租金挂牌', '租金挂牌（元/㎡·月）'],
}

function rowOrDash(v: unknown) {
  const s = v == null ? '' : String(v).trim()
  return s || '—'
}

function joinArr(v: unknown) {
  return Array.isArray(v) && v.length ? v.join('、') : '—'
}

function hasVal(v: unknown) {
  return v != null && String(v).trim() !== ''
}

function filterTab(key: keyof PropertyDetailKv, rows: PropertyKvRow[]) {
  const omit = new Set(TAB_OMIT[key] || [])
  return rows.filter((r) => !omit.has(r.dt))
}

function structureDetail(f: PropertyEditForm) {
  const joined = joinArr(f.structureTypes)
  if (joined !== '—') return joined
  return rowOrDash(f.structureOther)
}

function optionalOtherRow(label: string, arr: unknown, otherVal: unknown): PropertyKvRow[] {
  const list = Array.isArray(arr) ? arr : []
  if (!list.includes('其他')) return []
  const dd = rowOrDash(otherVal)
  return dd === '—' ? [] : [{ dt: label, dd }]
}

export type PropertyDetailKvMeta = {
  type?: string
  district?: string
  company?: string
  statusTag?: string
  priceLine?: string
  submitterName?: string
}

/** Build s1–s8 from edit-form — same field order as publish.vue steps 0–7 */
export function buildPropertyDetailKvFromForm(
  form: PropertyEditForm,
  meta: PropertyDetailKvMeta = {},
): PropertyDetailKv {
  const typesJoined = Array.isArray(form.types) ? form.types.join('、') : rowOrDash(meta.type)
  const photoList = Array.isArray(form.photoChecklist) ? form.photoChecklist.join('、') : ''

  const s1: PropertyKvRow[] = [
    { dt: '房源类型', dd: typesJoined !== '—' ? typesJoined : rowOrDash(meta.type) },
    { dt: '公司名称', dd: rowOrDash(form.companyName || meta.company) },
    { dt: '业主联系人', dd: rowOrDash(form.ownerContact) },
    { dt: '风险标签', dd: rowOrDash(form.riskTag) },
  ]

  const s2: PropertyKvRow[] = [{ dt: '所属区域', dd: rowOrDash(form.district || meta.district) }]

  const s3: PropertyKvRow[] = [{ dt: '现场必拍', dd: photoList || '—' }]

  const s4: PropertyKvRow[] = [
    { dt: '土地（亩）', dd: hasVal(form.landMu) ? String(form.landMu) : '—' },
    { dt: '实际土地（亩）', dd: hasVal(form.actualLandMu) ? String(form.actualLandMu) : '—' },
    { dt: '建筑面积（㎡）', dd: hasVal(form.buildingArea) ? String(form.buildingArea) : '—' },
    { dt: '使用面积（㎡）', dd: hasVal(form.actualUseArea) ? String(form.actualUseArea) : '—' },
    { dt: '总层数', dd: rowOrDash(form.floors) },
    { dt: '承重（吨/m²）', dd: rowOrDash(form.loadPerSqm) },
    { dt: '车间长宽高（米）', dd: rowOrDash(form.workshopSize) },
    { dt: '承重注明区域', dd: rowOrDash(form.loadNote) },
    { dt: '结构类型', dd: structureDetail(form) },
    ...optionalOtherRow('结构 · 其他', form.structureTypes, form.structureOther),
  ]

  const s5: PropertyKvRow[] = [
    { dt: '电力总容量（kVA）', dd: hasVal(form.powerKva) ? String(form.powerKva) : '—' },
    { dt: '变压器（台）', dd: hasVal(form.transformers) ? String(form.transformers) : '—' },
    { dt: '货梯（台）', dd: hasVal(form.freightLifts) ? String(form.freightLifts) : '—' },
    { dt: '货梯载重（吨）', dd: hasVal(form.liftLoadT) ? String(form.liftLoadT) : '—' },
    { dt: '货梯尺寸（米）', dd: rowOrDash(form.liftDims) },
    { dt: '装卸平台高度（cm）', dd: hasVal(form.platformHeightCm) ? String(form.platformHeightCm) : '—' },
    { dt: '转弯半径（米）', dd: hasVal(form.turnRadiusM) ? String(form.turnRadiusM) : '—' },
    { dt: '宿舍租金（元/房）', dd: hasVal(form.dormRent) ? String(form.dormRent) : '—' },
    { dt: '宿舍距离（km）', dd: hasVal(form.dormDistanceKm) ? String(form.dormDistanceKm) : '—' },
    { dt: '餐饮 / 便利店', dd: rowOrDash(form.dining) },
    { dt: '公交 / 地铁站点', dd: rowOrDash(form.transitStation) },
    { dt: '站点距离（米）', dd: hasVal(form.stationDistanceM) ? String(form.stationDistanceM) : '—' },
    { dt: '自用（㎡）', dd: hasVal(form.selfUseSqm) ? String(form.selfUseSqm) : '—' },
    { dt: '租金估算（元/年）', dd: hasVal(form.rentEstimateYear) ? String(form.rentEstimateYear) : '—' },
    { dt: '共租（家）', dd: rowOrDash(form.coTenantCount) },
    { dt: '年租金（元/年）', dd: hasVal(form.annualRent) ? String(form.annualRent) : '—' },
    { dt: '租客公司', dd: rowOrDash(form.tenantCompanies) },
    { dt: '合同剩余（年）', dd: hasVal(form.contractYearsLeft) ? String(form.contractYearsLeft) : '—' },
    { dt: '腾空周期（月）', dd: rowOrDash(form.vacantMonths) },
    { dt: '使用情况备注', dd: rowOrDash(form.usageRemark) },
  ]

  const s6: PropertyKvRow[] = [
    { dt: '产权性质', dd: joinArr(form.propertyRights) },
    ...optionalOtherRow('产权 · 其他说明', form.propertyRights, form.propertyRightsOther),
    { dt: '土地用途', dd: joinArr(form.landUse) },
    ...optionalOtherRow('土地用途 · 其他', form.landUse, form.landUseOther),
    { dt: '证件齐全', dd: joinArr(form.certificates) },
    { dt: '抵押 / 纠纷', dd: rowOrDash(form.mortgageDispute) },
    { dt: '抵押 / 纠纷说明', dd: rowOrDash(form.mortgageNote) },
    { dt: '房东心理价位（万）', dd: hasVal(form.landlordPriceWan) ? String(form.landlordPriceWan) : '—' },
    { dt: '交易方式', dd: rowOrDash(form.tradeMode) },
    { dt: '交易税费说明', dd: rowOrDash(form.taxFeeNote) },
    { dt: '允许产业类型', dd: rowOrDash(form.allowedIndustries) },
    { dt: '特殊限制', dd: rowOrDash(form.specialLimits) },
    { dt: '消防系统', dd: joinArr(form.fireSystems) },
    ...optionalOtherRow('消防 · 其他', form.fireSystems, form.fireOther),
    { dt: '消防验收', dd: rowOrDash(form.firePass) },
    { dt: '监控覆盖', dd: rowOrDash(form.monitorCoverage) },
    { dt: '未通过原因', dd: rowOrDash(form.fireFailReason) },
    { dt: '最近高速口（km）', dd: hasVal(form.highwayKm) ? String(form.highwayKm) : '—' },
    { dt: '港口/机场（km）', dd: hasVal(form.portAirportKm) ? String(form.portAirportKm) : '—' },
    { dt: '道路限高/限重', dd: rowOrDash(form.roadLimits) },
    { dt: '高峰期拥堵', dd: rowOrDash(form.rushHour) },
  ]

  const s7: PropertyKvRow[] = [
    { dt: '产业补贴', dd: rowOrDash(form.subsidy) },
    { dt: '补贴具体说明', dd: rowOrDash(form.subsidyDetail) },
    { dt: '税收优惠', dd: rowOrDash(form.taxBenefit) },
    { dt: '环评等级', dd: rowOrDash(form.envLevel) },
    { dt: '排污许可', dd: rowOrDash(form.dischargePermit) },
    { dt: '光伏接入', dd: rowOrDash(form.solar) },
    { dt: '厂房亮点', dd: rowOrDash(form.highlights) },
    { dt: '潜在风险', dd: rowOrDash(form.risks) },
    { dt: '评估建议', dd: rowOrDash(form.assessment) },
  ]

  const s8: PropertyKvRow[] = [
    { dt: '租售类型', dd: rowOrDash(form.rentSaleType) },
    { dt: '物业费（元/㎡·月）', dd: hasVal(form.propertyFee) ? String(form.propertyFee) : '—' },
    { dt: '联系人姓名', dd: rowOrDash(form.contactName) },
    { dt: '联系人电话', dd: rowOrDash(form.contactPhone) },
    { dt: '看房预约备注', dd: rowOrDash(form.viewingNote) },
    { dt: '内部备注', dd: rowOrDash(form.internalNote) },
    { dt: '提交人', dd: rowOrDash(form.submitterName || meta.submitterName) },
  ]

  const raw = { s1, s2, s3, s4, s5, s6, s7, s8 }
  const out = {} as PropertyDetailKv
  for (const key of Object.keys(raw) as (keyof PropertyDetailKv)[]) {
    out[key] = filterTab(key, raw[key])
  }
  return out
}

/** Legacy API / cache returned only s1–s4 with merged steps */
export function isLegacyPropertyDetailKv(kv: unknown): boolean {
  if (!kv || typeof kv !== 'object') return true
  const o = kv as Record<string, unknown>
  if (Array.isArray(o.s5) && (o.s5 as unknown[]).length > 0) return false
  const s1 = Array.isArray(o.s1) ? (o.s1 as PropertyKvRow[]) : []
  if (s1.some((r) => r.dt === '媒体资产' || r.dt === '现场必拍清单' || r.dt === '详细地址')) return true
  if (Array.isArray(o.s4) && !Array.isArray(o.s8)) return true
  return false
}
