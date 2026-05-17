/** Messages + announcements */

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toLocalIsoMinute(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const popupStart = new Date()
popupStart.setDate(popupStart.getDate() - 1)
const popupEnd = new Date()
popupEnd.setDate(popupEnd.getDate() + 14)

export interface MockMessage {
  id: string
  icon: string
  iconTone: 'amber' | 'rose' | 'mint' | 'cyan' | 'slate'
  title: string
  hint: string
  time: string
  nav?: 'property-detail' | 'customer-detail' | 'announcements'
  propId?: string
  customerId?: string
}

export const mockMessages: MockMessage[] = [
  {
    id: 'm1',
    icon: 'bell',
    iconTone: 'amber',
    title: '房源审核通过',
    hint: '黄埔 · 科学城厂房 A 栋',
    time: '10 分钟前',
    nav: 'property-detail',
    propId: 'p1',
  },
  {
    id: 'm2',
    icon: 'user',
    iconTone: 'mint',
    title: '客户跟进提醒',
    hint: '张晨 · 明天 10:00 电话',
    time: '1 小时前',
    nav: 'customer-detail',
    customerId: 'zhangchen',
  },
  {
    id: 'm3',
    icon: 'megaphone',
    iconTone: 'cyan',
    title: '培训通知 · 新业务报备',
    hint: '周五 15:00 · 内训频道',
    time: '',
    nav: 'announcements',
  },
]

export const mockAnnouncements = [
  {
    id: '1',
    title: '电费计价调整',
    body: '全文略。支持弹窗、已读统计、按角色推送。',
    popup: '否',
    popupStart: '',
    popupEnd: '',
  },
  {
    id: '2',
    title: '春节放假安排',
    body: '放假期间系统照常运行。',
    popup: '是',
    popupStart: toLocalIsoMinute(popupStart),
    popupEnd: toLocalIsoMinute(popupEnd),
  },
]
