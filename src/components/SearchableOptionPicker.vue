<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    options: T[]
    getKey: (item: T) => string
    getLabel: (item: T) => string
    /** Extra haystack for search (e.g. meta line) */
    getSearchText?: (item: T) => string
    label?: string
    placeholder?: string
    sheetTitle?: string
    searchPlaceholder?: string
    disabled?: boolean
    emptyHint?: string
  }>(),
  {
    placeholder: '请选择',
    sheetTitle: '请选择',
    searchPlaceholder: '搜索关键词…',
    disabled: false,
    emptyHint: '暂无匹配项',
  },
)

const visible = ref(false)
const keyword = ref('')

const displayText = computed(() => {
  const key = String(model.value || '').trim()
  if (!key) return props.placeholder
  const hit = props.options.find((o) => props.getKey(o) === key)
  return hit ? props.getLabel(hit) : props.placeholder
})

const filteredOptions = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((item) => {
    const hay = `${props.getLabel(item)} ${props.getSearchText?.(item) ?? ''}`.toLowerCase()
    return hay.includes(q)
  })
})

watch(visible, (open) => {
  if (!open) keyword.value = ''
})

function openSheet() {
  if (props.disabled) return
  if (!props.options.length) {
    uni.showToast({ title: '暂无可选项', icon: 'none' })
    return
  }
  visible.value = true
}

function closeSheet() {
  visible.value = false
}

function pickItem(item: T) {
  model.value = props.getKey(item)
  closeSheet()
}
</script>

<template>
  <view class="form-group searchable-picker">
    <text v-if="label" class="label">{{ label }}</text>
    <view class="picker-like" :class="{ 'picker-like--disabled': disabled }" @click="openSheet">{{ displayText }}</view>

    <view v-if="visible" class="modal-overlay show" @click.self="closeSheet">
      <view class="modal-sheet searchable-picker-sheet" @click.stop>
        <view class="searchable-picker-sheet__head">
          <text class="searchable-picker-sheet__action" @click="closeSheet">取消</text>
          <text class="searchable-picker-sheet__title">{{ sheetTitle }}</text>
          <view class="searchable-picker-sheet__action searchable-picker-sheet__action--spacer" />
        </view>
        <view class="searchable-picker-sheet__search">
          <input
            v-model="keyword"
            type="text"
            class="searchable-picker-sheet__input"
            :placeholder="searchPlaceholder"
            confirm-type="search"
          />
        </view>
        <scroll-view scroll-y class="searchable-picker-sheet__list" :show-scrollbar="false">
          <view v-if="!filteredOptions.length" class="searchable-picker-sheet__empty">
            <text class="hint">{{ emptyHint }}</text>
          </view>
          <view
            v-for="item in filteredOptions"
            :key="getKey(item)"
            class="searchable-picker-sheet__row"
            :class="{ 'searchable-picker-sheet__row--on': getKey(item) === model }"
            @click="pickItem(item)"
          >
            <text class="searchable-picker-sheet__name">{{ getLabel(item) }}</text>
            <text v-if="getKey(item) === model" class="searchable-picker-sheet__check">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.picker-like--disabled {
  opacity: 0.72;
}

.searchable-picker-sheet {
  max-height: 78vh;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 24rpx 24rpx 0 0;
}

.searchable-picker-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.searchable-picker-sheet__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
}

.searchable-picker-sheet__action {
  font-size: 28rpx;
  color: var(--muted, #64748b);
  padding: 8rpx 12rpx;
  min-width: 80rpx;
}

.searchable-picker-sheet__action--spacer {
  visibility: hidden;
}

.searchable-picker-sheet__search {
  padding: 16rpx 28rpx;
}

.searchable-picker-sheet__input {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #f1f5f9;
  font-size: 28rpx;
}

.searchable-picker-sheet__list {
  max-height: 52vh;
}

.searchable-picker-sheet__empty {
  padding: 48rpx 32rpx;
  text-align: center;
}

.searchable-picker-sheet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
}

.searchable-picker-sheet__row--on {
  background: rgba(26, 58, 108, 0.06);
}

.searchable-picker-sheet__name {
  flex: 1;
  font-size: 28rpx;
  line-height: 1.45;
  color: var(--ink, #0f172a);
}

.searchable-picker-sheet__check {
  font-size: 28rpx;
  color: var(--brand, #1a3a6c);
  font-weight: 700;
}
</style>
