/** Property list + detail mock — maps to property / listing tables */

export interface PropertyListItem {
  id: string
  code: string
  title: string
  metaLine: string
  priceLine: string
  status: string
  statusTone: 'draft' | 'ok' | 'warn' | 'neutral'
  draftHint?: string
  districtRegionId?: number
  buildingArea?: number
}

export const mockPropertyList: PropertyListItem[] = [
  {
    id: 'P-DRAFT-001',
    code: 'P-DRAFT-001',
    districtRegionId: 3,
    buildingArea: 0,
    title: '南沙万顷沙 · 单层仓（草稿）',
    metaLine: 'P-DRAFT-001 · 未提交审核 · 上次保存 今天 09:12',
    priceLine: '',
    status: '草稿',
    statusTone: 'draft',
    draftHint: '缺省：地图坐标未填时仍可存草稿，提交前须选点',
  },
  {
    id: 'P-8821',
    code: 'P-8821',
    districtRegionId: 1,
    buildingArea: 4200,
    title: '标准厂房 · 黄埔科学城',
    metaLine: 'P-8821 · 4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    priceLine: '¥38/㎡·月',
    status: '待租',
    statusTone: 'ok',
  },
  {
    id: 'P-7730',
    code: 'P-7730',
    districtRegionId: 2,
    buildingArea: 8600,
    title: '独门独院 · 花都汽车城',
    metaLine: 'P-7730 · 8600㎡ · 空地 15 亩 · 环评已通过',
    priceLine: '售价面议',
    status: '意向中',
    statusTone: 'warn',
  },
]

export interface PropertyDetailMock {
  id: string
  auditKey: 'live' | 'pending' | 'draft' | 'rejected'
  auditBadge: string
  auditHint: string
  rejectReason?: string
  externalStatus?: string
  detailTitle: string
  specLine: string
  priceLine: string
  leaseChip: string
  company: string
  addrKv: string
  mapCoordLabel: string
  navAddr: string
  lat?: string
  lng?: string
  district?: string
  rentSaleType?: string
  propertyType?: string
  mediaImages?: string[]
  mediaVideos?: string[]
  canViewPrivacy?: boolean
  canEditProperty?: boolean
}

const DETAIL_MAP: Record<string, PropertyDetailMock> = {
  'P-8821': {
    id: 'P-8821',
    auditKey: 'live',
    auditBadge: '已上架',
    auditHint: '客户侧可见 · 可被带看/分享 · 修改会生成新版本',
    externalStatus: '待租',
    detailTitle: '黄埔科学城 · 单层高标准厂房',
    specLine: '4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    priceLine: '¥38/㎡·月（含税挂牌）',
    leaseChip: '待租',
    company: '广州××实业有限公司',
    addrKv: '广州市黄埔区科学城 XX 路 88 号 A 区',
    mapCoordLabel: '23.179455°N · 113.429512°E',
    navAddr: '广州市黄埔区科学城 XX 路 88 号 A 区',
    lat: '23.179455',
    lng: '113.429512',
    district: '黄埔区',
    rentSaleType: '出租',
    propertyType: '标准厂房',
    mediaImages: [
      'https://img.alicdn.com/imgextra/i1/O1CN01example1.jpg',
      'https://img.alicdn.com/imgextra/i2/O1CN01example2.jpg',
    ],
    mediaVideos: [],
    canViewPrivacy: true,
    canEditProperty: true,
  },
  'P-7730': {
    id: 'P-7730',
    auditKey: 'pending',
    auditBadge: '待审核',
    auditHint: '管理员处理中 · 客户侧暂不可见 · 通过后将自动上架',
    detailTitle: '花都汽车城 · 独门独院厂房',
    specLine: '8600㎡ · 空地约 15 亩 · 环评已通过',
    priceLine: '售价面议（内部底价已录后台）',
    leaseChip: '意向中',
    company: '广州花都汽车城产业运营有限公司',
    addrKv: '广州市花都区汽车城产业基地 XX 路 66 号',
    mapCoordLabel: '23.391082°N · 113.211864°E',
    navAddr: '广州市花都区汽车城产业基地 XX 路 66 号',
  },
  'P-DRAFT-001': {
    id: 'P-DRAFT-001',
    auditKey: 'draft',
    auditBadge: '草稿',
    auditHint: '未提交审核 · 可随时继续编辑 · 提交前须完成地图选点',
    detailTitle: '南沙万顷沙 · 单层仓（草稿）',
    specLine: '约 4800㎡ · 净高 10m · 丙二类（待验）',
    priceLine: '租金待填（草稿）',
    leaseChip: '待租',
    company: '（草稿）业主主体待确认',
    addrKv: '广东省广州市南沙区万顷沙物流园一期（示例）',
    mapCoordLabel: '尚未选点',
    navAddr: '广东省广州市南沙区万顷沙物流园一期（示例）',
  },
  'P-REJECT-001': {
    id: 'P-REJECT-001',
    auditKey: 'rejected',
    auditBadge: '已驳回',
    auditHint: '原因：配电容量描述与现场照片不一致 · 请修改后重新提交',
    rejectReason: '配电容量描述与现场照片不一致，请核对后重新提交审核。',
    externalStatus: '驳回',
    detailTitle: '南沙万顷沙 · 单层仓（待修改）',
    specLine: '约 4800㎡ · 净高 10m · 丙二类（待验）',
    priceLine: '租金待填（驳回后需重审）',
    leaseChip: '待租',
    company: '广州南沙××物流有限公司',
    addrKv: '广东省广州市南沙区万顷沙物流园一期 B3',
    mapCoordLabel: '22.718634°N · 113.612445°E',
    navAddr: '广东省广州市南沙区万顷沙物流园一期 B3',
    lat: '22.718634',
    lng: '113.612445',
    mediaImages: [],
    mediaVideos: [],
  },
}

