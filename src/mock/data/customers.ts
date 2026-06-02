/** Customer mock — maps to customer APIs */

import type { CustomerDetail, CustomerListItem } from '@/types/customer'
import { mockSecuritySettings } from '@/mock/data/user'

export const mockCustomerList: CustomerListItem[] = [
  {
    id: 'zhangchen',
    company: '广州××电子装配有限公司',
    contactName: '张晨',
    titleLine: '张晨 · 求租',
    grade: 'A 类',
    gradeTone: 'ok',
    gradeTag: 'mint',
    dealStatus: '洽谈中',
    recent: '最近：接受半年付，需业主消防协助书面。',
    nextLine: '下次沟通 2026-05-13 10:00',
    nextReminder: '2026-05-13 10:00',
    nextReminderAt: '2026-12-01T10:00:00',
    ownerName: '张晨',
    scope: '私有',
    district: '黄埔区',
    districtRegionId: 1,
  },
  {
    id: 'wangli',
    company: '台州星兔塑业有限公司',
    contactName: '王莉',
    titleLine: '王莉 · 求租',
    grade: 'C 类',
    gradeTone: 'neutral',
    gradeTag: 'rose',
    dealStatus: '洽谈中',
    recent: '最近：暂不考虑，节后回访。',
    nextLine: '下次沟通 2026-05-16 14:00',
    nextReminder: '2026-05-16 14:00',
    nextReminderAt: '2020-01-10T14:00:00',
    ownerName: '王莉',
    scope: '私有',
    district: '花都区',
    districtRegionId: 2,
  },
  {
    id: 'linuo',
    company: '深圳××智能制造有限公司',
    contactName: '李诺',
    titleLine: '李诺 · 求购',
    grade: 'B 类',
    gradeTone: 'neutral',
    gradeTag: 'slate',
    dealStatus: '洽谈中',
    recent: '最近：关注增城地块，预算面议。',
    nextLine: '下次沟通 2026-05-20 09:30',
    nextReminder: '2026-05-20 09:30',
    nextReminderAt: '2026-05-25T09:30:00',
    ownerName: '公海',
    scope: '公有',
    district: '南沙区',
    districtRegionId: 3,
  },
]

function buildDetail(id: string): CustomerDetail {
  const base = mockCustomerList.find((c) => c.id === id) || mockCustomerList[0]
  const isZhang = base.id === 'zhangchen'
  return {
    id: base.id,
    slug: base.id,
    company: base.company,
    contactName: base.contactName,
    titleLine: base.titleLine,
    avatarUrl: base.avatarUrl,
    phone: isZhang ? '13912349024' : '05767707707',
    phoneMasked: isZhang ? '139****9024' : '0576****7707',
    grade: base.grade,
    dealStatus: base.dealStatus,
    demandSummary: isZhang ? '3000–5000㎡ 丙二类厂房，黄埔/增城' : '2000㎡ 左右仓库，台州近高速',
    district: base.district || '',
    districtRegionId: base.districtRegionId ?? null,
    addressHint: isZhang ? '黄埔 / 增城交界' : '台州 · 近高速口',
    ownerName: base.ownerName,
    scope: base.scope,
    badgesHtml: isZhang ? '私有,A,急租' : '私有,C,求租',
    lastFollow: isZhang ? '2026-05-11 16:20' : '2026-01-09 15:40',
    nextReminder: base.nextReminder,
    nextFollowInput: isZhang ? '2026-05-13 10:00' : '2026-05-16 14:00',
    reminderText: base.nextReminder,
    reminderTone: 'warn',
    kv: [
      { dt: '需求摘要', dd: isZhang ? '3000–5000㎡ 丙二类' : '2000㎡ 仓库' },
      { dt: '所属区域', dd: base.district || '—' },
      { dt: '地址提示', dd: isZhang ? '黄埔 / 增城交界' : '台州 · 近高速口' },
      { dt: '成交状态', dd: '洽谈中' },
    ],
    timeline: isZhang
      ? ['2026-05-11 16:20 · 电话 接受半年付', '2026-05-08 14:30 · 带看 黄埔科学城']
      : ['2026-01-09 15:40 · 现场拍照备选厂房'],
    canEdit: true,
    h2: `${base.contactName} · ${base.company}`,
    gradeLabel: base.grade,
  }
}

export function getCustomerDetail(id: string): CustomerDetail {
  const d = buildDetail(id)
  if (!mockSecuritySettings.maskCustomerPhone) return d
  if (d.canEdit) return d
  return { ...d, phone: d.phoneMasked || d.phone }
}
