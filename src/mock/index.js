/** Centralized mock data for UI and API stubs */

export const TAB_BAR_ITEMS = [
  { pagePath: 'pages/home/home', text: '首页', icon: 'home' },
  { pagePath: 'pages/property/index', text: '房源', icon: 'prop' },
  { pagePath: 'pages/customer/index', text: '客户', icon: 'cust' },
  { pagePath: 'pages/message/index', text: '消息', icon: 'msg' },
  { pagePath: 'pages/me/index', text: '我的', icon: 'me' },
]

export const PROPERTY_SEG_OPTIONS = ['全部', '草稿', '待租', '待售', '意向中']

export const DEMO_PROPERTIES = {
  'P-8821': {
    id: 'P-8821',
    auditKey: 'live',
    auditBadge: '已上架',
    auditHint: '客户侧可见 · 可被带看/分享 · 修改会生成新版本',
    title: '黄埔科学城 · 单层高标准厂房',
    specLine: '4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    priceLine: '¥38/㎡·月（含税挂牌）',
    company: '广州××实业有限公司',
    addrKv: '广州市黄埔区科学城 XX 路 88 号 A 区',
    addrInput: '广东省广州市黄埔区科学城 XX 路 88 号 A 区',
    mapTitle: '黄埔科学城 · 单层高标准厂房',
    lat: '23.179455',
    lng: '113.429512',
    mapCoordLabel: '23.179455°N · 113.429512°E',
    navAddr: '广州市黄埔区科学城 XX 路 88 号 A 区',
    leaseChip: '待租',
    listTitle: '标准厂房 · 黄埔科学城',
    listSub: 'P-8821 · 4200㎡ · 层高 9m · 配电 800kVA · 丙二类',
    listPrice: '¥38/㎡·月',
    listChip: '待租',
    listChipType: 'ok',
  },
  'P-7730': {
    id: 'P-7730',
    auditKey: 'pending',
    auditBadge: '待审核',
    auditHint: '管理员处理中 · 客户侧暂不可见 · 通过后将自动上架',
    title: '花都汽车城 · 独门独院厂房',
    specLine: '8600㎡ · 空地约 15 亩 · 环评已通过',
    priceLine: '售价面议（内部底价已录后台）',
    company: '广州花都汽车城产业运营有限公司',
    addrKv: '广州市花都区汽车城产业基地 XX 路 66 号',
    addrInput: '广东省广州市花都区汽车城产业基地 XX 路 66 号',
    mapTitle: '花都汽车城 · 独门独院',
    lat: '23.391082',
    lng: '113.211864',
    mapCoordLabel: '23.391082°N · 113.211864°E',
    navAddr: '广州市花都区汽车城产业基地 XX 路 66 号',
    leaseChip: '意向中',
    listTitle: '独门独院 · 花都汽车城',
    listSub: 'P-7730 · 8600㎡ · 空地 15 亩 · 环评已通过',
    listPrice: '售价面议',
    listChip: '意向中',
    listChipType: 'warn',
  },
  'P-DRAFT-001': {
    id: 'P-DRAFT-001',
    auditKey: 'draft',
    auditBadge: '草稿',
    auditHint: '未提交审核 · 可随时继续编辑 · 提交前须完成地图选点',
    title: '南沙万顷沙 · 单层仓（草稿）',
    specLine: '约 4800㎡ · 净高 10m · 丙二类（待验）',
    priceLine: '租金待填（草稿）',
    company: '（草稿）业主主体待确认',
    addrKv: '广东省广州市南沙区万顷沙物流园一期（示例）',
    addrInput: '广东省广州市南沙区万顷沙物流园一期（示例草稿地址）',
    mapTitle: '南沙万顷沙 · 单层仓（草稿）',
    lat: '',
    lng: '',
    mapCoordLabel: '尚未选点',
    navAddr: '广东省广州市南沙区万顷沙物流园一期（示例）',
    leaseChip: '待租',
    listTitle: '南沙万顷沙 · 单层仓（草稿）',
    listSub: 'P-DRAFT-001 · 未提交审核 · 上次保存 今天 09:12',
    listPrice: '缺省：地图坐标未填时仍可存草稿',
    listChip: '草稿',
    listChipType: 'neutral',
  },
  'P-REJECT-001': {
    id: 'P-REJECT-001',
    auditKey: 'rejected',
    auditBadge: '已驳回',
    auditHint: '原因：配电容量描述与现场照片不一致 · 请修改后重新提交',
    title: '南沙万顷沙 · 单层仓（待修改）',
    specLine: '约 4800㎡ · 净高 10m · 丙二类（待验）',
    priceLine: '租金待填（驳回后需重审）',
    company: '广州南沙××物流有限公司',
    addrKv: '广东省广州市南沙区万顷沙物流园一期 B3',
    addrInput: '广东省广州市南沙区万顷沙物流园一期 B3',
    mapTitle: '南沙万顷沙 · 单层仓（待修改）',
    lat: '22.718634',
    lng: '113.612445',
    mapCoordLabel: '22.718634°N · 113.612445°E',
    navAddr: '广东省广州市南沙区万顷沙物流园一期 B3',
    leaseChip: '待租',
    listTitle: '南沙万顷沙 · 单层仓',
    listSub: 'P-REJECT-001 · 驳回待改',
    listPrice: '—',
    listChip: '已驳回',
    listChipType: 'danger',
  },
}

