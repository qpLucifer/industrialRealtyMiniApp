export interface ViewingListItem {
  id: number
  start: string
  end: string
  propertyRef: string
  propertyId?: string | null
  propertyTitle?: string | null
  miniPropCode?: string | null
  customerName: string
  customerSlug?: string | null
  companions: string
  companionStaffIds?: string[]
  score: string
  miniStaff?: string | null
  miniStaffId?: string | null
  /** In-progress when now is between start and end */
  active?: boolean
}

export interface ViewingDetail extends ViewingListItem {}

export interface DealFormDefaults {
  contractType: string
  amountWan: string
  commissionWan: string
  invoice: string
}
