<script setup lang="ts">
import { computed, ref } from 'vue'

export type StaffPickOption = { id: string; name: string }

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(
  defineProps<{
    options: StaffPickOption[]
    label?: string
    placeholder?: string
    hint?: string
    sheetTitle?: string
    minCount?: number
  }>(),
  {
    placeholder: '请选择陪同员工',
    sheetTitle: '选择陪同员工',
    minCount: 1,
  },
)

const visible = ref(false)
const draft = ref<string[]>([])

const displayText = computed(() => {
  const names = model.value
    .map((id) => props.options.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[]
  return names.length ? names.join('、') : props.placeholder
})

function openSheet() {
  if (!props.options.length) {
    uni.showToast({ title: '暂无可选员工', icon: 'none' })
    return
  }
  draft.value = [...model.value]
  visible.value = true
}

function closeSheet() {
  visible.value = false
}

function onCheckboxChange(e: { detail: { value: string[] } }) {
  draft.value = e.detail.value || []
}

function confirmSheet() {
  if (props.minCount > 0 && draft.value.length < props.minCount) {
    uni.showToast({
      title: props.minCount > 1 ? `至少选择 ${props.minCount} 人` : '请至少选择一人',
      icon: 'none',
    })
    return
  }
  model.value = [...draft.value]
  closeSheet()
}
</script>

<template>
  <view class="form-group staff-multi-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view class="picker-value" @click="openSheet">{{ displayText }}</view>
    <text v-if="hint" class="hint staff-multi-field__hint">{{ hint }}</text>

    <view v-if="visible" class="modal-overlay show" @click.self="closeSheet">
      <view class="modal-sheet staff-multi-sheet" @click.stop>
        <view class="staff-multi-sheet__head">
          <text class="staff-multi-sheet__action" @click="closeSheet">取消</text>
          <text class="staff-multi-sheet__title">{{ sheetTitle }}</text>
          <text class="staff-multi-sheet__action staff-multi-sheet__action--ok" @click="confirmSheet">确定</text>
        </view>
        <scroll-view scroll-y class="staff-multi-sheet__list" :show-scrollbar="false">
          <checkbox-group @change="onCheckboxChange">
            <label v-for="s in options" :key="s.id" class="staff-multi-sheet__row">
              <checkbox :value="s.id" :checked="draft.includes(s.id)" color="#0d9488" />
              <text class="staff-multi-sheet__name">{{ s.name }}</text>
            </label>
          </checkbox-group>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.staff-multi-field__hint {
  display: block;
  margin-top: 8rpx;
}

.staff-multi-sheet {
  max-height: 70vh;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 24rpx 24rpx 0 0;
}

.staff-multi-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.staff-multi-sheet__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
}

.staff-multi-sheet__action {
  font-size: 28rpx;
  color: var(--muted, #64748b);
  padding: 8rpx 12rpx;
}

.staff-multi-sheet__action--ok {
  color: var(--teal, #0d9488);
  font-weight: 600;
}

.staff-multi-sheet__list {
  max-height: 52vh;
  padding: 8rpx 0 24rpx;
}

.staff-multi-sheet__row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
}

.staff-multi-sheet__name {
  font-size: 30rpx;
  color: var(--ink, #0f172a);
}
</style>
