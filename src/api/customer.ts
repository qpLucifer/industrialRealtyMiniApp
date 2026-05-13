import { get } from '@/utils/request'
import type { CustomerDetailMock, CustomerListItem } from '@/mock/data/customers'

export function fetchCustomerList() {
  return get<{ list: CustomerListItem[] }>('/api/customer/list')
}

export function fetchCustomerDetail(id: string) {
  return get<CustomerDetailMock>('/api/customer/detail', { id })
}
