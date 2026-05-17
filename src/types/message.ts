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
  title: string
  body: string
  popup?: boolean
  popupStart?: string
  popupEnd?: string
}
