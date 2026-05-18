import { markListStale, consumeListStale } from '@/utils/listStale'

const LIST_KEY = 'customer-list'

export function markCustomerListStale() {
  markListStale(LIST_KEY)
}

export function consumeCustomerListStale(): boolean {
  return consumeListStale(LIST_KEY)
}

export function markCustomerDetailStale(customerId: string) {
  const id = String(customerId || '').trim()
  if (!id) return
  markListStale(`customer-detail:${id}`)
}

export function consumeCustomerDetailRefresh(customerId: string): boolean {
  const id = String(customerId || '').trim()
  if (!id) return false
  return consumeListStale(`customer-detail:${id}`)
}
