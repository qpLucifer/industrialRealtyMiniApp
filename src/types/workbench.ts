/** Mini home workbench — aligned with GET /api/workbench/summary result shape. */

export interface WorkbenchTodo {
  id: string
  title: string
  hint: string
  tone: 'mint' | 'slate'
}

export interface WorkbenchStat {
  value: string
  label: string
}

export interface WorkbenchSummary {
  regionLine: string
  followCount: number
  pendingAudit: number
  remindHtml: string
  todos: WorkbenchTodo[]
  stats: WorkbenchStat[]
}
