import { computed, reactive, ref } from 'vue'
import type { LandAuctionDetail, LandAuctionFormPayload, LandAuctionStatus } from '@/types/landAuction'
import { assertEndAfterStart } from '@/utils/datetimeRange'
import { fetchRegionDefs } from '@/utils/request'

export const LAND_STATUS_OPTIONS: { value: LandAuctionStatus; label: string }[] = [
  { value: 'upcoming', label: '即将挂拍' },
  { value: 'auctioning', label: '正在拍卖' },
  { value: 'completed', label: '已成交' },
]

export function splitDateTime(value: string) {
  const t = String(value || '').trim()
  if (!t) return { date: '', time: '' }
  const normalized = t.replace('T', ' ')
  const [date, time] = normalized.split(/\s+/)
  return { date: date || '', time: (time || '').slice(0, 5) }
}

export function joinDateTime(date: string, time: string) {
  const d = String(date || '').trim()
  const tm = String(time || '').trim()
  if (!d && !tm) return ''
  if (!d) return tm
  if (!tm) return d
  return `${d} ${tm}`
}

export function useLandAuctionForm() {
  const regionDefs = ref<{ id: number; name: string }[]>([])
  const regionNames = computed(() => regionDefs.value.map((r) => r.name))
  const statusLabels = LAND_STATUS_OPTIONS.map((s) => s.label)

  const form = reactive({
    title: '',
    districtRegionId: 0,
    district: '',
    areaMu: '',
    transferTerm: '',
    taxPerMu: '',
    investmentPerMu: '',
    depositWan: '',
    startPriceWan: '',
    dealPriceWan: '',
    avgPricePerMu: '',
    buyerInfo: '',
    auctionStatus: 'upcoming' as LandAuctionStatus,
    listingDate: '',
    auctionStartDate: '',
    auctionStartTime: '',
    auctionEndDate: '',
    auctionEndTime: '',
    completedDate: '',
    completedTime: '',
    remark: '',
  })

  async function loadRegions() {
    try {
      const { list } = await fetchRegionDefs()
      regionDefs.value = (list ?? [])
        .map((r) => {
          const id = Number((r as { id?: number | string }).id)
          const name = String((r as { name?: string }).name || '').trim()
          return Number.isFinite(id) && name ? { id, name } : null
        })
        .filter(Boolean) as { id: number; name: string }[]
    } catch {
      regionDefs.value = []
    }
  }

  function fillFromDetail(d: LandAuctionDetail) {
    form.title = d.title
    form.districtRegionId = d.districtRegionId ?? 0
    form.district = d.region
    form.areaMu = d.areaMu != null ? String(d.areaMu) : ''
    form.transferTerm = d.transferTerm || ''
    form.taxPerMu = d.taxPerMu != null ? String(d.taxPerMu) : ''
    form.investmentPerMu = d.investmentPerMu != null ? String(d.investmentPerMu) : ''
    form.depositWan = d.depositWan != null ? String(d.depositWan) : ''
    form.startPriceWan = d.startPriceWan != null ? String(d.startPriceWan) : ''
    form.dealPriceWan = d.dealPriceWan != null ? String(d.dealPriceWan) : ''
    form.avgPricePerMu = d.avgPricePerMu != null ? String(d.avgPricePerMu) : ''
    form.buyerInfo = d.buyerInfo || ''
    form.auctionStatus = d.auctionStatus
    form.listingDate = d.listingDate || ''
    const start = splitDateTime(d.auctionStartAt)
    form.auctionStartDate = start.date
    form.auctionStartTime = start.time || '10:00'
    const end = splitDateTime(d.auctionEndAt)
    form.auctionEndDate = end.date
    form.auctionEndTime = end.time || '16:00'
    const done = splitDateTime(d.completedAt)
    form.completedDate = done.date
    form.completedTime = done.time || '15:00'
    form.remark = d.remark || ''
    if (form.districtRegionId && !regionDefs.value.some((r) => r.id === form.districtRegionId)) {
      regionDefs.value = [...regionDefs.value, { id: form.districtRegionId, name: form.district }]
    }
  }

  function onRegionPick(e: { detail: { value: string | number } }) {
    const i = Number(e.detail.value)
    const row = regionDefs.value[i]
    if (row) {
      form.districtRegionId = row.id
      form.district = row.name
    }
  }

  function onStatusPick(e: { detail: { value: string | number } }) {
    const i = Number(e.detail.value)
    form.auctionStatus = LAND_STATUS_OPTIONS[i]?.value ?? 'upcoming'
  }

  function buildPayload(): LandAuctionFormPayload {
    return {
      title: form.title.trim(),
      districtRegionId: form.districtRegionId,
      areaMu: form.areaMu.trim() === '' ? null : Number(form.areaMu),
      transferTerm: form.transferTerm.trim() || null,
      taxPerMu: form.taxPerMu.trim() === '' ? null : Number(form.taxPerMu),
      investmentPerMu: form.investmentPerMu.trim() === '' ? null : Number(form.investmentPerMu),
      depositWan: form.depositWan.trim() === '' ? null : Number(form.depositWan),
      startPriceWan: form.startPriceWan.trim() === '' ? null : Number(form.startPriceWan),
      dealPriceWan: form.dealPriceWan.trim() === '' ? null : Number(form.dealPriceWan),
      avgPricePerMu: form.avgPricePerMu.trim() === '' ? null : Number(form.avgPricePerMu),
      buyerInfo: form.buyerInfo.trim() || null,
      auctionStatus: form.auctionStatus,
      listingDate: form.listingDate || null,
      auctionStartAt: joinDateTime(form.auctionStartDate, form.auctionStartTime) || null,
      auctionEndAt: joinDateTime(form.auctionEndDate, form.auctionEndTime) || null,
      completedAt: joinDateTime(form.completedDate, form.completedTime) || null,
      remark: form.remark.trim(),
      published: true,
      sortOrder: 0,
    }
  }

  function validate(): string | null {
    if (!form.title.trim()) return '请填写地块/项目名称'
    if (!form.districtRegionId || form.districtRegionId <= 0) return '请选择所属区域'
    if (form.auctionStatus === 'auctioning') {
      const rangeErr = assertEndAfterStart(
        joinDateTime(form.auctionStartDate, form.auctionStartTime),
        joinDateTime(form.auctionEndDate, form.auctionEndTime),
      )
      if (rangeErr) return rangeErr
    }
    return null
  }

  return {
    form,
    regionDefs,
    regionNames,
    statusLabels,
    loadRegions,
    fillFromDetail,
    onRegionPick,
    onStatusPick,
    buildPayload,
    validate,
  }
}
