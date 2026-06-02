import { get, post, put } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import { MINI_LIST_PAGE_SIZE } from '@/utils/pagedList'
import { PICKER_SEARCH_PAGE_SIZE, type PickerSearchPage } from '@/utils/pickerSearch'
import type { LiveListingStatus } from '@/utils/propertyListingStatus'
import type {
  MyPublishedProperty,
  PropertyDetailPayload,
  PropertyEditForm,
  PropertyFollowUpPayload,
  PropertyListItem,
  PropertyLogEntry,
} from '@/types/property'

export {
  consumePropertyDetailRefresh,
  navigateToPropertyDetail,
  navigateToPropertyLog,
  navigateToPropertyFollow,
  navigateToPropertyPublish,
  navigateToViewingNew,
  markPropertyDetailStale,
  parsePropertyRouteKey,
  propertyNavKey,
} from '@/utils/propertyNav'

function apiQueryKey(key: string) {
  const k = String(key || '').trim()
  return { id: k, code: k }
}

export type PropertyListQuery = {
  q?: string
  status?: string
  /** Filter status_tag 待租/待售 (optional; home stat uses total count without this) */
  available?: boolean
  /** Only audit_state = live (e.g. viewing property picker) */
  auditLive?: boolean
  districtRegionId?: number
  minArea?: number
  maxArea?: number
  page?: number
  pageSize?: number
}

export function fetchPropertyList(query?: PropertyListQuery) {
  const params: Record<string, string | number> = {}
  if (query?.q) params.q = query.q
  if (query?.status) params.status = query.status
  if (query?.available) params.available = '1'
  if (query?.auditLive) params.auditLive = '1'
  if (query?.districtRegionId != null && Number.isFinite(query.districtRegionId)) {
    params.districtRegionId = query.districtRegionId
  }
  if (query?.minArea != null && Number.isFinite(query.minArea)) params.minArea = query.minArea
  if (query?.maxArea != null && Number.isFinite(query.maxArea)) params.maxArea = query.maxArea
  params.page = query?.page ?? 1
  params.pageSize = query?.pageSize ?? MINI_LIST_PAGE_SIZE
  return get<PagedListResponse<PropertyListItem>>('/api/property/list', params)
}

export function fetchPropertyDetail(key: string) {
  return get<PropertyDetailPayload>('/api/property/detail', apiQueryKey(key))
}

export function fetchPropertyEditForm(key: string) {
  return get<PropertyEditForm>('/api/property/edit-form', apiQueryKey(key))
}

export function fetchPropertyLogs(key: string) {
  return get<{ list: PropertyLogEntry[] }>('/api/property/logs', apiQueryKey(key))
}

export function postPropertyFollowUp(payload: PropertyFollowUpPayload) {
  return post<{ success: boolean }>('/api/property/follow-up', payload as Record<string, unknown>)
}

/** Form picker: server search over visible properties for current staff. */
export async function searchPropertyPicker(q: string, page = 1): Promise<PickerSearchPage<PropertyListItem>> {
  const r = await fetchPropertyList({
    q: q.trim() || undefined,
    page,
    pageSize: PICKER_SEARCH_PAGE_SIZE,
    auditLive: true,
  })
  return { list: r.list ?? [], hasMore: Boolean(r.hasMore) }
}

export function fetchMyPublished(query?: { page?: number; pageSize?: number }) {
  return get<PagedListResponse<MyPublishedProperty>>('/api/property/my-published', {
    page: query?.page ?? 1,
    pageSize: query?.pageSize ?? MINI_LIST_PAGE_SIZE,
  })
}

export function updatePropertyListingStatus(
  code: string,
  externalStatus: LiveListingStatus,
  opts?: { featured?: boolean },
) {
  const body: Record<string, unknown> = { code, externalStatus }
  if (opts?.featured !== undefined) body.featured = opts.featured
  return put<{ externalStatus: string; featured?: boolean; listingLine1: string; listingLine2: string }>(
    '/api/property/listing-status',
    body,
  )
}
