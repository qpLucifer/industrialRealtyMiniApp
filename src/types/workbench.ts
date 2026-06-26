/** Mini home workbench — aligned with GET /api/workbench/summary result shape. */

import type { AnnouncementItem } from '@/types/message'

export interface WorkbenchTodo {
  id: string
  title: string
  hint: string
  tone: 'mint' | 'slate'
  /** System-reminder customer — pinned first on home */
  highlight?: boolean
  avatarUrl?: string
  contactName?: string
  grade?: string
  company?: string
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
  /** Viewing id when system reminder is viewing-related */
  remindViewingId?: number | null
  todos: WorkbenchTodo[]
  stats: WorkbenchStat[]
  /** Unread published announcements for badge */
  unreadAnnounceCount?: number
  /** Active popup window + unread; null when none to show */
  popupAnnouncement?: AnnouncementItem | null
}
