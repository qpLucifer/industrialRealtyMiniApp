import type { CustomerListItem } from '@/types/customer'

/** Up to 2 chars for placeholder avatar (contact name preferred). */
export function customerInitials(c: Pick<CustomerListItem, 'contactName' | 'titleLine' | 'company'>): string {
  const name = String(c.contactName || c.titleLine?.split('·')[0]?.trim() || '').trim()
  if (name) {
    const compact = name.replace(/\s+/g, '')
    if (compact.length <= 2) return compact
    return compact.slice(-2)
  }
  const company = String(c.company || '').trim()
  if (company) {
    const compact = company.replace(/\s+/g, '')
    return compact.length <= 2 ? compact : compact.slice(0, 2)
  }
  return '客'
}

export function customerGradeKey(c: Pick<CustomerListItem, 'grade'>): 'a' | 'b' | 'c' {
  const g = String(c.grade || '').trim()
  if (g.startsWith('A')) return 'a'
  if (g.startsWith('B')) return 'b'
  return 'c'
}

export function customerAvatarToneClass(c: Pick<CustomerListItem, 'grade'>): string {
  const key = customerGradeKey(c)
  if (key === 'a') return 'cust-avatar--brand'
  if (key === 'b') return 'cust-avatar--blue'
  return 'cust-avatar--slate'
}

export function customerCardGradeClass(c: Pick<CustomerListItem, 'grade'>): string {
  const key = customerGradeKey(c)
  if (key === 'a') return 'cust-card--grade-a'
  if (key === 'b') return 'cust-card--grade-b'
  return 'cust-card--grade-c'
}

export function customerGradeChipClass(c: Pick<CustomerListItem, 'grade'>): string {
  const key = customerGradeKey(c)
  if (key === 'a') return 'ok'
  if (key === 'b') return 'cust-grade--b'
  return 'cust-grade--c'
}
