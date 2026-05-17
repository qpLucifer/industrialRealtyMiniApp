export type CustomerGrade = 'A 类' | 'B 类' | 'C 类'
export type CustomerScope = '私有' | '公有'
export type CustomerDealStatus = '洽谈中' | '已成交' | '搁置'

export interface CustomerListItem {
  id: string
  company: string
  contactName: string
  titleLine: string
  grade: string
  gradeTone: string
  gradeTag?: string
  dealStatus: string
  recent: string
  nextLine: string
  nextReminder: string
  ownerName: string
  scope: CustomerScope
}

export interface CustomerDetail {
  id: string
  slug: string
  company: string
  contactName: string
  titleLine: string
  phone: string
  phoneMasked: string
  grade: string
  dealStatus: string
  demandSummary: string
  addressHint: string
  ownerName: string
  scope: CustomerScope
  badgesHtml: string
  lastFollow: string
  nextReminder: string
  nextFollowInput: string
  reminderText: string
  reminderTone: string
  kv: { dt: string; dd: string }[]
  timeline: string[]
  canEdit: boolean
  /** Legacy display */
  h2: string
  gradeLabel: string
}

export interface CustomerFormPayload {
  company: string
  contactName: string
  titleLine?: string
  phone: string
  grade: string
  dealStatus: string
  demandSummary?: string
  addressHint?: string
  scope: CustomerScope
  ownerName?: string
}

export interface CustomerFollowUpPayload {
  slug: string
  note: string
  occurredAt?: string
  grade?: string
  nextReminderAt?: string
}
