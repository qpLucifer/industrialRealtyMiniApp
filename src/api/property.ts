import { get } from '@/utils/request'
import type { PropertyDetailPayload, PropertyListItem } from '@/mock/data/properties'

export function fetchPropertyList() {
  return get<{ list: PropertyListItem[] }>('/api/property/list')
}

export function fetchPropertyDetail(id: string) {
  return get<PropertyDetailPayload>('/api/property/detail', { id })
}

export function fetchPropertyLogs() {
  return get<{ list: { line: string; sub: string }[] }>('/api/property/logs')
}

export function fetchMyPublished() {
  return get<{ list: typeof import('@/mock/data/properties').mockMyPublishedProperties }>(
    '/api/property/my-published',
  )
}
