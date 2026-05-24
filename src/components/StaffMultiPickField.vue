<script setup lang="ts">
import { computed, ref } from 'vue'
import { createMultiPickerSession, destroyMultiPickerSession } from '@/utils/pickerSession'

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

export type StaffPickOption = { id: string; name: string }

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(
  defineProps<{
    options?: StaffPickOption[]
    searchFn?: (q: string) => Promise<StaffPickOption[]>
    label?: string
    placeholder?: string
    hint?: string
    sheetTitle?: string
    minCount?: number
    searchPlaceholder?: string
  }>(),
  {
    options: () => [],
    placeholder: '请选择陪同员工',
    sheetTitle: '选择陪同员工',
    minCount: 1,
    searchPlaceholder: '搜索姓名…',
  },
)

const pickedOptions = ref<StaffPickOption[]>([])

const nameById = computed(() => {
  const m = new Map<string, string>()
  for (const s of [...props.options, ...pickedOptions.value]) {
    if (s.id && s.name) m.set(s.id, s.name)
  }
  return m
})

const displayText = computed(() => {
  const names = model.value.map((id) => nameById.value.get(id)).filter(Boolean) as string[]
  return names.length ? names.join('、') : props.placeholder
})

const showPlaceholder = computed(() => !model.value.length)

function openSheet() {
  if (!props.searchFn && !props.options.length) {
    uni.showToast({ title: '暂无可选员工', icon: 'none' })
    return
  }
  const sessionId = createMultiPickerSession({
    searchFn: props.searchFn,
    options: [...props.options],
    title: props.sheetTitle,
    searchPlaceholder: props.searchPlaceholder,
    minCount: props.minCount,
    initialIds: [...model.value],
  })
  uni.navigateTo({
    url: `/pages/common/multi-picker?id=${encodeURIComponent(sessionId)}`,
    events: {
      picked: (payload: { ids?: string[]; selections?: StaffPickOption[] }) => {
        if (Array.isArray(payload?.ids)) model.value = payload.ids.map(String)
        if (Array.isArray(payload?.selections)) {
          for (const s of payload.selections) {
            if (!s?.id) continue
            if (!pickedOptions.value.some((x) => x.id === s.id)) {
              pickedOptions.value = [...pickedOptions.value, { id: s.id, name: s.name || s.id }]
            }
          }
        }
      },
    },
    fail: () => {
      destroyMultiPickerSession(sessionId)
      uni.showToast({ title: '无法打开选择页', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="form-group staff-multi-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view class="sop-trigger" :class="{ 'sop-trigger--placeholder': showPlaceholder }" @click="openSheet">
      <text class="sop-trigger__text">{{ displayText }}</text>
      <text class="sop-trigger__chev">›</text>
    </view>
    <text v-if="hint" class="hint staff-multi-field__hint">{{ hint }}</text>
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
}

.sop-trigger__chev {
  font-size: 36rpx;
  color: var(--muted, #94a3b8);
  transform: rotate(90deg);
}

.staff-multi-field__hint {
  display: block;
  margin-top: 8rpx;
}
</style>
