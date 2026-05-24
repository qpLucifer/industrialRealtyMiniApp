import { ref } from 'vue'
import { fetchStaffPeers, type StaffPeerOption } from '@/api/staff'

const REGION_UNSET_LABEL = '不指定'

/** Picker labels: optional "unset" + authorized region names. */
export function customerRegionPickerLabels(regionNames: string[], allowUnset = true) {
  return allowUnset ? [REGION_UNSET_LABEL, ...regionNames] : [...regionNames]
}

export function customerRegionPickerIndex(
  labels: string[],
  district: string,
  hasRegionId: boolean,
) {
  if (!hasRegionId && !district.trim()) return 0
  const i = labels.indexOf(district)
  return i >= 0 ? i : 0
}

/**
 * Load staff peers for public-customer owner picker.
 * When districtRegionId is set, only staff covering that region; otherwise all active staff.
 */
export function useCustomerStaffPeers() {
  const staffOptions = ref<StaffPeerOption[]>([])
  const selfId = ref('')
  const selfName = ref('')

  async function reloadStaffPeers(districtRegionId?: number, q?: string) {
    try {
      const staff = await fetchStaffPeers({
        ...(districtRegionId != null && districtRegionId > 0 ? { districtRegionId } : {}),
        ...(q?.trim() ? { q: q.trim() } : {}),
      })
      selfId.value = staff.selfId
      selfName.value = staff.selfName
      staffOptions.value = staff.list
    } catch {
      staffOptions.value = []
    }
  }

  function prunePublicOwners(publicOwnerStaffIds: string[]) {
    const allowed = new Set(staffOptions.value.map((s) => s.id))
    return publicOwnerStaffIds.filter((id) => allowed.has(id))
  }

  function staffSearchFn(districtRegionId?: number) {
    return (q: string) =>
      fetchStaffPeers({
        ...(districtRegionId != null && districtRegionId > 0 ? { districtRegionId } : {}),
        q,
      }).then((r) => r.list ?? [])
  }

  return {
    staffOptions,
    selfId,
    selfName,
    reloadStaffPeers,
    staffSearchFn,
    prunePublicOwners,
    REGION_UNSET_LABEL,
  }
}
