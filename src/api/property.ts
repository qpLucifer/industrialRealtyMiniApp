import { get } from '@/utils/request'
import type { MyPublishedProperty, PropertyDetailPayload, PropertyEditForm, PropertyListItem } from '@/types/property'

export function fetchPropertyList(query?: { q?: string; status?: string }) {
  return get<{ list: PropertyListItem[] }>('/api/property/list', query)
}

export function fetchPropertyDetail(id: string) {
  return get<PropertyDetailPayload>('/api/property/detail', { id })
}

export function fetchPropertyEditForm(code: string) {
  return get<PropertyEditForm>('/api/property/edit-form', { code, id: code })
}

export function fetchPropertyLogs(code: string) {
  return get<{ list: { line: string; sub: string }[] }>('/api/property/logs', { code, id: code })
}

export function fetchMyPublished() {
  return get<{ list: MyPublishedProperty[] }>('/api/property/my-published')
}