export const PROPERTY_LIST_ORDER = ['P-DRAFT-001', 'P-8821', 'P-7730']

export const PROPERTY_DETAIL_TAB_LABELS = ['基础与媒体', '土地·配套·使用', '产权·合规·备注', '联系']
export const PROPERTY_DETAIL_STATUS_LIST = ['待租', '已租', '待售', '已售', '意向中', '下架封存']
export const PROPERTY_DETAIL_PANEL1 = [
  { k: '房源类型', v: '标准厂房（支持多标签）' },
  { k: '公司名称', v: '广州××实业有限公司' },
  { k: '详细地址', v: '广州市黄埔区科学城 XX 路 88 号 A 区' },
  { k: '业主联系人', v: '王业主 · 业主授权代表' },
  { k: '现场必拍清单', v: '门口形象照、路口进出照、车间照片、货梯、厂房屋顶、短视频已勾选' },
  { k: '媒体资产', v: '现场相册 12 张（≥10）· 短视频 30s×2 · 底部含 GPS 地图导航' },
]
export const PROPERTY_DETAIL_PANEL2 = [
  { k: '土地（亩）', v: '约 12.5 亩 · 实际 12.3 亩' },
  { k: '建筑面积 / 使用面积', v: '4200㎡ / 4050㎡' },
  { k: '总层数', v: '单层' },
  { k: '车间长宽高', v: '88×48×9 m' },
  { k: '承重', v: '3 吨/m²（牛腿区 10T 预留）' },
  { k: '结构类型', v: '钢构' },
  { k: '电力总容量', v: '800kVA · 变压器 2 台 · 可增容至 1250kVA' },
  { k: '货梯', v: '2 台 · 载重 3T · 轿厢 2.4×3.0×2.8m' },
  { k: '装卸平台 / 转弯半径', v: '高度 110cm · 货车转弯半径约 14m' },
  { k: '员工宿舍', v: '园区内 450 元/房 · 周边 1.2km' },
  { k: '餐饮便利店', v: '集中配套' },
  { k: '公交地铁', v: '科学城站 · 步行约 820m' },
  { k: '使用情况', v: '空置可租 · 腾空周期约 2 个月 · 现状无共租' },
]
export const PROPERTY_DETAIL_PANEL3 = [
  { k: '产权性质', v: '国有土地 · 出让' },
  { k: '土地用途', v: '工业' },
  { k: '证件', v: '房产证 · 土地证 · 消防验收 · 环保批文' },
  { k: '抵押 / 纠纷', v: '无' },
  { k: '房东心里价位', v: '面议（后台维护）' },
  { k: '交易方式', v: '出租 · 可谈出售' },
  { k: '交易税费（估）', v: '按政策预估 · 见商务洽谈' },
  { k: '允许产业', v: '智能制造 · 装配 · 仓储' },
  { k: '特殊限制', v: '禁止高噪音喷涂（夜间）' },
  { k: '消防系统', v: '喷淋 · 烟感 · 丙二类' },
  { k: '验收 / 监控', v: '已通过验收 · 监控覆盖全厂区' },
  { k: '物流', v: '高速口约 3.5km · 港区约 45km · 限高 4.2m · 高峰期拥堵无' },
  { k: '产业补贴 / 税收', v: '无专项申报 · 税收优惠待园区确认' },
  { k: '环评 / 排污 / 光伏', v: '已通过 HP-2024-0192 · 排污许可有 · 屋面可接入光伏' },
  { k: '厂房亮点', v: '层高 9m · 卸货平台 · 配电充足' },
  { k: '潜在风险', v: '邻里夜间装卸噪音敏感' },
  { k: '评估建议', v: '优先推荐给电子装配 / 轻加工' },
  { k: '租金挂牌', v: '¥38/㎡·月（含税）' },
  { k: '物业费', v: '¥2.5/㎡·月' },
  { k: '递增 / 免租', v: '每两年递增 5% · 免租期洽谈中（≤60 天）' },
  { k: '中介佣金', v: '半月租金（内部结算）' },
]
export const PROPERTY_DETAIL_PANEL4 = [
  { k: '跟进联系人', v: '李昭（业主授权）' },
  { k: '电话', v: '138****6281（脱敏 · 管理员可见全号）' },
  { k: '看房预约备注', v: '工作日 9:00–17:00；需提前 2 小时报备车牌。' },
  { k: '内部备注', v: '业主配合度高 · 配电增容周期约 45 个工作日。' },
]

