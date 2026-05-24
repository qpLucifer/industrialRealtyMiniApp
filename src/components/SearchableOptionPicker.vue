<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { createSinglePickerSession, destroySinglePickerSession } from '@/utils/pickerSession'
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

const displayText = computed(() => {
  const label = String(selectedLabel.value || '').trim()
  if (label) return label
  const key = String(model.value || '').trim()
  if (!key) return props.placeholder
  return key
})

const showPlaceholderStyle = computed(() => !String(selectedLabel.value || '').trim() && !String(model.value || '').trim())

function openSheet() {
  if (props.disabled) return
  const sessionId = createSinglePickerSession<T>({
    search: props.search,
    getKey: props.getKey,
    getLabel: props.getLabel,
    getSubline: props.getSubline,
    title: props.sheetTitle,
    searchPlaceholder: props.searchPlaceholder,
    emptyHint: props.emptyHint,
    initialKey: model.value,
  })
  uni.navigateTo({
    url: `/pages/common/single-picker?id=${encodeURIComponent(sessionId)}`,
    events: {
      picked: (payload: { key?: string; label?: string }) => {
        if (payload?.key != null) model.value = String(payload.key)
        if (payload?.label != null) selectedLabel.value = String(payload.label)
      },
    },
    fail: () => {
      destroySinglePickerSession(sessionId)
      uni.showToast({ title: '无法打开选择页', icon: 'none' })
    },
  })
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
</style>
