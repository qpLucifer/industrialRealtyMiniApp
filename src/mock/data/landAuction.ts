import type { LandAuctionDetail, LandAuctionItem, LandAuctionStats } from '@/types/landAuction'

export const mockLandAuctionStats: LandAuctionStats = {
  upcoming: 2,
  auctioning: 1,
  completed: 1,
  total: 4,
}

/** districtRegionId 1–4 align with common demo region_defs when present */
export const mockLandAuctionDetails: LandAuctionDetail[] = [
  {
    id: 1,
    title: '余杭未来科技城工业用地 A 块',
    districtRegionId: 1,
    region: '余杭区',
    areaMu: 42.5,
    startPriceWan: 2800,
    dealPriceWan: null,
    auctionStatus: 'upcoming',
    listingDate: '2026-06-15',
    auctionStartAt: '',
    auctionEndAt: '',
    completedAt: '',
    remark: '规划工业用地，临近高速出入口',
    published: true,
    sortOrder: 30,
    updatedAt: '2026-05-20 10:00',
    canEdit: true,
  },
  {
    id: 2,
    title: '萧山经济技术开发区 B 地块',
    districtRegionId: 2,
    region: '萧山区',
    areaMu: 68,
    startPriceWan: 4500,
    dealPriceWan: null,
    auctionStatus: 'upcoming',
    listingDate: '2026-06-22',
    auctionStartAt: '',
    auctionEndAt: '',
    completedAt: '',
    remark: '',
    published: true,
    sortOrder: 20,
    updatedAt: '2026-05-20 10:00',
    canEdit: true,
  },
  {
    id: 3,
    title: '临平智造小镇 C 地块',
    districtRegionId: 3,
    region: '临平区',
    areaMu: 35.2,
    startPriceWan: 1900,
    dealPriceWan: null,
    auctionStatus: 'auctioning',
    listingDate: '',
    auctionStartAt: '2026-05-18 10:00',
    auctionEndAt: '2026-05-25 16:00',
    completedAt: '',
    remark: '',
    published: true,
    sortOrder: 10,
    updatedAt: '2026-05-20 10:00',
    canEdit: true,
  },
  {
    id: 4,
    title: '钱塘新区 D 工业用地',
    districtRegionId: 4,
    region: '钱塘区',
    areaMu: 55.8,
    startPriceWan: 3600,
    dealPriceWan: 4120,
    auctionStatus: 'completed',
    listingDate: '',
    auctionStartAt: '',
    auctionEndAt: '',
    completedAt: '2026-04-28 15:30',
    remark: '',
    published: true,
    sortOrder: 0,
    updatedAt: '2026-05-20 10:00',
    canEdit: true,
  },
]

function miniMetaLine(row: LandAuctionDetail) {
  const parts: string[] = []
  if (row.region) parts.push(row.region)
  if (row.areaMu != null) parts.push(`${row.areaMu} 亩`)
  if (row.auctionStatus === 'completed' && row.dealPriceWan != null) {
    parts.push(`成交 ${row.dealPriceWan} 万`)
  } else if (row.startPriceWan != null) {
    parts.push(`起拍 ${row.startPriceWan} 万`)
  }
  return parts.join(' · ') || '—'
}

function miniTimeLine(row: LandAuctionDetail) {
  if (row.auctionStatus === 'upcoming' && row.listingDate) return `预计挂拍 ${row.listingDate}`
  if (row.auctionStatus === 'auctioning') {
    if (row.auctionStartAt && row.auctionEndAt) return `${row.auctionStartAt} ~ ${row.auctionEndAt}`
    if (row.auctionEndAt) return `截止 ${row.auctionEndAt}`
    return '拍卖进行中'
  }
  if (row.auctionStatus === 'completed' && row.completedAt) return `成交于 ${row.completedAt}`
  return ''
}

export function landAuctionDetailToListItem(row: LandAuctionDetail): LandAuctionItem {
  return {
    id: row.id,
    title: row.title,
    metaLine: miniMetaLine(row),
    timeLine: miniTimeLine(row),
    auctionStatus: row.auctionStatus,
    districtRegionId: row.districtRegionId,
    region: row.region,
    areaMu: row.areaMu,
    startPriceWan: row.startPriceWan,
    dealPriceWan: row.dealPriceWan,
  }
}

export function mockLandAuctionListItems(): LandAuctionItem[] {
  return mockLandAuctionDetails.map(landAuctionDetailToListItem)
}

export const mockLandAuctionItems = mockLandAuctionListItems()

export function getMockLandAuctionDetail(id: number) {
  return mockLandAuctionDetails.find((r) => r.id === id) ?? null
}

export function filterMockLandAuctionScope(rows: LandAuctionDetail[], query: Record<string, string>) {
  const rid =
    query?.districtRegionId != null && String(query.districtRegionId).trim() !== ''
      ? Number(query.districtRegionId)
      : null
  const q = String(query?.q || '').trim().toLowerCase()
  let list = rows.filter((r) => r.published)
  if (rid != null && Number.isFinite(rid) && rid > 0) {
    list = list.filter((r) => r.districtRegionId === rid)
  }
  if (q) {
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        (r.remark || '').toLowerCase().includes(q),
    )
  }
  return list
}

export function filterMockLandAuctionRows(
  rows: LandAuctionDetail[],
  query: Record<string, string>,
) {
  const status = String(query?.status || 'upcoming').trim() as LandAuctionDetail['auctionStatus']
  return filterMockLandAuctionScope(rows, query).filter((r) => r.auctionStatus === status)
}

export function mockLandAuctionStatsFromRows(rows: LandAuctionDetail[]) {
  return {
    upcoming: rows.filter((r) => r.auctionStatus === 'upcoming').length,
    auctioning: rows.filter((r) => r.auctionStatus === 'auctioning').length,
    completed: rows.filter((r) => r.auctionStatus === 'completed').length,
    total: rows.length,
  }
}
