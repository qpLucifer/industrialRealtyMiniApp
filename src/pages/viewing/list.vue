<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import SwipeRow from '@/components/SwipeRow.vue'
import { deleteViewing, fetchViewingList } from '@/api/extra'
import { consumeListStale, markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import { consumeTabNavIntent } from '@/utils/tabNavIntent'
import { usePagedList } from '@/utils/pagedList'
import type { ViewingListItem } from '@/types/viewingDeal'

const loadError = ref('')
const skipNextShow = ref(false)
const weekOnly = ref(false)
const {
  items: list,
  loading,
  loadingMore,
  hasMore,
  loadFirst,
  loadMore,
} = usePagedList((page) => fetchViewingList({ week: weekOnly.value || undefined, page }))

function propLabel(v: ViewingListItem) {
  return String(v.propertyRef || v.miniPropCode || '—').trim()
}

function gradeClass(g: string) {
  const x = String(g || '').toUpperCase()
  if (x === 'A') return 'chip on ok'
  if (x === 'B') return 'chip warn'
  return 'chip'
}

async function load() {
  loadError.value = ''
  try {
    await loadFirst()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  }
}

onLoad(async () => {
  skipNextShow.value = true
  const intent = consumeTabNavIntent()
  if (intent?.kind === 'viewing' && intent.thisWeek) weekOnly.value = true
  await load()
})

onShow(() => {
  if (skipNextShow.value) {
    skipNextShow.value = false
    return
  }
  if (consumeListStale('viewing-list')) {
    void load()
  }
})

function goNew() {
  uni.navigateTo({ url: '/pages/viewing/new' })
}

function goEdit(v: ViewingListItem) {
  uni.navigateTo({ url: `/pages/viewing/new?id=${v.id}` })
}

async function onCancel(v: ViewingListItem) {
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '取消带看',
      content: '确定删除该带看记录？',
      confirmText: '取消带看',
      confirmColor: '#e11d48',
      success: (res) => resolve(Boolean(res.confirm)),
    })
  })
  if (!ok) return
  try {
    await deleteViewing(v.id)
    await loadFirst()
    markListStale('viewing-list')
    markWorkbenchStale()
    uni.showToast({ title: '已取消', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '操作失败', icon: 'none' })
  }
}

function onRowAction(key: string, v: ViewingListItem) {
  if (key === 'edit') goEdit(v)
  else if (key === 'cancel') void onCancel(v)
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar
        :title="weekOnly ? '本周带看' : '带看记录'"
        :actions="[{ key: 'add', icon: 'add', ariaLabel: '新建带看' }]"
        @back="back"
        @action="goNew"
      />
      <view class="list-page-head page-scroll__inner viewing-page">
        <text class="viewing-page__hint">
          {{ weekOnly ? '仅显示近 7 天带看 · ' : '' }}左滑可编辑或取消带看 · 进行中会高亮
        </text>
        <view v-if="loadError && !list.length" class="viewing-empty card">
          <text class="hint">{{ loadError }}</text>
          <button class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
        </view>
      </view>
      <PagedVirtualList
        class="page-scroll"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        empty-text="暂无带看记录，点击右上角新建"
        @load-more="loadMore"
      >
        <template #item="{ item: v }">
          <SwipeRow
            :actions="[
              { key: 'edit', label: '编辑', tone: 'primary' },
              { key: 'cancel', label: '取消', tone: 'danger' },
            ]"
            @action="onRowAction($event, v as ViewingListItem)"
          >
            <view
              class="viewing-card card"
              :class="{ 'viewing-card--active': (v as ViewingListItem).active }"
            >
              <view class="viewing-card__head">
                <view class="viewing-card__time">
                  <text class="viewing-card__date">{{ (v as ViewingListItem).start }}</text>
                  <text class="viewing-card__sep">至</text>
                  <text class="viewing-card__date">{{ (v as ViewingListItem).end }}</text>
                </view>
                <view class="viewing-card__badges">
                  <text v-if="(v as ViewingListItem).active" class="chip on ok">进行中</text>
                  <text :class="gradeClass((v as ViewingListItem).score)">等级 {{ (v as ViewingListItem).score }}</text>
                </view>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">房源</text>
                <text class="viewing-card__value">{{ propLabel(v as ViewingListItem) }}</text>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">客户</text>
                <text class="viewing-card__value">{{ (v as ViewingListItem).customerName || '—' }}</text>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">陪同</text>
                <text class="viewing-card__value">{{
                  (v as ViewingListItem).companions || (v as ViewingListItem).miniStaff || '—'
                }}</text>
              </view>
            </view>
          </SwipeRow>
        </template>
      </PagedVirtualList>
    </view>
  </view>
</template>

<style scoped>
.list-page-head {
  flex-shrink: 0;
}
.viewing-page {
  padding-bottom: 12rpx;
}

.viewing-page__hint {
  display: block;
  font-size: 24rpx;
  color: var(--muted, #64748b);
  margin-bottom: 20rpx;
  padding: 0 4rpx;
}

.viewing-empty {
  text-align: center;
  padding: 48rpx 32rpx;
}

.viewing-empty__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.viewing-card {
  padding: 28rpx;
  border-left: 6rpx solid transparent;
}

.viewing-card--active {
  border-left-color: #1a3a6c;
  background: linear-gradient(90deg, rgba(13, 148, 136, 0.06), #fff);
}

.viewing-card__head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.viewing-card__time {
  flex: 1;
  min-width: 0;
}

.viewing-card__date {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
  line-height: 1.35;
}

.viewing-card__sep {
  display: block;
  font-size: 22rpx;
  color: var(--muted, #64748b);
  margin: 4rpx 0;
}

.viewing-card__badges {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: flex-end;
  flex-shrink: 0;
}

.viewing-card__row {
  display: flex;
  gap: 16rpx;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.4;
}

.viewing-card__label {
  color: var(--muted, #64748b);
  width: 72rpx;
  flex-shrink: 0;
}

.viewing-card__value {
  color: var(--ink, #0f172a);
  flex: 1;
}
</style>
