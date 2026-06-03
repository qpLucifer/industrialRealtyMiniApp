export type PropertySectorScope = 'sale' | 'rent' | 'both'

export interface PropertyListTab {
  key: string
  label: string
  status: string
}

export function propertyListTabsFromScope(scope?: string | null): PropertyListTab[] {
  const s = String(scope || 'both').trim().toLowerCase()
  const all: PropertyListTab = { key: 'all', label: '全部', status: '' }
  if (s === 'sale') {
    return [
      all,
      { key: '待售', label: '待售', status: '待售' },
      { key: '已售', label: '已售', status: '已售' },
      { key: '待开发', label: '待开发', status: '待开发' },
    ]
  }
  if (s === 'rent') {
    return [
      all,
      { key: '待租', label: '待租', status: '待租' },
      { key: '已租', label: '已租', status: '已租' },
    ]
  }
  return [
    all,
    { key: '待租', label: '待租', status: '待租' },
    { key: '待售', label: '待售', status: '待售' },
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
