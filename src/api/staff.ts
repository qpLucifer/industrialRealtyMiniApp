import { get } from '@/utils/request'

export type StaffPeerOption = { id: string; name: string }

export function fetchStaffPeers() {
  return get<{ list: StaffPeerOption[]; selfId: string; selfName: string }>('/api/mini/staff-peers')
}
