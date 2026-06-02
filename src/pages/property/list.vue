<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import {
  fetchPropertyList,
  navigateToPropertyDetail,
  navigateToPropertyPublish,
  propertyNavKey,
  type PropertyListQuery,
} from '@/api/property'
import type { PropertyListItem } from '@/types/property'
import { fetchRegionDefs, resolveMediaUrl } from '@/utils/request'
import { consumeListStale } from '@/utils/listStale'
import { tabBrandTitle } from '@/constants/brand'
import { consumeTabNavIntent } from '@/utils/tabNavIntent'
import { usePagedList } from '@/utils/pagedList'

const topBarInsetStyle = useTopBarInsetStyle()
const {
  items: list,
  loading,
  loadingMore,
  hasMore,
  loadFirst,
  loadMore,
} = usePagedList((page) => fetchPropertyList({ ...buildListQuery(), page }))
const filterOpen = ref(false)
const seg = ref(0)
const keyword = ref('')
const segStatus = ['', '草稿', '待开发', '待租', '待售', '待租售']

const regionDefs = ref<{ id: number; name: string }[]>([])
const regionNames = computed(() => ['全部区域', ...regionDefs.value.map((r) => r.name)])

const filterDraft = reactive({
  regionIdx: 0,
  minArea: '',
  maxArea: '',
})

const filterApplied = reactive({
  districtRegionId: null as number | null,
  minArea: '',
  maxArea: '',
})

const listAvailableOnly = ref(false)

const hasActiveFilters = computed(
  () =>
    listAvailableOnly.value ||
    filterApplied.districtRegionId != null ||
    String(filterApplied.minArea).trim() !== '' ||
    String(filterApplied.maxArea).trim() !== '',
)

const filterSummary = computed(() => {
  const parts: string[] = []
  if (listAvailableOnly.value) parts.push('可租/可售')
  if (filterApplied.districtRegionId != null) {
    const name = regionDefs.value.find((r) => r.id === filterApplied.districtRegionId)?.name
    if (name) parts.push(name)
  }
  const min = String(filterApplied.minArea).trim()
  const max = String(filterApplied.maxArea).trim()
  if (min || max) {
    parts.push(`面积 ${min || '0'}–${max || '∞'}㎡`)
  }
  return parts.join(' · ')
})

function buildListQuery(): PropertyListQuery {
  const status = listAvailableOnly.value ? '' : segStatus[seg.value] || ''
  const q: PropertyListQuery = {
    q: keyword.value.trim() || undefined,
    status: status || undefined,
    available: listAvailableOnly.value || undefined,
  }
  if (filterApplied.districtRegionId != null) {
    q.districtRegionId = filterApplied.districtRegionId
  }
  const min = Number(filterApplied.minArea)
  const max = Number(filterApplied.maxArea)
  if (String(filterApplied.minArea).trim() && Number.isFinite(min)) q.minArea = min
  if (String(filterApplied.maxArea).trim() && Number.isFinite(max)) q.maxArea = max
  return q
}

async function reload() {
  try {
    await loadFirst()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  }
}

async function loadRegionDefs() {
  try {
    const regions = await fetchRegionDefs()
    regionDefs.value = (regions.list ?? [])
      .map((r) => {
        const row = r as { id?: number | string; name?: string; label?: string }
        const id = Number(row.id)
        const name = String(row.name || row.label || '').trim()
        return Number.isFinite(id) && name ? { id, name } : null
      })
      .filter(Boolean) as { id: number; name: string }[]
  } catch {
    regionDefs.value = []
  }
}

onMounted(() => {
  applyTabNavIntent()
  void loadRegionDefs()
})

function applyTabNavIntent() {
  const intent = consumeTabNavIntent()
  if (!intent || intent.kind !== 'property') return
  if (intent.available) {
    listAvailableOnly.value = true
    seg.value = 0
  }
}

useTabPageShow(() => {
  applyTabNavIntent()
  if (consumeListStale('property-list')) {
    /* refresh after publish / edit */
  }
  return reload()
}, { requireAuth: true })

