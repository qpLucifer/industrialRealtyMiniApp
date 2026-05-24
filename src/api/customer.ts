import { get, post, put } from '@/utils/request'
import type { PagedListResponse } from '@/utils/pagedList'
import { MINI_LIST_PAGE_SIZE } from '@/utils/pagedList'
import { PICKER_SEARCH_PAGE_SIZE, type PickerSearchPage } from '@/utils/pickerSearch'
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
  page?: number
  pageSize?: number
}) {
  const params: Record<string, string | number | undefined> = { ...query }
  params.page = query?.page ?? 1
  params.pageSize = query?.pageSize ?? MINI_LIST_PAGE_SIZE
  return get<PagedListResponse<CustomerListItem>>('/api/customer/list', params)
}

/** Form picker: server search (public + own private customers). */
export async function searchCustomerPicker(q: string, page = 1): Promise<PickerSearchPage<CustomerListItem>> {
  const r = await fetchCustomerList({
    scope: 'visible',
    q: q.trim() || undefined,
    page,
    pageSize: PICKER_SEARCH_PAGE_SIZE,
  })
  return { list: r.list ?? [], hasMore: Boolean(r.hasMore) }
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
