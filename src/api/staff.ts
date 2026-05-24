import { get } from '@/utils/request'

export type StaffPeerOption = { id: string; name: string }

export function fetchStaffPeers(opts?: { districtRegionId?: number }) {
  const query: Record<string, string> = {}
  if (opts?.districtRegionId != null && opts.districtRegionId > 0) {
    query.districtRegionId = String(opts.districtRegionId)
  }
  return get<{ list: StaffPeerOption[]; selfId: string; selfName: string }>(
    '/api/mini/staff-peers',
    query,
  )
}
