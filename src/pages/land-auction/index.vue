<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchLandAuctionList, fetchLandAuctionSummary } from '@/api/landAuction'
import { usePagedList } from '@/utils/pagedList'
import { fetchRegionDefs } from '@/utils/request'
import { consumeLandAuctionListStale } from '@/utils/landAuctionNav'
import type { LandAuctionItem, LandAuctionStats, LandAuctionStatus } from '@/types/landAuction'
import { tabBrandTitle } from '@/constants/brand'

const topBarInsetStyle = useTopBarInsetStyle()

const SEGS: { key: LandAuctionStatus; label: string }[] = [
  { key: 'upcoming', label: '即将挂拍' },
  { key: 'auctioning', label: '正在拍卖' },
  { key: 'completed', label: '已成交' },
]

const stats = ref<LandAuctionStats>({ upcoming: 0, auctioning: 0, completed: 0, total: 0 })
const seg = ref(0)
const keyword = ref('')
const filterOpen = ref(false)
const regionDefs = ref<{ id: number; name: string }[]>([])
const regionNames = computed(() => ['全部区域', ...regionDefs.value.map((r) => r.name)])

const filterDraft = reactive({ regionIdx: 0 })
const filterApplied = reactive({ districtRegionId: null as number | null })

const status = computed(() => SEGS[seg.value]?.key ?? 'upcoming')

const hasActiveFilters = computed(() => filterApplied.districtRegionId != null)

const filterSummary = computed(() => {
  if (filterApplied.districtRegionId == null) return ''
  const name = regionDefs.value.find((r) => r.id === filterApplied.districtRegionId)?.name
  return name ? `区域：${name}` : '区域已选'
})

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
    q: keyword.value.trim() || undefined,
    districtRegionId: filterApplied.districtRegionId,
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
    const r = await fetchLandAuctionSummary({
      districtRegionId: filterApplied.districtRegionId,
    })
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
  consumeLandAuctionListStale()
  void loadRegionDefs()
  return reload()
}, { requireAuth: true })

watch(seg, () => {
  void reload()
})

function syncFilterDraftFromApplied() {
  filterDraft.regionIdx = 0
  if (filterApplied.districtRegionId != null) {
    const i = regionDefs.value.findIndex((r) => r.id === filterApplied.districtRegionId)
    filterDraft.regionIdx = i >= 0 ? i + 1 : 0
  }
}

function openFilter() {
  syncFilterDraftFromApplied()
  filterOpen.value = true
}

function onFilterRegionPick(e: { detail: { value: string | number } }) {
  filterDraft.regionIdx = Number(e.detail.value)
}

function resetFilter() {
  filterDraft.regionIdx = 0
  filterApplied.districtRegionId = null
  filterOpen.value = false
  void reload()
}

function applyFilter() {
  if (filterDraft.regionIdx <= 0) {
    filterApplied.districtRegionId = null
  } else {
    const row = regionDefs.value[filterDraft.regionIdx - 1]
    filterApplied.districtRegionId = row?.id ?? null
  }
  filterOpen.value = false
  void reload()
}

function onSearchConfirm() {
  void reload()
}

function statusTone(key: LandAuctionStatus) {
  if (key === 'auctioning') return 'amber'
  if (key === 'completed') return 'mint'
  return 'slate'
}

function pickSeg(i: number) {
  seg.value = i
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/land-auction/detail?id=${id}` })
}

function goNew() {
  uni.navigateTo({ url: '/pages/land-auction/new' })
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

      <view class="list-page-head page-scroll__inner">
        <view class="search-bar search-bar--suffix">
          <input
            v-model="keyword"
            type="text"
            placeholder="关键词：地块名称 / 区域 / 备注…"
            confirm-type="search"
            @confirm="onSearchConfirm"
          />
          <view class="search-bar__suffix" @click="openFilter">
            <view class="ic-filter" :class="{ 'ic-filter--on': hasActiveFilters }" />
          </view>
        </view>
        <view v-if="hasActiveFilters" class="filter-active-bar">
          <text class="filter-active-bar__text">{{ filterSummary }}</text>
          <text class="filter-active-bar__clear" @click="resetFilter">清除</text>
        </view>

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
      </view>

      <PagedVirtualList
        class="page-scroll land-scroll"
        inner-class="land-page"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        :empty-text="hasActiveFilters || keyword ? '无匹配记录，可调整筛选' : '暂无数据，点击右下角新增'"
        @load-more="loadMore"
      >
        <template #empty>
          <view class="land-empty">
            <text class="land-empty__title">暂无{{ SEGS[seg]?.label }}记录</text>
            <text class="hint">仅展示您负责区域内的数据</text>
          </view>
        </template>
        <template #item="{ item: row }">
          <view class="land-card" @tap="goDetail((row as LandAuctionItem).id)">
            <view class="land-card__head">
              <text class="land-card__title">{{ (row as LandAuctionItem).title }}</text>
              <text
                class="land-card__tag"
                :class="`land-card__tag--${statusTone((row as LandAuctionItem).auctionStatus)}`"
              >
                {{ SEGS.find((x) => x.key === (row as LandAuctionItem).auctionStatus)?.label }}
              </text>
            </view>
            <text v-if="(row as LandAuctionItem).metaLine" class="land-card__meta">{{
              (row as LandAuctionItem).metaLine
            }}</text>
            <text v-if="(row as LandAuctionItem).timeLine" class="land-card__time">{{
              (row as LandAuctionItem).timeLine
            }}</text>
          </view>
        </template>
      </PagedVirtualList>

      <button class="fab fab--tab" @click="goNew">＋</button>
    </view>

    <view v-if="filterOpen" class="modal-overlay show" @click.self="filterOpen = false">
      <view class="modal-sheet" @click.stop>
        <view class="tb-title" style="margin-bottom: 12px">土地筛选</view>
        <view class="section-title">所属区域</view>
        <view class="form-group">
          <picker mode="selector" :range="regionNames" :value="filterDraft.regionIdx" @change="onFilterRegionPick">
            <view class="picker-like">{{ regionNames[filterDraft.regionIdx] || '全部区域' }}</view>
          </picker>
        </view>
        <view class="filter-sheet-actions">
          <button class="btn-secondary" @click="resetFilter">重置</button>
          <button class="btn-primary" @click="applyFilter">应用筛选</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tb-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
}

.list-page-head {
  flex-shrink: 0;
}

.ic-filter {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M4 6h16M7 12h10M10 18h4'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.ic-filter--on {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a6c' stroke-width='2.5'%3E%3Cpath d='M4 6h16M7 12h10M10 18h4'/%3E%3C/svg%3E");
}

.filter-active-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  background: rgba(26, 58, 108, 0.06);
}

.filter-active-bar__text {
  font-size: 24rpx;
  color: var(--navy);
}

.filter-active-bar__clear {
  font-size: 24rpx;
  color: var(--mint);
}

.filter-sheet-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.filter-sheet-actions .btn-secondary,
.filter-sheet-actions .btn-primary {
  flex: 1;
}

.picker-like {
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 1px solid var(--border);
}

.land-stats {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0 0;
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
