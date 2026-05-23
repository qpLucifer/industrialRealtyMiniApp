<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchCustomerList, type CustomerListReminderFilter } from '@/api/customer'
import { tabBrandTitle } from '@/constants/brand'
import { consumeCustomerListStale } from '@/utils/customerNav'
import { fetchRegionDefs } from '@/utils/request'
import type { CustomerDealStatus, CustomerGrade, CustomerListItem } from '@/types/customer'

const GRADE_CHIPS: { value: '' | CustomerGrade; label: string; chipClass: string }[] = [
  { value: '', label: '全部', chipClass: '' },
  { value: 'A 类', label: 'A 类', chipClass: 'grade-a' },
  { value: 'B 类', label: 'B 类', chipClass: 'grade-b' },
  { value: 'C 类', label: 'C 类', chipClass: 'grade-c' },
]
const DEAL_CHIPS: { value: CustomerDealStatus; label: string }[] = [
  { value: '洽谈中', label: '洽谈' },
  { value: '已成交', label: '已成交' },
]
const REMINDER_OPTIONS = ['全部提醒', '有待提醒', '已到期', '近7天待跟'] as const
const REMINDER_VALUES: ('' | CustomerListReminderFilter)[] = ['', 'due', 'overdue', 'week']

const topBarInsetStyle = useTopBarInsetStyle()

const list = ref<CustomerListItem[]>([])
const loading = ref(false)
const seg = ref(0)
const keyword = ref('')
const filterOpen = ref(false)
const regionDefs = ref<{ id: number; name: string }[]>([])
const regionNames = computed(() => ['全部区域', ...regionDefs.value.map((r) => r.name)])

const filterDraft = ref({ regionIdx: 0, reminderIdx: 0 })
const filterApplied = ref({
  districtRegionId: null as number | null,
  grade: '' as '' | CustomerGrade,
  dealStatus: '' as '' | CustomerDealStatus,
  reminder: '' as '' | CustomerListReminderFilter,
})

const hasActiveFilters = computed(
  () =>
    filterApplied.value.districtRegionId != null ||
    !!filterApplied.value.grade ||
    !!filterApplied.value.dealStatus ||
    !!filterApplied.value.reminder,
)

const hasModalFilters = computed(
  () => filterApplied.value.districtRegionId != null || !!filterApplied.value.reminder,
)

const filterSummary = computed(() => {
  const parts: string[] = []
  if (filterApplied.value.districtRegionId != null) {
    const name = regionDefs.value.find((r) => r.id === filterApplied.value.districtRegionId)?.name
    parts.push(name ? `区域：${name}` : '区域已选')
  }
  if (filterApplied.value.grade) parts.push(filterApplied.value.grade)
  if (filterApplied.value.dealStatus) {
    const dealLabel = DEAL_CHIPS.find((d) => d.value === filterApplied.value.dealStatus)?.label
    parts.push(dealLabel || filterApplied.value.dealStatus)
  }
  if (filterApplied.value.reminder === 'due') parts.push('有待提醒')
  else if (filterApplied.value.reminder === 'overdue') parts.push('已到期')
  else if (filterApplied.value.reminder === 'week') parts.push('近7天待跟')
  return parts.join(' · ')
})

function gradeChipClass(c: CustomerListItem) {
  if (c.grade.startsWith('A') || c.gradeTone === 'ok') return 'ok'
  return ''
}

function avatarStyle(c: CustomerListItem) {
  const mint = gradeChipClass(c) === 'ok'
  return {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    flexShrink: 0,
    background: mint
      ? 'linear-gradient(135deg,#1a3a6c,#2d4f8c)'
      : 'linear-gradient(135deg,#64748b,#94a3b8)',
  }
}

async function loadRegions() {
  try {
    const { list: rows } = await fetchRegionDefs()
    regionDefs.value = rows ?? []
  } catch {
    regionDefs.value = []
  }
}

