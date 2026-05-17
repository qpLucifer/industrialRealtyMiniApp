export interface CustomerListItem {
  id: string
  company: string
  titleLine: string
  grade: string
  gradeTone: string
  recent: string
  nextLine: string
}

export interface CustomerDetail {
  id: string
  h2: string
  gradeLabel: string
  reminderText: string
  reminderTone: string
  badgesHtml: string
  phone: string
  lastFollow: string
  kv: { dt: string; dd: string }[]
  timeline: string[]
  followGradeValue: string
  nextFollowInput: string
  inheritHint: string
}
