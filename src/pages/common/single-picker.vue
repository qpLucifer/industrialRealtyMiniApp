<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import {
  destroySinglePickerSession,
  getSinglePickerSession,
  type SinglePickerSession,
} from '@/utils/pickerSession'

const sessionId = ref('')
const session = ref<SinglePickerSession | null>(null)
const keyword = ref('')
const rows = ref<unknown[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const page = ref(1)
const selectedKey = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0
let openerChannel: UniApp.EventChannel | null = null

const title = computed(() => session.value?.title ?? '请选择')
const searchPlaceholder = computed(() => session.value?.searchPlaceholder ?? '输入关键词搜索…')
const emptyHint = computed(() => session.value?.emptyHint ?? '无匹配结果，请换关键词')

watch(keyword, () => {
  if (!session.value) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runSearch(true)
  }, 320)
})

onLoad((query) => {
  const id = String(query?.id ?? '').trim()
  if (!id) {
    uni.showToast({ title: '选择器参数无效', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  sessionId.value = id
  const cfg = getSinglePickerSession(id)
  if (!cfg) {
    uni.showToast({ title: '选择器已过期，请重试', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  session.value = cfg
  selectedKey.value = String(cfg.initialKey ?? '').trim()
  const ec = getOpenerEventChannel()
  openerChannel = ec ?? null
  void runSearch(true)
})

onUnload(() => {
  if (sessionId.value) destroySinglePickerSession(sessionId.value)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

function getOpenerEventChannel(): UniApp.EventChannel | null {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { getOpenerEventChannel?: () => UniApp.EventChannel }
    return typeof cur?.getOpenerEventChannel === 'function' ? cur.getOpenerEventChannel() : null
  } catch {
    return null
  }
}

async function runSearch(reset: boolean) {
  const cfg = session.value
  if (!cfg) return
  const seq = ++searchSeq
  if (reset) {
    page.value = 1
    loading.value = true
    loadingMore.value = false
  } else {
    loadingMore.value = true
  }
  try {
    const r = await cfg.search(keyword.value.trim(), page.value)
    if (seq !== searchSeq) return
    const list = r.list ?? []
    rows.value = reset ? list : [...rows.value, ...list]
    hasMore.value = Boolean(r.hasMore)
  } catch (e) {
    if (seq !== searchSeq) return
    if (reset) rows.value = []
    hasMore.value = false
    uni.showToast({ title: e instanceof Error ? e.message : '搜索失败', icon: 'none' })
  } finally {
    if (seq === searchSeq) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function onScrollToLower() {
  if (!hasMore.value || loading.value || loadingMore.value) return
  page.value += 1
  void runSearch(false)
}

function onSearchConfirm() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  void runSearch(true)
}

function rowKey(item: unknown) {
  return session.value?.getKey(item as never) ?? ''
}

function rowLabel(item: unknown) {
  return session.value?.getLabel(item as never) ?? ''
}

function rowSubline(item: unknown) {
  return session.value?.getSubline?.(item as never) ?? ''
}

function pickItem(item: unknown) {
  const cfg = session.value
  if (!cfg) return
  const key = cfg.getKey(item as never)
  const label = cfg.getLabel(item as never)
  openerChannel?.emit('picked', { key, label })
  uni.navigateBack()
}

function cancel() {
  uni.navigateBack()
}
</script>

<template>
  <view class="picker-page app-shell">
    <view class="page-frame screen active screen--sub picker-page__frame">
      <NavIconBar :title="title" @back="cancel" />
      <view class="picker-page__body">
        <view class="picker-page__search">
          <text class="picker-page__search-icon">⌕</text>
          <input
            v-model="keyword"
            class="picker-page__search-input"
            type="text"
            :placeholder="searchPlaceholder"
            confirm-type="search"
            :focus="true"
            :adjust-position="true"
            :cursor-spacing="80"
            @confirm="onSearchConfirm"
          />
          <text v-if="keyword" class="picker-page__search-clear" @tap="keyword = ''">清除</text>
        </view>

        <scroll-view
          scroll-y
          class="picker-page__list"
          :show-scrollbar="true"
          :enhanced="true"
          :lower-threshold="80"
          @scrolltolower="onScrollToLower"
        >
          <view class="picker-page__list-inner">
            <view v-if="loading && !rows.length" class="picker-page__status">
              <text class="hint">搜索中…</text>
            </view>
            <view v-else-if="!rows.length" class="picker-page__status">
              <text class="hint">{{ emptyHint }}</text>
            </view>
            <view
              v-for="item in rows"
              :key="rowKey(item)"
              class="picker-row"
              :class="{ 'picker-row--on': rowKey(item) === selectedKey }"
              @tap="pickItem(item)"
            >
              <view class="picker-row__main">
                <text class="picker-row__title">{{ rowLabel(item) }}</text>
                <text v-if="session?.getSubline" class="picker-row__sub">{{ rowSubline(item) }}</text>
              </view>
              <view class="picker-row__radio" :class="{ 'picker-row__radio--on': rowKey(item) === selectedKey }" />
            </view>
            <view v-if="loadingMore" class="picker-page__status">
              <text class="hint">加载更多…</text>
            </view>
            <view v-else-if="rows.length && !hasMore" class="picker-page__status picker-page__status--muted">
              <text class="hint">没有更多了</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.picker-page__frame {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.picker-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 28rpx env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.picker-page__search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 16rpx 0 20rpx;
  padding: 0 20rpx;
  min-height: 88rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
  border: 2rpx solid rgba(148, 163, 184, 0.2);
}

.picker-page__search-icon {
  font-size: 32rpx;
  color: #64748b;
}

.picker-page__search-input {
  flex: 1;
  font-size: 28rpx;
  min-height: 72rpx;
}

.picker-page__search-clear {
  font-size: 24rpx;
  color: var(--brand, #1a3a6c);
  padding: 8rpx;
}

.picker-page__list {
  flex: 1;
  height: 0;
  width: 100%;
}

.picker-page__list-inner {
  padding-bottom: 32rpx;
}

.picker-page__status {
  padding: 48rpx 24rpx;
  text-align: center;
}

.picker-page__status--muted .hint {
  font-size: 24rpx;
  color: var(--muted, #94a3b8);
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}

.picker-row--on {
  background: rgba(26, 58, 108, 0.08);
  border-color: rgba(26, 58, 108, 0.2);
}

.picker-row__main {
  flex: 1;
  min-width: 0;
}

.picker-row__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  line-height: 1.4;
}

.picker-row__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--muted, #64748b);
}

.picker-row__radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #cbd5e1;
  flex-shrink: 0;
  box-sizing: border-box;
}

.picker-row__radio--on {
  border-color: var(--brand, #1a3a6c);
  background: var(--brand, #1a3a6c);
  box-shadow: inset 0 0 0 6rpx #fff;
}
</style>