async function reload() {
  loading.value = true
  try {
    const scope = seg.value === 0 ? 'mine' : 'public'
    const r = await fetchCustomerList({
      scope,
      q: keyword.value.trim() || undefined,
      districtRegionId: filterApplied.value.districtRegionId,
      grade: filterApplied.value.grade || undefined,
      dealStatus: filterApplied.value.dealStatus || undefined,
      reminder: filterApplied.value.reminder || undefined,
    })
    list.value = r.list
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

useTabPageShow(() => {
  if (consumeCustomerListStale()) {
    /* explicit stale after create/edit */
  }
  void loadRegions().then(() => reload())
  return reload()
}, { requireAuth: true })

function onSeg(i: number) {
  seg.value = i
  void reload()
}

function onGradeChip(value: '' | CustomerGrade) {
  filterApplied.value.grade = filterApplied.value.grade === value ? '' : value
  void reload()
}

function onDealChip(value: CustomerDealStatus) {
  filterApplied.value.dealStatus = filterApplied.value.dealStatus === value ? '' : value
  void reload()
}

function syncFilterDraftFromApplied() {
  filterDraft.value.regionIdx = 0
  if (filterApplied.value.districtRegionId != null) {
    const i = regionDefs.value.findIndex((r) => r.id === filterApplied.value.districtRegionId)
    filterDraft.value.regionIdx = i >= 0 ? i + 1 : 0
  }
  const ri = REMINDER_VALUES.indexOf(filterApplied.value.reminder)
  filterDraft.value.reminderIdx = ri >= 0 ? ri : 0
}

function openFilter() {
  syncFilterDraftFromApplied()
  filterOpen.value = true
}

function onFilterRegionPick(e: { detail: { value: string | number } }) {
  filterDraft.value.regionIdx = Number(e.detail.value)
}

function onFilterReminderPick(e: { detail: { value: string | number } }) {
  filterDraft.value.reminderIdx = Number(e.detail.value)
}

function resetFilter() {
  filterDraft.value = { regionIdx: 0, reminderIdx: 0 }
  filterApplied.value = { districtRegionId: null, grade: '', dealStatus: '', reminder: '' }
  filterOpen.value = false
  void reload()
}

function resetModalFilters() {
  filterApplied.value.districtRegionId = null
  filterApplied.value.reminder = ''
  filterDraft.value = { regionIdx: 0, reminderIdx: 0 }
  filterOpen.value = false
  void reload()
}

function applyFilter() {
  if (filterDraft.value.regionIdx <= 0) {
    filterApplied.value.districtRegionId = null
  } else {
    const row = regionDefs.value[filterDraft.value.regionIdx - 1]
    filterApplied.value.districtRegionId = row?.id ?? null
  }
  filterApplied.value.reminder = REMINDER_VALUES[filterDraft.value.reminderIdx] ?? ''
  filterOpen.value = false
  void reload()
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/customer/detail?id=${encodeURIComponent(id)}` })
}

function goNew() {
  uni.navigateTo({ url: '/pages/customer/new' })
}

function goVideoFaq() {
  uni.navigateTo({ url: '/pages/video-faq/index' })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">{{ tabBrandTitle('客户池') }}</view>
          <view class="sub">点选等级与状态 · 筛选里可选区域与提醒</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="segmented">
            <button class="seg-btn" :class="{ active: seg === 0 }" @click="onSeg(0)">我的私有</button>
            <button class="seg-btn" :class="{ active: seg === 1 }" @click="onSeg(1)">公司公有</button>
          </view>
          <view class="chip-row cust-quick-chips">
            <text
              v-for="g in GRADE_CHIPS"
              :key="'g-' + (g.value || 'all')"
              class="chip"
              :class="[g.chipClass, { on: filterApplied.grade === g.value }]"
              @tap="onGradeChip(g.value)"
            >
              {{ g.label }}
            </text>
            <text
              v-for="d in DEAL_CHIPS"
              :key="'d-' + d.value"
              class="chip"
              :class="{ on: filterApplied.dealStatus === d.value }"
              @tap="onDealChip(d.value)"
            >
              {{ d.label }}
            </text>
          </view>
          <view class="search-bar search-bar--suffix">
            <input
              v-model="keyword"
              type="text"
              placeholder="公司 / 手机尾号 / 姓名…"
              confirm-type="search"
              @confirm="reload"
            />
            <view class="search-bar__suffix" @click="openFilter">
              <view class="ic-filter" :class="{ 'ic-filter--on': hasModalFilters }" />
            </view>
          </view>
          <view v-if="hasActiveFilters" class="filter-active-bar">
            <text class="filter-active-bar__text">{{ filterSummary }}</text>
            <text class="filter-active-bar__clear" @click="resetFilter">清除</text>
          </view>
          <view v-if="loading && !list.length" class="card">
            <text class="hint">加载中…</text>
          </view>
          <view v-else-if="!list.length" class="card">
            <text class="hint">{{ hasActiveFilters ? '无匹配客户，可调整筛选' : '暂无客户' }}</text>
          </view>
          <view
            v-for="c in list"
            :key="c.id"
            class="prop-list-card"
            style="align-items: flex-start"
            @click="goDetail(c.id)"
          >
            <view :style="avatarStyle(c)" />
            <view style="flex: 1; min-width: 0">
              <view style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px">
                <view style="min-width: 0; flex: 1">
                  <view class="list-meta-muted">{{ c.company }}</view>
                  <view class="list-title-strong" style="display: block; margin-top: 2px">
                    {{ c.contactName || c.titleLine }}
                  </view>
                </view>
                <view
                  class="chip"
                  :class="gradeChipClass(c)"
                  :style="
                    gradeChipClass(c)
                      ? ''
                      : 'background:#f1f5f9;color:#475569;border-color:var(--border);flex-shrink:0'
                  "
                >
                  {{ c.grade }}
                </view>
              </view>
              <view v-if="c.district" class="list-meta-muted" style="margin-top: 4px">{{ c.district }}</view>
              <view class="list-meta-muted" style="margin-top: 6px">
                {{ c.dealStatus }}
                <text v-if="c.ownerName"> · {{ c.ownerName }}</text>
              </view>
              <view class="list-meta-muted" style="margin-top: 4px">{{ c.recent ? c.recent : '暂无最近跟进' }}</view>
              <view
                v-if="c.nextReminder && c.nextReminder !== '—'"
                style="font-size: 11px; color: var(--amber); margin-top: 6px; line-height: 1.45"
              >
                下次沟通 {{ c.nextReminder }}
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="fab-col">
        <view
          class="fab fab--view"
          style="background: linear-gradient(145deg, #2d4f8c, #1a3a6c); box-shadow: 0 14px 36px rgba(26, 58, 108, 0.35)"
          @tap="goNew"
        >
          <text>＋</text>
        </view>
        <view class="fab-sub" @tap="goVideoFaq">
          <view class="ic-video-faq" />
        </view>
      </view>
    </view>

    <view v-if="filterOpen" class="modal-overlay show" @click.self="filterOpen = false">
      <view class="modal-sheet" @click.stop>
        <view class="tb-title" style="margin-bottom: 12px">客户筛选</view>
        <view class="section-title">所属区域</view>
        <view class="form-group">
          <picker mode="selector" :range="regionNames" :value="filterDraft.regionIdx" @change="onFilterRegionPick">
            <view class="picker-like">{{ regionNames[filterDraft.regionIdx] || '全部区域' }}</view>
          </picker>
        </view>
        <view class="section-title">下次提醒</view>
        <view class="form-group">
          <picker
            mode="selector"
            :range="REMINDER_OPTIONS"
            :value="filterDraft.reminderIdx"
            @change="onFilterReminderPick"
          >
            <view class="picker-like">{{ REMINDER_OPTIONS[filterDraft.reminderIdx] }}</view>
          </picker>
        </view>
        <view class="filter-sheet-actions">
          <button class="btn-secondary" @click="resetModalFilters">重置</button>
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
  letter-spacing: 0.04em;
}

.cust-quick-chips {
  margin-bottom: 16rpx;
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

.ic-video-faq {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a6c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='5' width='14' height='14' rx='2'/%3E%3Cpath d='M16 10l6-3v10l-6-3V10z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}
</style>
