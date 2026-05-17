export interface MessageItem {
  id: string
  icon: string
  iconTone: 'amber' | 'rose' | 'mint' | 'cyan' | 'slate'
  title: string
  hint: string
  time: string
  nav?: 'property-detail' | 'customer-detail' | 'announcements' | 'settings'
  propId?: string
  customerId?: string
}

export interface AnnouncementItem {
  id: string
  title: string
  body: string
  /** Server: 是 | 否 */
  popup?: string
  popupStart?: string
  popupEnd?: string
  /** From DB: read at current content revision */
  read?: boolean
}

export interface AnnouncementListResult {
  list: AnnouncementItem[]
  unreadCount: number
}