export const PROPERTY_PUBLISH_DEFAULT_FORM = {
  company: '',
  address: '广东省广州市黄埔区科学城 XX 路 88 号',
  lat: '',
  lng: '',
  mapTitle: '黄埔科学城 · 单层高标准厂房',
  owner: '',
  landMu: '',
  landMuAct: '',
  area: '4200',
  load: '3',
  lwh: '',
  kva: '800',
  trans: '',
  usageRemark: '',
  contactName: '李昭',
  contactPhone: '13800138001',
  visitNote: '工作日看房；提前 2 小时报备车牌；禁区佩戴安全帽。',
  internalNote: '业主配合度 · 跟进要点。',
}
export const PROPERTY_PUBLISH_TYPE_OPTIONS = ['标准厂房', '独门独院厂房', '仓库', '工业用地', '写字楼', '产业园商铺']
export const PROPERTY_PUBLISH_SHOT_OPTIONS = ['门口形象照', '路口进出照', '车间照片', '货梯', '厂房屋顶', '视频']
export const PROPERTY_PUBLISH_RIGHT_OPTIONS = ['国有土地', '出让', '划拨', '集体土地', '其他']
export const PROPERTY_PUBLISH_STATUS_OPTIONS = ['待租', '待售', '意向中', '下架封存']
export const PROPERTY_PUBLISH_LEASE_OPTIONS = ['出租', '出售', '租售皆可']
export const PROPERTY_PUBLISH_DEFAULT_TYPES = ['标准厂房']
export const PROPERTY_PUBLISH_DEFAULT_SHOTS = ['门口形象照', '路口进出照']
export const PROPERTY_PUBLISH_DEFAULT_RIGHTS = ['国有土地']
export const PROPERTY_PUBLISH_DEFAULT_FOOD = '集中'

export const PROPERTY_LOG_ITEMS = [
  { title: '陈思远 · 查看详情', body: '今天 10:22 · IP 内网' },
  { title: '王敏 · 编辑配电参数', body: '昨天 16:05' },
  { title: '陈思远 · 内部转发卡片', body: '昨天 11:40 · Token TTL 24h' },
  { title: '系统 · 状态→意向中', body: '前天 09:12 · 规则引擎' },
]

export const DEMO_CUSTOMERS = {
  zhangchen: {
    id: 'zhangchen',
    title: '张晨 · 广州××电子装配有限公司',
    companyLine: '广州××电子装配有限公司',
    nameLine: '张晨 · 求租 · 139****9024',
    grade: 'A 类',
    gradeType: 'ok',
    summary: '最近：接受半年付，需业主消防协助书面。',
    remind: '下次沟通 明天 10:00 · 黄埔/增城',
    badges: [
      { text: '私有', type: 'ok' },
      { text: 'A 类', type: 'ok' },
      { text: '急租', type: 'warn' },
      { text: '求租客户', type: 'plain' },
    ],
    reminderChip: '明天 10:00 电话回访',
    followGradeValue: 'A',
    nextFollowInput: '2026-05-13T10:00',
    inheritHint:
      '已从张晨档案带出：等级 A 类、下次提醒 明天 10:00（可在本条修改后写回时间轴）。',
  },
  wangli: {
    id: 'wangli',
    title: '王莉 · 台州星兔塑业有限公司',
    companyLine: '台州星兔塑业有限公司',
    nameLine: '王莉 · 求租 · 0576****7707',
    grade: 'C 类',
    gradeType: 'neutral',
    summary: '最近：暂不考虑，节后回访；已发 11 亩厂房备选资料。',
    remind: '下次沟通 周五 14:00',
    badges: [
      { text: '私有', type: 'ok' },
      { text: 'C 类', type: 'neutral' },
      { text: '求租客户', type: 'plain' },
      { text: '外地', type: 'plain' },
    ],
    reminderChip: '周五 14:00 回访',
    followGradeValue: 'C',
    nextFollowInput: '2026-05-16T14:00',
    inheritHint:
      '已从王莉档案带出：等级 C 类、下次提醒 周五 14:00（适合低意向培育节奏）。',
  },
}

