import type { LandAuctionItem, LandAuctionStats } from '@/types/landAuction'

export const mockLandAuctionStats: LandAuctionStats = {
  upcoming: 2,
  auctioning: 1,
  completed: 1,
  total: 4,
}

/** districtRegionId 1–4 align with common demo region_defs when present */
export const mockLandAuctionItems: LandAuctionItem[] = [
  {
    id: 1,
    title: '余杭未来科技城工业用地 A 块',
    metaLine: '余杭区 · 42.5 亩 · 起拍 2800 万',
    timeLine: '预计挂拍 2026-06-15',
    auctionStatus: 'upcoming',
    districtRegionId: 1,
    region: '余杭区',
    areaMu: 42.5,
    startPriceWan: 2800,
    dealPriceWan: null,
  },
  {
    id: 2,
    title: '萧山经济技术开发区 B 地块',
    metaLine: '萧山区 · 68 亩 · 起拍 4500 万',
    timeLine: '预计挂拍 2026-06-22',
    auctionStatus: 'upcoming',
    districtRegionId: 2,
    region: '萧山区',
    areaMu: 68,
    startPriceWan: 4500,
    dealPriceWan: null,
  },
  {
    id: 3,
    title: '临平智造小镇 C 地块',
    metaLine: '临平区 · 35.2 亩 · 起拍 1900 万',
    timeLine: '2026-05-18 10:00 ~ 2026-05-25 16:00',
    auctionStatus: 'auctioning',
    districtRegionId: 3,
    region: '临平区',
    areaMu: 35.2,
    startPriceWan: 1900,
    dealPriceWan: null,
  },
  {
    id: 4,
    title: '钱塘新区 D 工业用地',
    metaLine: '钱塘区 · 55.8 亩 · 成交 4120 万',
    timeLine: '成交于 2026-04-28 15:30',
    auctionStatus: 'completed',
    districtRegionId: 4,
    region: '钱塘区',
    areaMu: 55.8,
    startPriceWan: 3600,
    dealPriceWan: 4120,
  },
]
