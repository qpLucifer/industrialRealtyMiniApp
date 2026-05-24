import { get } from '@/utils/request'

export type StaffPeerOption = { id: string; name: string }

export function fetchStaffPeers(opts?: { districtRegionId?: number; q?: string }) {
  const query: Record<string, string> = {}
  if (opts?.districtRegionId != null && opts.districtRegionId > 0) {
    query.districtRegionId = String(opts.districtRegionId)
  }
  const q = String(opts?.q ?? '').trim()
  if (q) query.q = q
  return get<{ list: StaffPeerOption[]; selfId: string; selfName: string }>(
    '/api/mini/staff-peers',
    query,
  )
}

/** Form picker: server search for staff peers (optional region scope). */
export async function searchStaffPeers(
  q: string,
  opts?: { districtRegionId?: number },
): Promise<StaffPeerOption[]> {
  const r = await fetchStaffPeers({ ...opts, q })
  return r.list ?? []
}
