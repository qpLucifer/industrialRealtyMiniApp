/** Property types shared by API and pages (aligned with server admin_full_form_json). */

export interface PropertyListItem {
  id: string
  code: string
  title: string
  metaLine: string
  priceLine: string
  status: string
  statusTone: 'draft' | 'ok' | 'warn' | 'neutral' | 'rejected'
  draftHint?: string
  /** First image from mediaImageUrls / mediaUrls */
  thumbUrl?: string
}

export interface PropertyKvRow {
  dt: string
  dd: string
}

export interface PropertyDetailKv {
  s1: PropertyKvRow[]
  s2: PropertyKvRow[]
  s3: PropertyKvRow[]
  s4: PropertyKvRow[]
  s5: PropertyKvRow[]
  s6: PropertyKvRow[]
  s7: PropertyKvRow[]
  s8: PropertyKvRow[]
}

export interface PropertyDetailPayload {
  id: string
  auditKey: 'live' | 'pending' | 'draft' | 'rejected'
  auditBadge: string
  auditHint: string
  /** Set when auditKey is rejected — show prominently on detail */
  rejectReason?: string
  externalStatus?: string
  detailTitle: string
  specLine: string
  priceLine: string
  leaseChip: string
  company: string
  addrKv: string
  mapCoordLabel: string
  navAddr: string
  lat?: string
  lng?: string
  district?: string
  buildingArea?: string
  powerKva?: string
  rentListSqm?: string
  propertyType?: string
  submitterName?: string
  mediaImages?: string[]
  mediaVideos?: string[]
  kv: PropertyDetailKv
}

export interface MyPublishedProperty {
  code: string
  title: string
  status: string
  statusTone: string
  meta: string
}

/** Admin wizard JSON — subset used by mini publish; extra keys pass through to server. */
export interface PropertyEditForm {
  code?: string
  /** draft | pending | rejected | live — aligned with properties.audit_state */
  auditState?: string
  /** List column status_tag: 草稿 | 待审核 | 驳回 | 待租 | … */
  externalStatus?: string
  auditHint?: string
  submitterName?: string
  listTitle?: string
  companyName?: string
  address?: string
  district?: string
  /** region_defs.id */
  districtRegionId?: number | null
  types?: string[]
  lat?: string
  lng?: string
  landMu?: number | string
  buildingArea?: number | string
  powerKva?: number | string
  freightLifts?: number | string
  dining?: string
  usageRemark?: string
  propertyRights?: string[]
  rentListSqm?: number | string
  propertyFee?: number | string
  contactName?: string
  contactPhone?: string
  viewingNote?: string
  internalNote?: string
  mediaImageUrls?: string
  mediaVideoUrls?: string
  mediaUrls?: string
  ownerContact?: string
  listingLine1?: string
  listingLine2?: string
  rentSaleType?: string
  actualLandMu?: number | string
  actualUseArea?: number | string
  floors?: number | string
  loadPerSqm?: number | string
  workshopSize?: string
  structureTypes?: string[]
  transformers?: number | string
  liftLoadT?: number | string
  transitStation?: string
  vacantMonths?: number | string
  photoChecklist?: string[]
  certificates?: string[]
  landUse?: string[]
  mortgageDispute?: string
  mortgageNote?: string
  structureOther?: string
  propertyRightsOther?: string
  landUseOther?: string
  fireOther?: string
  fireFailReason?: string
  highlights?: string
  risks?: string
  allowedIndustries?: string
  specialLimits?: string
  tradeMode?: string
  firePass?: string
  fireSystems?: string[]
  monitorCoverage?: string
  rushHour?: string
  riskTag?: string
  envLevel?: string
  dischargePermit?: string
  solar?: string
  subsidy?: string
  subsidyDetail?: string
  assessment?: string
  [key: string]: unknown
}
