/** Workbench home mock */
import type { WorkbenchSummary } from '@/types/workbench'

export type { WorkbenchSummary } from '@/types/workbench'

export const mockWorkbench: WorkbenchSummary = {
  regionLine: '授权区域：黄埔区 · 增城区 · UID 900218',
  followCount: 2,
  pendingAudit: 1,
  remindHtml: '系统提醒 · 2026-05-13 10:00 跟进 张晨',
  remindCustomerId: 'zhangchen',
  todos: [
    {
      id: 'zhangchen',
      title: '张晨 · 洽谈中',
      hint: 'A 类 · 2026-05-13 10:00 · 上周完成验厂',
      tone: 'mint',
      highlight: true,
    },
    { id: 'wangli', title: '王莉 · 洽谈中', hint: 'C 类 · 关注南沙仓', tone: 'slate' },
  ],
  stats: [
    { value: '128', label: '房源总数' },
    { value: '42', label: '客户总数' },
    { value: '7', label: '本周带看' },
  ],
}
