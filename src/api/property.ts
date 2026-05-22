import { get, put } from '@/utils/request'
import type { LiveListingStatus } from '@/utils/propertyListingStatus'
import type { MyPublishedProperty, PropertyDetailPayload, PropertyEditForm, PropertyListItem } from '@/types/property'

export {
  consumePropertyDetailRefresh,
  navigateToPropertyDetail,
  navigateToPropertyLog,
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
  districtRegionId?: number
  minArea?: number
  maxArea?: number
}

export function fetchPropertyList(query?: PropertyListQuery) {
  const params: Record<string, string | number> = {}
  if (query?.q) params.q = query.q
  if (query?.status) params.status = query.status
  if (query?.available) params.available = '1'
  if (query?.districtRegionId != null && Number.isFinite(query.districtRegionId)) {
    params.districtRegionId = query.districtRegionId
  }
  if (query?.minArea != null && Number.isFinite(query.minArea)) params.minArea = query.minArea
  if (query?.maxArea != null && Number.isFinite(query.maxArea)) params.maxArea = query.maxArea
  return get<{ list: PropertyListItem[] }>('/api/property/list', params)
}

export function fetchPropertyDetail(key: string) {
  return get<PropertyDetailPayload>('/api/property/detail', apiQueryKey(key))
}

export function fetchPropertyEditForm(key: string) {
  return get<PropertyEditForm>('/api/property/edit-form', apiQueryKey(key))
}

export function fetchPropertyLogs(key: string) {
  return get<{ list: { line: string; sub: string }[] }>('/api/property/logs', apiQueryKey(key))
}

export function fetchMyPublished() {
  return get<{ list: MyPublishedProperty[] }>('/api/property/my-published')
}

export function updatePropertyListingStatus(code: string, externalStatus: LiveListingStatus) {
  return put<{ externalStatus: string; listingLine1: string; listingLine2: string }>(
    '/api/property/listing-status',
    { code, externalStatus },
  )
}
