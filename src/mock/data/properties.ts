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
}

export const mockPropertyList: PropertyListItem[] = [
  {
    id: 'P-DRAFT-001',
    code: 'P-DRAFT-001',
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
    title: '标准厂房 · 黄埔科学城',
    metaLine: 'P-8821 · 4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    priceLine: '¥38/㎡·月',
    status: '待租',
    statusTone: 'ok',
  },
  {
    id: 'P-7730',
    code: 'P-7730',
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
  detailTitle: string
  specLine: string
  priceLine: string
  leaseChip: string
  company: string
  addrKv: string
  mapCoordLabel: string
  navAddr: string
}

const DETAIL_MAP: Record<string, PropertyDetailMock> = {
  'P-8821': {
    id: 'P-8821',
    auditKey: 'live',
    auditBadge: '已上架',
    auditHint: '客户侧可见 · 可被带看/分享 · 修改会生成新版本',
    detailTitle: '黄埔科学城 · 单层高标准厂房',
    specLine: '4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    priceLine: '¥38/㎡·月（含税挂牌）',
    leaseChip: '待租',
    company: '广州××实业有限公司',
    addrKv: '广州市黄埔区科学城 XX 路 88 号 A 区',
    mapCoordLabel: '23.179455°N · 113.429512°E',
    navAddr: '广州市黄埔区科学城 XX 路 88 号 A 区',
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
    detailTitle: '南沙万顷沙 · 单层仓（待修改）',
    specLine: '约 4800㎡ · 净高 10m · 丙二类（待验）',
    priceLine: '租金待填（驳回后需重审）',
    leaseChip: '待租',
    company: '广州南沙××物流有限公司',
    addrKv: '广东省广州市南沙区万顷沙物流园一期 B3',
    mapCoordLabel: '22.718634°N · 113.612445°E',
    navAddr: '广东省广州市南沙区万顷沙物流园一期 B3',
  },
}

export function getPropertyDetail(id: string): PropertyDetailMock {
  return DETAIL_MAP[id] || DETAIL_MAP['P-8821']
}

/** KV blocks aligned with prototype detail tabs (static copy for DB field mapping) */
export const propertyDetailKv = {
  s1: [
    { dt: '房源类型', dd: '标准厂房 （支持多标签）' },
    { dt: '公司名称', dd: '' },
    { dt: '详细地址', dd: '' },
    { dt: '业主联系人', dd: '王业主 · 业主授权代表' },
    { dt: '现场必拍清单', dd: '门口形象照、路口进出照、车间照片、货梯、厂房屋顶、短视频已勾选' },
    { dt: '媒体资产', dd: '现场相册 12 张（≥10）· 短视频 30s×2 · 底部含 GPS 地图导航' },
  ],
  s2: [
    { dt: '土地（亩）', dd: '约 12.5 亩 · 实际 12.3 亩' },
    { dt: '建筑面积 / 使用面积', dd: '4200㎡ / 4050㎡' },
    { dt: '总层数', dd: '单层' },
    { dt: '车间长宽高', dd: '88×48×9 m' },
    { dt: '承重', dd: '3 吨/m²（牛腿区 10T 预留）' },
    { dt: '结构类型', dd: '钢构' },
    { dt: '电力总容量', dd: '800kVA · 变压器 2 台 · 可增容至 1250kVA' },
    { dt: '货梯', dd: '2 台 · 载重 3T · 轿厢 2.4×3.0×2.8m' },
    { dt: '装卸平台 / 转弯半径', dd: '高度 110cm · 货车转弯半径约 14m' },
    { dt: '员工宿舍', dd: '园区内 450 元/房 · 周边 1.2km' },
    { dt: '餐饮便利店', dd: '集中配套' },
    { dt: '公交地铁', dd: '科学城站 · 步行约 820m' },
    { dt: '使用情况', dd: '空置可租 · 腾空周期约 2 个月 · 现状无共租' },
  ],
  s3: [
    { dt: '产权性质', dd: '国有土地 · 出让' },
    { dt: '土地用途', dd: '工业' },
    { dt: '证件', dd: '房产证 · 土地证 · 消防验收 · 环保批文' },
    { dt: '抵押 / 纠纷', dd: '无' },
    { dt: '房东心里价位', dd: '面议（后台维护）' },
    { dt: '交易方式', dd: '出租 · 可谈出售' },
    { dt: '交易税费（估）', dd: '按政策预估 · 见商务洽谈' },
    { dt: '允许产业', dd: '智能制造 · 装配 · 仓储' },
    { dt: '特殊限制', dd: '禁止高噪音喷涂（夜间）' },
    { dt: '消防系统', dd: '喷淋 · 烟感 · 丙二类' },
    { dt: '验收 / 监控', dd: '已通过验收 · 监控覆盖全厂区' },
    { dt: '物流', dd: '高速口约 3.5km · 港区约 45km · 限高 4.2m · 高峰期拥堵无' },
    { dt: '产业补贴 / 税收', dd: '无专项申报 · 税收优惠待园区确认' },
    { dt: '环评 / 排污 / 光伏', dd: '已通过 HP-2024-0192 · 排污许可有 · 屋面可接入光伏' },
    { dt: '厂房亮点', dd: '层高 9m · 卸货平台 · 配电充足' },
    { dt: '潜在风险', dd: '邻里夜间装卸噪音敏感' },
    { dt: '评估建议', dd: '优先推荐给电子装配 / 轻加工' },
    { dt: '租金挂牌', dd: '¥38/㎡·月（含税）' },
    { dt: '物业费', dd: '¥2.5/㎡·月' },
    { dt: '递增 / 免租', dd: '每两年递增 5% · 免租期洽谈中（≤60 天）' },
    { dt: '中介佣金', dd: '半月租金（内部结算）' },
  ],
  s4: [
    { dt: '跟进联系人', dd: '李昭（业主授权）' },
    { dt: '电话', dd: '138****6281 脱敏 · 管理员可见全号' },
    { dt: '看房预约备注', dd: '工作日 9:00–17:00；需提前 2 小时报备车牌。' },
    { dt: '内部备注', dd: '业主配合度高 · 配电增容周期约 45 个工作日。' },
  ],
}

export const mockPropertyLogs = [
  { line: '陈思远 · 查看详情', sub: '今天 10:22 · IP 内网' },
  { line: '王敏 · 编辑配电参数', sub: '昨天 16:05' },
  { line: '陈思远 · 内部转发卡片', sub: '昨天 11:40 · Token TTL 24h' },
  { line: '系统 · 状态→意向中', sub: '前天 09:12 · 规则引擎' },
]

export const mockMyPublishedProperties = [
  { code: 'P-8821', title: '黄埔科学城', status: '已上架', statusTone: 'ok', meta: '客户可见 · 最近编辑 昨天 16:05' },
  { code: 'P-7730', title: '花都汽车城', status: '待审核', statusTone: 'warn', meta: '客户不可见 · 排队中' },
  { code: 'P-REJECT-001', title: '南沙仓', status: '已驳回', statusTone: 'rejected', meta: '请按驳回意见修改后重新提交' },
  { code: 'P-DRAFT-001', title: '草稿', status: '草稿', statusTone: 'draft', meta: '未提交审核 · 继续编辑' },
]

export type PropertyDetailPayload = PropertyDetailMock & { kv: typeof propertyDetailKv }
