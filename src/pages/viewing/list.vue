<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import SwipeRow from '@/components/SwipeRow.vue'
import { deleteViewing, fetchViewingList } from '@/api/extra'
import { markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { ViewingListItem } from '@/types/viewingDeal'

const list = ref<ViewingListItem[]>([])
const loading = ref(false)
const loadError = ref('')
const skipNextShow = ref(false)

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
  loading.value = true
  loadError.value = ''
  try {
    const r = await fetchViewingList()
    list.value = r.list
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(async () => {
  skipNextShow.value = true
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
    list.value = list.value.filter((x) => x.id !== v.id)
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
        title="带看记录"
        :actions="[{ key: 'add', icon: 'add', ariaLabel: '新建带看' }]"
        @back="back"
        @action="goNew"
      />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner viewing-page">
          <text class="viewing-page__hint">左滑可编辑或取消带看 · 进行中会高亮</text>

          <view v-if="loading && !list.length" class="viewing-empty card">
            <text class="hint">加载中…</text>
          </view>
          <view v-else-if="loadError && !list.length" class="viewing-empty card">
            <text class="hint">{{ loadError }}</text>
            <button class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
          </view>
          <view v-else-if="!list.length" class="viewing-empty card">
            <text class="viewing-empty__title">暂无带看记录</text>
            <text class="hint">点击右上角新建带看</text>
          </view>

          <SwipeRow
            v-for="v in list"
            :key="v.id"
            :actions="[
              { key: 'edit', label: '编辑', tone: 'primary' },
              { key: 'cancel', label: '取消', tone: 'danger' },
            ]"
            @action="onRowAction($event, v)"
          >
            <view class="viewing-card" :class="{ 'viewing-card--active': v.active }">
              <view class="viewing-card__head">
                <view class="viewing-card__time">
                  <text class="viewing-card__date">{{ v.start }}</text>
                  <text class="viewing-card__sep">至</text>
                  <text class="viewing-card__date">{{ v.end }}</text>
                </view>
                <view class="viewing-card__badges">
                  <text v-if="v.active" class="chip on ok">进行中</text>
                  <text :class="gradeClass(v.score)">等级 {{ v.score }}</text>
                </view>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">房源</text>
                <text class="viewing-card__value">{{ propLabel(v) }}</text>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">客户</text>
                <text class="viewing-card__value">{{ v.customerName || '—' }}</text>
              </view>
              <view class="viewing-card__row">
                <text class="viewing-card__label">陪同</text>
                <text class="viewing-card__value">{{ v.companions || v.miniStaff || '—' }}</text>
              </view>
            </view>
          </SwipeRow>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.viewing-page {
  padding-bottom: 32rpx;
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
  border-left-color: #0d9488;
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
