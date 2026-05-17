/** Workbench home mock */
import type { WorkbenchSummary } from '@/types/workbench'

export type { WorkbenchSummary } from '@/types/workbench'

export const mockWorkbench: WorkbenchSummary = {
  regionLine: '授权区域：黄埔区 · 增城区 · UID 900218',
  followCount: 2,
  pendingAudit: 1,
  remindHtml: '系统提醒 · 2026-05-13 10:00 跟进 张晨',
  todos: [
    { id: 'zhangchen', title: '张晨 · 待跟进', hint: 'A 类 · 2026-05-13 10:00 · 黄埔/增城', tone: 'mint' },
    { id: 'wangli', title: '王莉 · 待跟进', hint: 'C 类 · 2026-05-16 14:00 · 台州', tone: 'slate' },
  ],
  stats: [
    { value: '128', label: '可租房源' },
    { value: '42', label: '意向客户' },
    { value: '7', label: '本周带看' },
  ],
}
