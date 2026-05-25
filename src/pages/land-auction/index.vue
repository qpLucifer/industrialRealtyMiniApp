<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchLandAuctionList, fetchLandAuctionSummary } from '@/api/landAuction'
import { usePagedList } from '@/utils/pagedList'
import { fetchRegionDefs } from '@/utils/request'
import type { LandAuctionStats, LandAuctionStatus } from '@/types/landAuction'
import { tabBrandTitle } from '@/constants/brand'

const topBarInsetStyle = useTopBarInsetStyle()

const SEGS: { key: LandAuctionStatus; label: string }[] = [
  { key: 'upcoming', label: '即将挂拍' },
  { key: 'auctioning', label: '正在拍卖' },
  { key: 'completed', label: '已成交' },
]

const stats = ref<LandAuctionStats>({ upcoming: 0, auctioning: 0, completed: 0, total: 0 })
const seg = ref(0)
const regionDefs = ref<{ id: number; name: string }[]>([])
const regionFilterId = ref<number | null>(null)

const status = computed(() => SEGS[seg.value]?.key ?? 'upcoming')

const regionQueryParam = computed(() =>
  regionFilterId.value != null && regionFilterId.value > 0 ? regionFilterId.value : null,
)

const {
  items: list,
  loading,
  loadingMore,
  hasMore,
  loadFirst,
  loadMore,
} = usePagedList((page) =>
  fetchLandAuctionList({
    status: status.value,
    page,
    districtRegionId: regionQueryParam.value,
  }),
)

async function loadRegionDefs() {
  try {
    const { list: rows } = await fetchRegionDefs()
    regionDefs.value = (rows ?? [])
      .map((r) => {
        const id = Number((r as { id?: number }).id)
        const name = String((r as { name?: string }).name || '').trim()
        return Number.isFinite(id) && name ? { id, name } : null
      })
      .filter(Boolean) as { id: number; name: string }[]
  } catch {
    regionDefs.value = []
  }
}

async function loadSummary() {
  try {
    const r = await fetchLandAuctionSummary({ districtRegionId: regionQueryParam.value })
    if (r?.stats) stats.value = r.stats
  } catch {
    /* keep previous stats */
  }
}

async function reload() {
  try {
    await Promise.all([loadSummary(), loadFirst()])
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  }
}

useTabPageShow(() => {
  void loadRegionDefs()
  return reload()
}, { requireAuth: true })

watch(seg, () => {
  void reload()
})

watch(regionFilterId, () => {
  void reload()
})

function statusTone(key: LandAuctionStatus) {
  if (key === 'auctioning') return 'amber'
  if (key === 'completed') return 'mint'
  return 'slate'
}

function pickSeg(i: number) {
  seg.value = i
}

function pickRegion(id: number | null) {
  regionFilterId.value = id
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">{{ tabBrandTitle('工业土地') }}</view>
        </view>
      </view>

      <scroll-view v-if="regionDefs.length" scroll-x class="land-region-scroll" :show-scrollbar="false">
        <view class="land-region-row">
          <text
            class="land-region-chip"
            :class="{ 'land-region-chip--on': regionFilterId == null }"
            @tap="pickRegion(null)"
          >全部区域</text>
          <text
            v-for="r in regionDefs"
            :key="r.id"
            class="land-region-chip"
            :class="{ 'land-region-chip--on': regionFilterId === r.id }"
            @tap="pickRegion(r.id)"
          >{{ r.name }}</text>
        </view>
      </scroll-view>

      <view class="land-stats">
        <view
          v-for="(s, i) in SEGS"
          :key="s.key"
          class="land-stat"
          :class="{ 'land-stat--on': seg === i }"
          @tap="pickSeg(i)"
        >
          <text class="land-stat__num">{{ stats[s.key] }}</text>
          <text class="land-stat__label">{{ s.label }}</text>
        </view>
      </view>

      <PagedVirtualList
        class="page-scroll land-scroll"
        inner-class="land-page"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        empty-text="暂无数据"
        @load-more="loadMore"
      >
        <template #empty>
          <view class="land-empty">
            <text class="land-empty__title">暂无{{ SEGS[seg]?.label }}记录</text>
            <text class="hint">仅展示您负责区域内的数据</text>
          </view>
        </template>
        <template #item="{ item: row }">
          <view class="land-card">
            <view class="land-card__head">
              <text class="land-card__title">{{ row.title }}</text>
              <text class="land-card__tag" :class="`land-card__tag--${statusTone(row.auctionStatus)}`">
                {{ SEGS.find((x) => x.key === row.auctionStatus)?.label }}
              </text>
            </view>
            <text v-if="row.metaLine" class="land-card__meta">{{ row.metaLine }}</text>
            <text v-if="row.timeLine" class="land-card__time">{{ row.timeLine }}</text>
          </view>
        </template>
      </PagedVirtualList>
    </view>
  </view>
</template>

<style scoped>
.land-region-scroll {
  flex-shrink: 0;
  white-space: nowrap;
  margin-bottom: 12rpx;
}

.land-region-row {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 28rpx 8rpx;
}

.land-region-chip {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #64748b;
  background: #fff;
  border: 2rpx solid #e2e8f0;
}

.land-region-chip--on {
  color: var(--brand, #1a3a6c);
  background: rgba(26, 58, 108, 0.08);
  border-color: rgba(26, 58, 108, 0.25);
  font-weight: 600;
}

.land-stats {
  display: flex;
  gap: 16rpx;
  padding: 0 28rpx 20rpx;
  flex-shrink: 0;
}

.land-stat {
  flex: 1;
  padding: 24rpx 16rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(15, 23, 42, 0.06);
  text-align: center;
  border: 2rpx solid transparent;
}

.land-stat--on {
  border-color: rgba(26, 58, 108, 0.35);
  background: rgba(26, 58, 108, 0.06);
}

.land-stat__num {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: var(--brand, #1a3a6c);
  line-height: 1.1;
}

.land-stat__label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--muted, #64748b);
}

.land-scroll {
  flex: 1;
  min-height: 0;
}

.land-page {
  padding: 0 28rpx 32rpx;
}

.land-empty {
  padding: 80rpx 32rpx;
  text-align: center;
}

.land-empty__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  margin-bottom: 12rpx;
}

.land-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(15, 23, 42, 0.06);
}

.land-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.land-card__title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
  line-height: 1.35;
}

.land-card__tag {
  flex-shrink: 0;
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.land-card__tag--slate {
  background: #f1f5f9;
  color: #475569;
}

.land-card__tag--amber {
  background: #fffbeb;
  color: #b45309;
}

.land-card__tag--mint {
  background: rgba(26, 58, 108, 0.1);
  color: var(--brand, #1a3a6c);
}

.land-card__meta {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--muted, #64748b);
  line-height: 1.45;
}

.land-card__time {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #94a3b8;
}
</style>
