<script setup lang="ts">
import { computed, ref } from 'vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchCustomerList, type CustomerListReminderFilter } from '@/api/customer'
import { usePagedList } from '@/utils/pagedList'
import { tabBrandTitle } from '@/constants/brand'
import { consumeCustomerListStale } from '@/utils/customerNav'
import { fetchRegionDefs } from '@/utils/request'
import type { CustomerDealStatus, CustomerGrade, CustomerListItem } from '@/types/customer'
import { isBeijingDateOnOrAfterToday } from '@/utils/beijingTime'

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

const {
  items: list,
  loading,
  loadingMore,
  hasMore,
  loadFirst,
  loadMore,
} = usePagedList((page) =>
  fetchCustomerList({
    scope: seg.value === 0 ? 'mine' : 'public',
    q: keyword.value.trim() || undefined,
    districtRegionId: filterApplied.value.districtRegionId,
    grade: filterApplied.value.grade || undefined,
    dealStatus: filterApplied.value.dealStatus || undefined,
    reminder: filterApplied.value.reminder || undefined,
    page,
  }),
)
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

function customerGradeKey(c: CustomerListItem): 'a' | 'b' | 'c' | '' {
  const g = String(c.grade || '').trim()
  if (g.startsWith('A')) return 'a'
  if (g.startsWith('B')) return 'b'
  if (g.startsWith('C')) return 'c'
  return ''
}

function customerCardClass(c: CustomerListItem) {
  const key = customerGradeKey(c)
  return key ? `cust-card--grade-${key}` : 'cust-card--grade-c'
}

function gradeChipClass(c: CustomerListItem) {
  const key = customerGradeKey(c)
  if (key === 'a') return 'ok'
  if (key === 'b') return 'cust-grade--b'
  return 'cust-grade--c'
}

function avatarToneClass(c: CustomerListItem) {
  const key = customerGradeKey(c)
  if (key === 'a') return 'cust-avatar--brand'
  if (key === 'b') return 'cust-avatar--blue'
  return 'cust-avatar--slate'
}

/** Up to 2 chars for placeholder avatar (contact name preferred). */
function customerInitials(c: CustomerListItem) {
  const name = String(c.contactName || c.titleLine?.split('·')[0]?.trim() || '').trim()
  if (name) {
    const compact = name.replace(/\s+/g, '')
    if (compact.length <= 2) return compact
    return compact.slice(-2)
  }
  const company = String(c.company || '').trim()
  if (company) {
    const compact = company.replace(/\s+/g, '')
    return compact.length <= 2 ? compact : compact.slice(0, 2)
  }
  return '客'
}

function primaryName(c: CustomerListItem) {
  return String(c.contactName || c.titleLine?.split('·')[0]?.trim() || c.company || '未命名客户').trim()
}

function recentSnippet(c: CustomerListItem) {
  const t = String(c.recent || '').trim()
  if (!t) return ''
  return t.replace(/^最近[：:]\s*/, '')
}

/** List card: only show follow-up date when today or later (Beijing). */
function listNextReminderText(c: CustomerListItem) {
  const raw = String(c.nextReminderAt || c.nextReminder || '').trim()
  if (!raw || raw === '—') return ''
  if (!isBeijingDateOnOrAfterToday(raw)) return ''
  return String(c.nextReminder || '').trim()
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
  try {
    await loadFirst()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  }
}

useTabPageShow(async () => {
  consumeCustomerListStale()
  await loadRegions()
  await reload()
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
        </view>
      </view>
      <view class="list-page-head page-scroll__inner">
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
      </view>
      <PagedVirtualList
        class="page-scroll"
        inner-class="cust-list-page"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        :empty-text="hasActiveFilters ? '无匹配客户，可调整筛选' : '暂无客户'"
        @load-more="loadMore"
      >
        <template #item="{ item: c }">
          <view
            class="cust-card glass-list-card"
            :class="customerCardClass(c as CustomerListItem)"
            @click="goDetail((c as CustomerListItem).id)"
          >
            <view class="cust-avatar" :class="avatarToneClass(c as CustomerListItem)">
              <text class="cust-avatar__text">{{ customerInitials(c as CustomerListItem) }}</text>
            </view>
            <view class="cust-body">
              <view class="cust-head">
                <text class="cust-name">{{ primaryName(c as CustomerListItem) }}</text>
                <view class="chip cust-grade" :class="gradeChipClass(c as CustomerListItem)">
                  {{ (c as CustomerListItem).grade }}
                </view>
              </view>
              <text
                v-if="(c as CustomerListItem).company && (c as CustomerListItem).company !== primaryName(c as CustomerListItem)"
                class="cust-company"
              >
                {{ (c as CustomerListItem).company }}
              </text>
              <view class="cust-tags">
                <text v-if="(c as CustomerListItem).district" class="cust-tag">{{ (c as CustomerListItem).district }}</text>
                <text class="cust-tag">{{ (c as CustomerListItem).dealStatus }}</text>
                <text v-if="(c as CustomerListItem).ownerName" class="cust-tag cust-tag--muted">
                  {{ (c as CustomerListItem).ownerName }}
                </text>
              </view>
              <view class="cust-foot">
                <text class="cust-foot__recent">
                  {{ recentSnippet(c as CustomerListItem) || '暂无最近跟进' }}
                </text>
                <text v-if="listNextReminderText(c as CustomerListItem)" class="cust-foot__remind">
                  {{ listNextReminderText(c as CustomerListItem) }}
                </text>
              </view>
            </view>
          </view>
        </template>
      </PagedVirtualList>
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

.list-page-head {
  flex-shrink: 0;
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

.cust-list-page {
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.cust-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cust-avatar--brand {
  background: linear-gradient(145deg, #1a3a6c, #2d4f8c);
  box-shadow: 0 6rpx 16rpx rgba(26, 58, 108, 0.28);
}

.cust-avatar--blue {
  background: linear-gradient(145deg, #0284c7, #38bdf8);
  box-shadow: 0 6rpx 16rpx rgba(14, 165, 233, 0.25);
}

.cust-avatar--slate {
  background: linear-gradient(145deg, #64748b, #94a3b8);
  box-shadow: 0 6rpx 16rpx rgba(71, 85, 105, 0.2);
}

.chip.cust-grade--b {
  background: rgba(14, 165, 233, 0.14);
  color: #0369a1;
  border-color: rgba(14, 165, 233, 0.38);
}

.chip.cust-grade--c {
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
  border-color: rgba(100, 116, 139, 0.35);
}

.cust-avatar__text {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.04em;
  line-height: 1;
}

.cust-body {
  flex: 1;
  min-width: 0;
}

.cust-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.cust-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cust-grade {
  flex-shrink: 0;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
}

.cust-company {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: var(--muted, #64748b);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cust-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
  margin-top: 12rpx;
}

.cust-tag {
  font-size: 22rpx;
  line-height: 1.3;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(26, 58, 108, 0.06);
  color: var(--navy, #1a3a6c);
}

.cust-tag--muted {
  background: #f1f5f9;
  color: #64748b;
}

.cust-foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.65);
}

.cust-foot__recent {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  color: var(--muted, #64748b);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.cust-foot__remind {
  flex-shrink: 0;
  max-width: 42%;
  font-size: 22rpx;
  font-weight: 600;
  color: #b45309;
  line-height: 1.35;
  text-align: right;
}
</style>
