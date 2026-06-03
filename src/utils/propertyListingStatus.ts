/** Live listing statuses — must match server propertyListingStatus.js */

export const LIVE_LISTING_STATUSES = [
  '待开发',
  '出租',
  '已租',
  '出售',
  '已售',
  '待租售',
  '意向中',
  '下架封存',
] as const

export type LiveListingStatus = (typeof LIVE_LISTING_STATUSES)[number]

export const WORKFLOW_STATUSES = ['草稿', '待审核', '驳回'] as const

const LEGACY_FOR_RENT = '待租'
const LEGACY_FOR_SALE = '待售'

/** Default status when going live from rentSaleType (server uses same rules). */
export function defaultStatusLabelForRentSale(rentSaleType: string): string {
  const t = String(rentSaleType || '').trim()
  if (t === '待开发') return '待开发'
  if (t === '出售') return '出售'
  if (t === '租售皆可') return '待租售'
  return '出租'
}

export function rentSaleStatusHint(rentSaleType: string): string {
  const t = String(rentSaleType || '').trim()
  if (t === '待开发') return '待开发类型上架后默认对外状态为「待开发」'
  if (t === '租售皆可') return '租售皆可上架后默认展示「待租售」'
  if (t === '出售') return '出售挂牌上架后默认「出售」'
  if (t === '出租') return '出租挂牌上架后默认「出租」'
  return ''
}

export function normalizeListingStatusLabel(status: string | undefined | null): string {
  const s = String(status || '').trim()
  if (s === LEGACY_FOR_RENT) return '出租'
  if (s === LEGACY_FOR_SALE) return '出售'
  return s
}
