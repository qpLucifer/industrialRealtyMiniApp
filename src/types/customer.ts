export type CustomerGrade = 'A 类' | 'B 类' | 'C 类'
export type CustomerScope = '私有' | '公有'
export type CustomerDealStatus = '洽谈中' | '已成交' | '搁置'

export interface CustomerListItem {
  id: string
  company: string
  contactName: string
  titleLine: string
  avatarUrl?: string
  grade: string
  gradeTone: string
  gradeTag?: string
  dealStatus: string
  recent: string
  nextLine: string
  nextReminder: string
  ownerName: string
  scope: CustomerScope
  district?: string
  districtRegionId?: number | null
  /** Mock / debug: ISO datetime for reminder filters */
  nextReminderAt?: string
}

export interface CustomerFollowEntry {
  occurredAt: string
  note: string
  imageUrls: string[]
  audioUrls: string[]
  displayLine: string
}

export interface CustomerDetail {
  id: string
  slug: string
  company: string
  contactName: string
  titleLine: string
  avatarUrl?: string
  phone: string
  phoneMasked: string
  grade: string
  dealStatus: string
  demandSummary: string
  addressHint: string
  district?: string
  districtRegionId?: number | null
  ownerName: string
  ownerStaffIds?: string[]
  scope: CustomerScope
  badgesHtml: string
  lastFollow: string
  nextReminder: string
  nextFollowInput: string
  reminderText: string
  reminderTone: string
  kv: { dt: string; dd: string }[]
  timeline: CustomerFollowEntry[]
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
  avatarUrl?: string | null
  grade: string
  dealStatus: string
  demandSummary?: string
  addressHint?: string
  district?: string
  districtRegionId?: number | null
  scope: CustomerScope
  ownerName?: string
  /** Public pool: optional assignee; private pool: omit (server uses current staff). */
  ownerStaffIds?: string[]
}

export interface CustomerFollowUpPayload {
  slug: string
  note?: string
  occurredAt?: string
  grade?: string
  nextReminderAt?: string
  imageUrls?: string[]
  audioUrls?: string[]
}
