/** Workbench home mock */
import type { WorkbenchSummary } from '@/types/workbench'

export type { WorkbenchSummary } from '@/types/workbench'

export const mockWorkbench: WorkbenchSummary = {
  regionLine: '授权区域：黄埔区 · 增城区 · UID 900218',
  followCount: 5,
  pendingAudit: 1,
  remindHtml: '系统提醒 · 今天 10:00 回访张晨（A 类）· 明天 14:00 台州星兔塑业跟进',
  todos: [
    { id: 'zhangchen', title: '今日待跟进 · 张晨', hint: 'A 类 · 明天 10:00 电话 · 黄埔/增城', tone: 'mint' },
    { id: 'wangli', title: '今日待跟进 · 王莉', hint: 'C 类 · 周五 14:00 · 台州星兔塑业', tone: 'slate' },
  ],
  stats: [
    { value: '128', label: '可租房源' },
    { value: '42', label: '意向客户' },
    { value: '7', label: '本周带看' },
  ],
  announceCard: {
    title: '园区电费计价规则调整',
    tag: '必读',
    hint: '自 6 月起执行分时电价，对内公示，禁止外链。',
    time: '今天 09:30 · 行政部',
  },
}
