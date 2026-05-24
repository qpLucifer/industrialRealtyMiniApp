<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import type { PickerSearchPage } from '@/utils/pickerSearch'

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

const model = defineModel<string>({ default: '' })
const selectedLabel = defineModel<string>('selectedLabel', { default: '' })

const props = withDefaults(
  defineProps<{
    search: (q: string, page: number) => Promise<PickerSearchPage<T>>
    getKey: (item: T) => string
    getLabel: (item: T) => string
    getSubline?: (item: T) => string
    label?: string
    placeholder?: string
    sheetTitle?: string
    searchPlaceholder?: string
    disabled?: boolean
    emptyHint?: string
  }>(),
  {
    placeholder: '点击选择',
    sheetTitle: '请选择',
    searchPlaceholder: '输入关键词搜索…',
    disabled: false,
    emptyHint: '无匹配结果，请换关键词',
  },
)

const visible = ref(false)
const keyword = ref('')
const rows = ref<T[]>([]) as { value: T[] }
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const page = ref(1)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0

const displayText = computed(() => {
  const label = String(selectedLabel.value || '').trim()
  if (label) return label
  const key = String(model.value || '').trim()
  if (!key) return props.placeholder
  return key
})

const showPlaceholderStyle = computed(() => !String(selectedLabel.value || '').trim() && !String(model.value || '').trim())

watch(visible, (open) => {
  if (open) {
    keyword.value = ''
    void runSearch(true)
    return
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

watch(keyword, () => {
  if (!visible.value) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runSearch(true)
  }, 320)
})

async function runSearch(reset: boolean) {
  const seq = ++searchSeq
  if (reset) {
    page.value = 1
    loading.value = true
    loadingMore.value = false
  } else {
    loadingMore.value = true
  }
  try {
    const r = await props.search(keyword.value.trim(), page.value)
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

function openSheet() {
  if (props.disabled) return
  visible.value = true
}

function closeSheet() {
  visible.value = false
}

function clearKeyword() {
  keyword.value = ''
}

function pickItem(item: T) {
  model.value = props.getKey(item)
  selectedLabel.value = props.getLabel(item)
  closeSheet()
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
</script>

<template>
  <view class="form-group sop-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view
      class="sop-trigger"
      :class="{ 'sop-trigger--disabled': disabled, 'sop-trigger--placeholder': showPlaceholderStyle }"
      @click="openSheet"
    >
      <text class="sop-trigger__text">{{ displayText }}</text>
      <text class="sop-trigger__chev">›</text>
    </view>

    <view v-if="visible" class="modal-overlay show" @click.self="closeSheet">
      <view class="sop-sheet" @click.stop>
        <view class="sop-sheet__head">
          <text class="sop-sheet__title">{{ sheetTitle }}</text>
          <view class="sop-sheet__close" @click="closeSheet">×</view>
        </view>

        <view class="sop-sheet__search-wrap">
          <view class="sop-sheet__search">
            <text class="sop-sheet__search-icon">⌕</text>
            <input
              v-model="keyword"
              class="sop-sheet__search-input"
              type="text"
              :placeholder="searchPlaceholder"
              confirm-type="search"
              :focus="visible"
              @confirm="onSearchConfirm"
            />
            <text v-if="keyword" class="sop-sheet__search-clear" @click="clearKeyword">清除</text>
          </view>
        </view>

        <scroll-view
          scroll-y
          class="sop-sheet__list"
          :show-scrollbar="false"
          :lower-threshold="80"
          @scrolltolower="onScrollToLower"
        >
          <view v-if="loading && !rows.length" class="sop-sheet__status">
            <text class="hint">搜索中…</text>
          </view>
          <view v-else-if="!rows.length" class="sop-sheet__status">
            <text class="hint">{{ emptyHint }}</text>
          </view>
          <view
            v-for="item in rows"
            :key="getKey(item)"
            class="sop-row"
            :class="{ 'sop-row--on': getKey(item) === model }"
            @click="pickItem(item)"
          >
            <view class="sop-row__main">
              <text class="sop-row__title">{{ getLabel(item) }}</text>
              <text v-if="getSubline" class="sop-row__sub">{{ getSubline(item) }}</text>
            </view>
            <view class="sop-row__radio" :class="{ 'sop-row__radio--on': getKey(item) === model }" />
          </view>
          <view v-if="loadingMore" class="sop-sheet__status">
            <text class="hint">加载更多…</text>
          </view>
          <view v-else-if="rows.length && !hasMore" class="sop-sheet__status sop-sheet__status--muted">
            <text class="hint">没有更多了</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.sop-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  min-height: 88rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(15, 23, 42, 0.06);
  border: 2rpx solid rgba(148, 163, 184, 0.22);
  box-sizing: border-box;
}

.sop-trigger:active {
  background: #f8fafc;
}

.sop-trigger--disabled {
  opacity: 0.65;
  pointer-events: none;
}

.sop-trigger--placeholder .sop-trigger__text {
  color: var(--muted, #94a3b8);
  font-weight: 400;
}

.sop-trigger__text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  line-height: 1.4;
  word-break: break-all;
}

.sop-trigger__chev {
  font-size: 36rpx;
  line-height: 1;
  color: var(--muted, #94a3b8);
  transform: rotate(90deg);
  flex-shrink: 0;
}

.sop-sheet {
  width: 100%;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.sop-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
}

.sop-sheet__title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
  font-family: var(--display, inherit);
}

.sop-sheet__close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  line-height: 1;
  color: #64748b;
}

.sop-sheet__search-wrap {
  padding: 0 28rpx 20rpx;
  flex-shrink: 0;
}

.sop-sheet__search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 20rpx;
  min-height: 80rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
  border: 2rpx solid transparent;
}

.sop-sheet__search-icon {
  font-size: 32rpx;
  color: #64748b;
  flex-shrink: 0;
}

.sop-sheet__search-input {
  flex: 1;
  font-size: 28rpx;
  min-height: 72rpx;
}

.sop-sheet__search-clear {
  font-size: 24rpx;
  color: var(--brand, #1a3a6c);
  padding: 8rpx;
  flex-shrink: 0;
}

.sop-sheet__list {
  flex: 1;
  min-height: 280rpx;
  max-height: 62vh;
}

.sop-sheet__status {
  padding: 40rpx 32rpx;
  text-align: center;
}

.sop-sheet__status--muted .hint {
  font-size: 24rpx;
  color: var(--muted, #94a3b8);
}

.sop-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 0 20rpx 16rpx;
  padding: 24rpx 24rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}

.sop-row:active {
  opacity: 0.92;
}

.sop-row--on {
  background: rgba(26, 58, 108, 0.08);
  border-color: rgba(26, 58, 108, 0.2);
}

.sop-row__main {
  flex: 1;
  min-width: 0;
}

.sop-row__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  line-height: 1.4;
}

.sop-row__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--muted, #64748b);
  line-height: 1.45;
}

.sop-row__radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #cbd5e1;
  flex-shrink: 0;
  box-sizing: border-box;
}

.sop-row__radio--on {
  border-color: var(--brand, #1a3a6c);
  background: var(--brand, #1a3a6c);
  box-shadow: inset 0 0 0 6rpx #fff;
}
</style>
