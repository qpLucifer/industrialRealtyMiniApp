/** Customer mock — maps to customer / follow_up */

export interface CustomerListItem {
  id: string
  company: string
  titleLine: string
  grade: string
  gradeTone: 'ok' | 'neutral'
  recent: string
  nextLine: string
}

export const mockCustomerList: CustomerListItem[] = [
  {
    id: 'zhangchen',
    company: '广州××电子装配有限公司',
    titleLine: '张晨 · 求租 · 139****9024',
    grade: 'A 类',
    gradeTone: 'ok',
    recent: '最近：接受半年付，需业主消防协助书面。',
    nextLine: '下次沟通 明天 10:00 · 黄埔/增城',
  },
  {
    id: 'wangli',
    company: '台州星兔塑业有限公司',
    titleLine: '王莉 · 求租 · 0576****7707',
    grade: 'C 类',
    gradeTone: 'neutral',
    recent: '最近：暂不考虑，节后回访；已发 11 亩厂房备选资料。',
    nextLine: '下次沟通 周五 14:00',
  },
]

export interface CustomerDetailMock {
  id: string
  h2: string
  gradeLabel: string
  reminderText: string
  reminderTone: 'warn' | 'neutral'
  badgesHtml: string
  phone: string
  lastFollow: string
  kv: { dt: string; dd: string }[]
  timeline: string[]
  followGradeValue: string
  nextFollowInput: string
  inheritHint: string
}

const DETAIL: Record<string, CustomerDetailMock> = {
  zhangchen: {
    id: 'zhangchen',
    h2: '张晨 · 广州××电子装配有限公司',
    gradeLabel: 'A 类',
    reminderText: '明天 10:00 电话回访',
    reminderTone: 'warn',
    badgesHtml: '私有,A,急租,求租',
    phone: '139****9024',
    lastFollow: '2026-05-11 16:20',
    kv: [
      { dt: '意向区域', dd: '黄埔 / 增城交界' },
      { dt: '意向面积', dd: '3000–5000㎡' },
      { dt: '预算', dd: '租金 ≤35 元/㎡·月' },
      { dt: '行业', dd: '电子装配 + 仓储' },
      { dt: '需求偏好', dd: '丙二类、5T 行车、卸货平台、宿舍 2km 内' },
      { dt: '成交状态', dd: '洽谈中' },
    ],
    timeline: [
      '2026-05-11 16:20 · 电话 接受半年付 · 需业主消防协助书面。',
      '2026-05-08 14:30 · 带看 黄埔科学城 A 栋；配电增容周期待总部确认。',
      '2026-05-02 10:05 · 微信 首触达，需求 3500㎡ 丙二类。',
    ],
    followGradeValue: 'A',
    nextFollowInput: '2026-05-13T10:00',
    inheritHint:
      '已从张晨档案带出：等级 A 类、下次提醒 明天 10:00（可在本条修改后写回时间轴）。',
  },
  wangli: {
    id: 'wangli',
    h2: '王莉 · 台州星兔塑业有限公司',
    gradeLabel: 'C 类',
    reminderText: '周五 14:00 回访',
    reminderTone: 'neutral',
    badgesHtml: '私有,C,求租,外地',
    phone: '0576****7707',
    lastFollow: '2026-01-09 15:40',
    kv: [
      { dt: '意向区域', dd: '台州 · 近高速口' },
      { dt: '意向面积', dd: '2000㎡ 左右仓库' },
      { dt: '预算', dd: '环评已通过类厂房优先' },
      { dt: '行业', dd: '塑业' },
      { dt: '需求偏好', dd: '仓储' },
      { dt: '成交状态', dd: '洽谈中' },
    ],
    timeline: [
      '01-09 现场拍照 11 亩厂房备选。',
      '12-25 暂不考虑，节后回访。',
    ],
    followGradeValue: 'C',
    nextFollowInput: '2026-05-16T14:00',
    inheritHint:
      '已从王莉档案带出：等级 C 类、下次提醒 周五 14:00（适合低意向培育节奏）。',
  },
}

export function getCustomerDetail(id: string): CustomerDetailMock {
  return DETAIL[id] || DETAIL.zhangchen
}