/** Resolve mock detail key from list id/code or DETAIL_MAP key. */
export function resolvePropertyDetailKey(key: string): string {
  const k = String(key || '').trim()
  if (!k) return 'P-8821'
  if (DETAIL_MAP[k]) return k
  const row = mockPropertyList.find((p) => p.id === k || p.code === k)
  if (row) {
    if (DETAIL_MAP[row.code]) return row.code
    if (DETAIL_MAP[row.id]) return row.id
    return row.code || row.id
  }
  return 'P-8821'
}

export function getPropertyDetail(id: string): PropertyDetailMock {
  const resolved = resolvePropertyDetailKey(id)
  return DETAIL_MAP[resolved] || DETAIL_MAP['P-8821']
}

/** KV blocks — 8 tabs aligned with publish.vue (header/hero fields omitted) */
export const propertyDetailKv = {
  s1: [
    { dt: '房源类型', dd: '标准厂房' },
    { dt: '业主联系人', dd: '王业主' },
    { dt: '风险标签', dd: '无' },
  ],
  s2: [{ dt: '所属区域', dd: '黄埔区' }],
  s3: [{ dt: '现场必拍', dd: '门口形象照、车间全景、配电房' }],
  s4: [
    { dt: '土地（亩）', dd: '12.5' },
    { dt: '建筑面积（㎡）', dd: '4200' },
    { dt: '车间长宽高（米）', dd: '80×40×9' },
    { dt: '结构类型', dd: '钢构' },
  ],
  s5: [
    { dt: '电力总容量（kVA）', dd: '800' },
    { dt: '货梯（台）', dd: '2' },
    { dt: '餐饮 / 便利店', dd: '集中食堂' },
    { dt: '使用情况备注', dd: '空置可租' },
  ],
  s6: [
    { dt: '产权性质', dd: '国有' },
    { dt: '抵押 / 纠纷', dd: '无' },
    { dt: '消防验收', dd: '是' },
  ],
  s7: [
    { dt: '产业补贴', dd: '无' },
    { dt: '厂房亮点', dd: '层高 9m，丙二类' },
    { dt: '潜在风险', dd: '—' },
  ],
  s8: [
    { dt: '租售类型', dd: '出租' },
    { dt: '物业费（元/㎡·月）', dd: '5' },
    { dt: '联系人姓名', dd: '李昭' },
    { dt: '联系人电话', dd: '138****6281' },
    { dt: '内部备注', dd: '业主配合度高' },
  ],
}

export const mockPropertyLogs = [
  {
    line: '陈思远 · 写跟进',
    sub: '2026-05-28 15:30 · 客户现场看厂，关注配电容量（图片×2）',
    kind: 'follow-up',
    occurredAt: '2026-05-28 15:30',
    note: '客户现场看厂，关注配电容量',
    imageUrls: [],
    audioUrls: [],
    displayLine: '2026-05-28 15:30 · 客户现场看厂，关注配电容量（图片×2）',
  },
  { line: '陈思远 · 查看详情', sub: '今天 10:22 · IP 内网', kind: 'action' },
  { line: '王敏 · 编辑配电参数', sub: '昨天 16:05', kind: 'action' },
  { line: '陈思远 · 内部转发卡片', sub: '昨天 11:40 · Token TTL 24h', kind: 'action' },
  { line: '系统 · 状态→意向中', sub: '前天 09:12 · 规则引擎', kind: 'action' },
]

export const mockMyPublishedProperties = [
  { code: 'P-8821', title: '黄埔科学城', status: '已上架', statusTone: 'ok', meta: '客户可见 · 最近编辑 昨天 16:05' },
  { code: 'P-7730', title: '花都汽车城', status: '待审核', statusTone: 'warn', meta: '客户不可见 · 排队中' },
  { code: 'P-REJECT-001', title: '南沙仓', status: '已驳回', statusTone: 'rejected', meta: '请按驳回意见修改后重新提交' },
  { code: 'P-DRAFT-001', title: '草稿', status: '草稿', statusTone: 'draft', meta: '未提交审核 · 继续编辑' },
]

export type PropertyDetailPayload = PropertyDetailMock & { kv: typeof propertyDetailKv }
