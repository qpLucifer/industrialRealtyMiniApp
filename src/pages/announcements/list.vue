<script setup lang="ts">
import { ref } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import PagedVirtualList from '@/components/PagedVirtualList.vue'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchAnnouncementList, markAnnouncementReadApi } from '@/api/message'
import { usePagedList } from '@/utils/pagedList'
import type { AnnouncementItem } from '@/types/message'

const loadError = ref('')
const popupVisible = ref(false)
const popupItem = ref<AnnouncementItem | null>(null)

const {
  items: list,
  loading,
  loadingMore,
  hasMore,
  loadFirst,
  loadMore,
} = usePagedList((page) => fetchAnnouncementList({ page }))

useTabPageShow(() => loadList())

async function loadList() {
  loadError.value = ''
  try {
    await loadFirst()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  }
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/home' }) })
}

async function openItem(item: AnnouncementItem) {
  popupItem.value = item
  popupVisible.value = true
  if (!item.id || item.read) return
  try {
    await markAnnouncementReadApi(String(item.id))
    list.value = list.value.map((a) => (a.id === item.id ? { ...a, read: true } : a))
    const opened = list.value.find((a) => a.id === item.id)
    if (opened) popupItem.value = opened
  } catch {
    uni.showToast({ title: '标记已读失败', icon: 'none' })
  }
}

function closePopup() {
  popupVisible.value = false
  popupItem.value = null
}

function previewBody(body: string, max = 72) {
  const t = String(body || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="公告" @back="back" />
      <PagedVirtualList
        class="page-scroll"
        :items="list"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        empty-text="暂无公告"
        @load-more="loadMore"
      >
        <template #item="{ item: a }">
          <view
            class="announce-row card"
            :class="{
              'announce-row--unread': !(a as AnnouncementItem).read,
              'announce-row--read': (a as AnnouncementItem).read,
            }"
            @click="openItem(a as AnnouncementItem)"
          >
            <view class="announce-row__head">
              <view v-if="!(a as AnnouncementItem).read" class="announce-row__dot" />
              <text class="announce-row__title">{{ (a as AnnouncementItem).title }}</text>
              <view v-if="!(a as AnnouncementItem).read" class="chip warn announce-row__chip">未读</view>
            </view>
            <text class="announce-row__preview">{{ previewBody((a as AnnouncementItem).body) }}</text>
          </view>
        </template>
      </PagedVirtualList>
    </view>

    <view v-if="popupVisible && popupItem" class="modal-overlay show" @click.self="closePopup">
      <view class="modal-sheet announce-popup-sheet" @click.stop>
        <view class="announce-popup-tag">公告通知</view>
        <view class="announce-popup-title">{{ popupItem.title }}</view>
        <scroll-view scroll-y class="announce-popup-body" :show-scrollbar="false">
          <text class="announce-popup-text">{{ popupItem.body }}</text>
        </scroll-view>
        <button class="btn-primary announce-popup-btn" @click="closePopup">知道了</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.announce-row {
  margin-bottom: 24rpx;
  transition: opacity 0.15s ease;
}

.announce-row--unread {
  border-left: 6rpx solid var(--mint);
  padding-left: 20rpx;
  background: linear-gradient(90deg, rgba(52, 211, 153, 0.08), transparent 48%);
}

.announce-row--read {
  opacity: 0.62;
  border-left: 6rpx solid transparent;
}

.announce-row__head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.announce-row__dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: var(--mint);
  flex-shrink: 0;
}

.announce-row__title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  word-break: break-word;
}

.announce-row--read .announce-row__title {
  font-weight: 500;
  color: var(--muted);
}

.announce-row__chip {
  flex-shrink: 0;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
}

.announce-row__preview {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--text);
}

.announce-row--read .announce-row__preview {
  color: var(--muted);
  font-size: 24rpx;
}

.announce-popup-sheet {
  max-width: 640rpx;
  margin: 0 auto;
  padding: 32rpx 28rpx 28rpx;
}

.announce-popup-tag {
  font-size: 22rpx;
  color: var(--cyan);
  letter-spacing: 0.08em;
}

.announce-popup-title {
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  font-family: var(--display);
  line-height: 1.35;
}

.announce-popup-body {
  margin-top: 20rpx;
  max-height: 48vh;
}

.announce-popup-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
}

.announce-popup-btn {
  margin-top: 28rpx;
  width: 100%;
  padding: 24rpx;
  font-size: 30rpx;
}
</style>
