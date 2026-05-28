/** Live listing statuses — must match server propertyListingStatus.js */

export const LIVE_LISTING_STATUSES = ['待开发', '待租', '已租', '待售', '已售', '待租售', '意向中', '下架封存'] as const

export type LiveListingStatus = (typeof LIVE_LISTING_STATUSES)[number]

export const WORKFLOW_STATUSES = ['草稿', '待审核', '驳回'] as const

/** Default status when going live from rentSaleType (server uses same rules). */
export function defaultStatusLabelForRentSale(rentSaleType: string): string {
  const t = String(rentSaleType || '').trim()
  if (t === '出售') return '待售'
  if (t === '租售皆可') return '待租售'
  return '待租'
}

export function rentSaleStatusHint(rentSaleType: string): string {
  const t = String(rentSaleType || '').trim()
  if (t === '租售皆可') return '租售皆可上架后默认展示「待租售」'
  if (t === '出售') return '出售挂牌上架后默认「待售」'
  if (t === '出租') return '出租挂牌上架后默认「待租」'
  return ''
}