function onSeg(i: number) {
  seg.value = i
  reload()
}

function onSearchConfirm() {
  reload()
}

function onPropertyRow(p: PropertyListItem) {
  navigateToPropertyDetail(propertyNavKey(p))
}

function goPublish(clear?: boolean, editKey?: string) {
  navigateToPropertyPublish(editKey, { clear })
}

function openFilter() {
  filterDraft.regionIdx = 0
  if (filterApplied.districtRegionId != null) {
    const i = regionDefs.value.findIndex((r) => r.id === filterApplied.districtRegionId)
    filterDraft.regionIdx = i >= 0 ? i + 1 : 0
  }
  filterDraft.minArea = filterApplied.minArea
  filterDraft.maxArea = filterApplied.maxArea
  filterOpen.value = true
}

function onFilterRegionPick(e: { detail: { value: string | number } }) {
  filterDraft.regionIdx = Number(e.detail.value)
}

function resetFilter() {
  filterDraft.regionIdx = 0
  filterDraft.minArea = ''
  filterDraft.maxArea = ''
  filterApplied.districtRegionId = null
  filterApplied.minArea = ''
  filterApplied.maxArea = ''
  listAvailableOnly.value = false
  filterOpen.value = false
  reload()
}

function applyFilter() {
  if (filterDraft.regionIdx <= 0) {
    filterApplied.districtRegionId = null
  } else {
    const row = regionDefs.value[filterDraft.regionIdx - 1]
    filterApplied.districtRegionId = row?.id ?? null
  }
  filterApplied.minArea = String(filterDraft.minArea || '').trim()
  filterApplied.maxArea = String(filterDraft.maxArea || '').trim()
  filterOpen.value = false
  reload()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">{{ tabBrandTitle('房源库') }}</view>
        </view>
      </view>
      <view class="list-page-head page-scroll__inner">
        <view class="search-bar search-bar--suffix">
          <input v-model="keyword" type="text" placeholder="关键词：区位 / 配电 / 行车 / 行业…" confirm-type="search" @confirm="onSearchConfirm" />
          <view class="search-bar__suffix" @click="openFilter">
            <view class="ic-filter" :class="{ 'ic-filter--on': hasActiveFilters }" />
          </view>
        </view>
        <view v-if="hasActiveFilters" class="filter-active-bar">
          <text class="filter-active-bar__text">{{ filterSummary }}</text>
          <text class="filter-active-bar__clear" @click="resetFilter">清除</text>
        </view>
        <view class="segmented">
          <button class="seg-btn" :class="{ active: seg === 0 }" @click="onSeg(0)">全部</button>
          <button class="seg-btn" :class="{ active: seg === 1 }" @click="onSeg(1)">草稿</button>
          <button class="seg-btn" :class="{ active: seg === 2 }" @click="onSeg(2)">待开发</button>
          <button class="seg-btn" :class="{ active: seg === 3 }" @click="onSeg(3)">待租</button>
          <button class="seg-btn" :class="{ active: seg === 4 }" @click="onSeg(4)">待售</button>
          <button class="seg-btn" :class="{ active: seg === 5 }" @click="onSeg(5)">待租售</button>
        </view>
      </view>
      <PagedVirtualList
        class="page-scroll"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        :empty-text="hasActiveFilters ? '无匹配房源，可调整筛选' : '暂无房源，点击右下角发布'"
        @load-more="loadMore"
      >
        <template #item="{ item: p }">
          <view
            class="prop-list-card glass-list-card"
            :class="{ 'prop-list-card--featured': (p as PropertyListItem).featured }"
            @click="onPropertyRow(p as PropertyListItem)"
          >
            <image
              v-if="(p as PropertyListItem).thumbUrl"
              class="thumb thumb--cover"
              :src="resolveMediaUrl((p as PropertyListItem).thumbUrl!)"
              mode="aspectFill"
            />
            <view v-else class="thumb" />
            <view style="flex: 1; min-width: 0">
              <view style="display: flex; justify-content: space-between; gap: 8px; align-items: center">
                <view class="list-title-strong" style="flex: 1; min-width: 0">{{ (p as PropertyListItem).title }}</view>
                <view class="prop-list-card__chips">
                  <view
                    v-if="(p as PropertyListItem).featured"
                    class="chip featured"
                    style="flex-shrink: 0"
                    >主推</view
                  >
                  <view
                    class="chip"
                    :class="
                      (p as PropertyListItem).statusTone === 'ok'
                        ? 'ok'
                        : (p as PropertyListItem).statusTone === 'warn'
                          ? 'warn'
                          : ''
                    "
                    :style="
                      (p as PropertyListItem).statusTone === 'draft'
                        ? 'background:#e2e8f0;color:#475569;border-color:rgba(100,116,139,0.25);flex-shrink:0'
                        : 'flex-shrink:0'
                    "
                    >{{ (p as PropertyListItem).status }}</view
                  >
                </view>
              </view>
              <view class="list-meta-muted" style="margin-top: 6px">{{ (p as PropertyListItem).metaLine }}</view>
              <view
                v-if="(p as PropertyListItem).draftHint"
                style="font-size: 12px; color: var(--amber); margin-top: 4px; line-height: 1.45"
                >{{ (p as PropertyListItem).draftHint }}</view
              >
              <view v-if="(p as PropertyListItem).priceLine" class="list-price-line" style="margin-top: 8px">{{
                (p as PropertyListItem).priceLine
              }}</view>
            </view>
          </view>
        </template>
      </PagedVirtualList>
      <button class="fab fab--tab" @click="goPublish(true)">＋</button>
    </view>

    <view v-if="filterOpen" class="modal-overlay show" @click.self="filterOpen = false">
      <view class="modal-sheet" @click.stop>
        <view class="tb-title" style="margin-bottom: 12px">高级筛选</view>
        <view class="section-title">行政区域</view>
        <view class="form-group">
          <picker mode="selector" :range="regionNames" :value="filterDraft.regionIdx" @change="onFilterRegionPick">
            <view class="picker-like">{{ regionNames[filterDraft.regionIdx] || '全部区域' }}</view>
          </picker>
        </view>
        <view class="section-title">建筑面积（㎡）</view>
        <view class="form-row-2">
          <view class="form-group">
            <text class="label">最小</text>
            <input v-model="filterDraft.minArea" type="number" placeholder="如 2000" />
          </view>
          <view class="form-group">
            <text class="label">最大</text>
            <input v-model="filterDraft.maxArea" type="number" placeholder="如 8000" />
          </view>
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
.picker-like {
  padding: 20rpx;
  border: none;
  border-radius: 20rpx;
  background: #f1f5f9;
}
.ic-filter {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}
.ic-filter--on {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a6c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z'/%3E%3C/svg%3E");
}
.filter-active-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(13, 148, 136, 0.08);
  border: 1px solid rgba(13, 148, 136, 0.2);
}
.filter-active-bar__text {
  flex: 1;
  font-size: 24rpx;
  color: var(--cyan);
}
.filter-active-bar__clear {
  font-size: 24rpx;
  color: var(--muted);
}
.filter-sheet-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}
.filter-sheet-actions .btn-secondary,
.filter-sheet-actions .btn-primary {
  flex: 1;
}
.thumb--cover {
  flex-shrink: 0;
  background: #f1f5f9;
}
.list-page-head {
  flex-shrink: 0;
}

.prop-list-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  align-items: center;
  flex-shrink: 0;
}

.prop-list-card--featured {
  border: 2rpx solid rgba(234, 88, 12, 0.45);
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.65), rgba(255, 255, 255, 0.92));
  box-shadow: 0 8rpx 28rpx rgba(234, 88, 12, 0.12);
}

.chip.featured {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: #fff;
  border-color: transparent;
}
</style>
