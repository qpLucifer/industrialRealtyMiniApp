export type PropertySectorScope = 'sale' | 'rent' | 'both'

export interface PropertyListTab {
  key: string
  label: string
  status: string
  /** When true, list only featured (主推) listings within staff sector scope. */
  featuredOnly?: boolean
}

const FEATURED_TAB: PropertyListTab = { key: 'featured', label: '主推', status: '', featuredOnly: true }

/** Display label — maps legacy 待租/待售 if any row not migrated yet. */
export function propertyListStatusLabel(status: string | undefined | null): string {
  const s = String(status || '').trim()
  if (s === '待租') return '出租'
  if (s === '待售') return '出售'
  return s
}

export function propertyListTabsFromScope(scope?: string | null): PropertyListTab[] {
  const s = String(scope || 'both').trim().toLowerCase()
  const all: PropertyListTab = { key: 'all', label: '全部', status: '' }
  if (s === 'sale') {
    return [
      all,
      FEATURED_TAB,
      { key: '出售', label: '出售', status: '出售' },
      { key: '已售', label: '已售', status: '已售' },
      { key: '待开发', label: '待开发', status: '待开发' },
    ]
  }
  if (s === 'rent') {
    return [
      all,
      { key: '出租', label: '出租', status: '出租' },
      { key: '已租', label: '已租', status: '已租' },
    ]
  }
  return [
    all,
    FEATURED_TAB,
    { key: '出租', label: '出租', status: '出租' },
    { key: '出售', label: '出售', status: '出售' },
    { key: '已租', label: '已租', status: '已租' },
    { key: '已售', label: '已售', status: '已售' },
    { key: '待开发', label: '待开发', status: '待开发' },
  ]
}

export function normalizePropertySectorScope(scope?: string | null): PropertySectorScope {
  const s = String(scope || 'both').trim().toLowerCase()
  if (s === 'sale' || s === 'rent') return s
  return 'both'
}
