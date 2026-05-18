/** Mini home workbench — aligned with GET /api/workbench/summary result shape. */

export interface WorkbenchTodo {
  id: string
  title: string
  hint: string
  tone: 'mint' | 'slate'
  /** System-reminder customer — pinned first on home */
  highlight?: boolean
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
  /** Slug of customer shown in system reminder (if any) */
  remindCustomerId?: string | null
  todos: WorkbenchTodo[]
  stats: WorkbenchStat[]
}
