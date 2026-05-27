import { markListStale, consumeListStale } from '@/utils/listStale'

export function markViewingListStale() {
  markListStale('viewing-list')
}

export function markViewingDetailStale(viewingId: number | string) {
  const id = String(viewingId ?? '').trim()
  if (!id) return
  markListStale(`viewing-detail:${id}`)
}

export function consumeViewingDetailRefresh(viewingId: number | string): boolean {
  const id = String(viewingId ?? '').trim()
  if (!id) return false
  return consumeListStale(`viewing-detail:${id}`)
}