export const CUSTOMER_DETAIL_TIMELINE_ITEMS = [
  { title: '2026-05-11 16:20 · 电话', body: '接受半年付 · 需业主消防协助书面。' },
  { title: '2026-05-08 14:30 · 带看', body: '黄埔科学城 A 栋；配电增容周期待总部确认。' },
  { title: '2026-05-02 10:05 · 微信', body: '首触达，需求 3500㎡ 丙二类。' },
]

export const CUSTOMER_FORM_SEGMENT_OPTIONS = ['求租客户', '求购客户', '拿地建厂', '产业园入驻']
export const CUSTOMER_FORM_GRADE_OPTIONS = ['A', 'B', 'C']
export const CUSTOMER_FORM_DEAL_OPTIONS = ['洽谈中', '已下定', '已成交', '搁置', '无效']

export const CUSTOMER_FOLLOW_GRADE_OPTIONS = ['A 类重点', 'B 类培育', 'C 类观察']
export const CUSTOMER_FOLLOW_TYPE_OPTIONS = ['电话沟通', '带看记录', '微信/IM', '方案报价', '合同磋商']

export const VIDEO_FAQ_ITEMS = [
  {
    kw: '配电增容 周期 业主书面',
    meta: '验厂 · 高频 · 02:18',
    title: '厂房配电增容一般多久？需要业主出具什么？',
    desc: '摘要：报装流程、典型周期、书面清单模板。',
  },
  {
    kw: '独门独院 环评 沟通',
    meta: '话术 · 塑业 / 机械 · 03:05',
    title: '独门独院与环评等级不匹配时如何管理客户预期？',
    desc: '摘要：替代方案、园区背书、书面免责口径。',
  },
  {
    kw: '土地 亩 容积率 举例',
    meta: '政策 · 拿地建厂 · 04:22',
    title: '工业用地亩数与报建容积率怎么给客户举例？',
    desc: '摘要：图示推演、常见误区、引用当地公开案例。',
  },
]

export const MY_PROPERTIES_ROWS = [
  { id: 'P-8821', title: '#P-8821 黄埔科学城', chip: '已上架', chipType: 'ok', sub: '客户可见 · 最近编辑 昨天 16:05' },
  { id: 'P-7730', title: '#P-7730 花都汽车城', chip: '待审核', chipType: 'warn', sub: '客户不可见 · 排队中' },
  { id: 'P-REJECT-001', title: '#P-REJECT-001 南沙仓', chip: '已驳回', chipType: 'danger', sub: '请按驳回意见修改后重新提交' },
  { id: 'P-DRAFT-001', title: '#P-DRAFT-001 草稿', chip: '草稿', chipType: 'neutral', sub: '未提交审核 · 继续编辑' },
]

export const VIEWING_FORM_PROPERTY_OPTIONS = ['黄埔科学城 · 单层高标准厂房 #8821', '花都汽车城 · 独门独院 #7730']
export const VIEWING_FORM_CUSTOMER_OPTIONS = ['张晨 · 求租 · 139****9024', '刘岚 · 拿地建厂 · 136****2210']
export const VIEWING_FORM_GRADE_OPTIONS = ['A 高意向', 'B 待对比', 'C 低意向']
export const VIEWING_FORM_DEFAULT_GATE = '车牌粤 A·DXXXXX · 访客 2 人 · 安全帽已领'

export const DEAL_FORM_PROPERTY_OPTIONS = ['黄埔科学城 #8821 · 租赁', '南沙产业园 #6208 · 出售']
export const DEAL_FORM_CUSTOMER_OPTIONS = ['张晨 · 求租', '刘岚 · 拿地建厂']
export const DEAL_FORM_TYPE_OPTIONS = ['租赁合同', '买卖合同', '意向金/定金']
export const DEAL_FORM_DEFAULT_REMARK = '回款分期：三笔 · 对接财务部台账接口 DEAL_V1。'

export function getProperty(id) {
  return DEMO_PROPERTIES[id] || DEMO_PROPERTIES['P-8821']
}

export function getCustomer(id) {
  return DEMO_CUSTOMERS[id] || DEMO_CUSTOMERS.zhangchen
}
