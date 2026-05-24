import { get, post, put } from '@/utils/request'
import type {
  CustomerDetail,
  CustomerFollowUpPayload,
  CustomerFormPayload,
  CustomerListItem,
} from '@/types/customer'

export type CustomerListReminderFilter = 'due' | 'overdue' | 'week'

export type CustomerListScope = 'mine' | 'public' | 'visible' | ''

export function fetchCustomerList(query?: {
  q?: string
  scope?: CustomerListScope
  districtRegionId?: number | null
  grade?: string
  dealStatus?: string
  reminder?: CustomerListReminderFilter
}) {
  return get<{ list: CustomerListItem[] }>('/api/customer/list', query)
}

/** Viewing pickers: public + own private customers only. */
export function fetchCustomerPickerList() {
  return fetchCustomerList({ scope: 'visible' })
}

export function fetchCustomerDetail(id: string) {
  return get<CustomerDetail>('/api/customer/detail', { id })
}

export function createCustomer(payload: CustomerFormPayload) {
  return post<{ success: boolean; slug: string; id: string }>('/api/customer', payload as Record<string, unknown>)
}

export function updateCustomer(slug: string, payload: CustomerFormPayload) {
  return put<{ success: boolean }>(`/api/customer/${encodeURIComponent(slug)}`, payload as Record<string, unknown>)
}

export function postCustomerFollowUp(payload: CustomerFollowUpPayload) {
  return post<{ success: boolean }>('/api/customer/follow-up', payload as Record<string, unknown>)
}
