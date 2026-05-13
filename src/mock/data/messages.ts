/** Messages + announcements */

export interface MessageItem {
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

export const mockMessages: MessageItem[] = [
  {
    id: 'm1',
    icon: '审',
    iconTone: 'amber',
    title: '房源待审核',
    hint: '#P-7730 花都汽车城 · 独门独院 · 已排队，处理后将推送结果。',
    time: '今天 08:40 · 管理员',
    nav: 'property-detail',
    propId: 'P-7730',
  },
  {
    id: 'm2',
    icon: '驳',
    iconTone: 'rose',
    title: '房源被驳回 · 请修改后重提',
    hint: '#P-REJECT-001 南沙万顷沙 · 配电描述与照片不一致。',
    time: '昨天 17:20 · 审核台',
    nav: 'property-detail',
    propId: 'P-REJECT-001',
  },
  {
    id: 'm3',
    icon: '跟',
    iconTone: 'mint',
    title: '今日待跟进 · 张晨（A）',
    hint: '明天 10:00 电话回访 · 与首页待办同源。',
    time: '系统 · 任务中心',
    nav: 'customer-detail',
    customerId: 'zhangchen',
  },
  {
    id: 'm4',
    icon: '✓',
    iconTone: 'cyan',
    title: '房源审核通过',
    hint: '#P-8821 黄埔科学城 · 已上架，客户侧可见。',
    time: '昨天 11:05 · 审核台',
    nav: 'property-detail',
    propId: 'P-8821',
  },
  {
    id: 'm5',
    icon: '📣',
    iconTone: 'slate',
    title: '培训通知 · 新业务报备',
    hint: '周五 15:00 · 内训频道',
    time: '',
    nav: 'announcements',
  },
]

export const mockAnnouncements = [
  {
    title: '电费计价调整',
    body: '全文略。支持弹窗、已读统计、按角色推送。',
  },
]
