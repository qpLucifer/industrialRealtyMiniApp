import { get } from '@/utils/request'
import type { CustomerDetail, CustomerListItem } from '@/types/customer'

export function fetchCustomerList(query?: { q?: string; scope?: 'mine' | 'public' | '' }) {
  return get<{ list: CustomerListItem[] }>('/api/customer/list', query)
}

export function fetchCustomerDetail(id: string) {
  return get<CustomerDetail>('/api/customer/detail', { id })
}
