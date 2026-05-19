<script setup lang="ts">
import { computed, ref } from 'vue'

export type SwipeAction = {
  key: string
  label: string
  tone?: 'danger' | 'primary' | 'muted'
}

const props = defineProps<{
  actions: SwipeAction[]
}>()

const emit = defineEmits<{ action: [key: string] }>()

const offsetX = ref(0)
const open = ref(false)

const actionWidthPx = computed(() => {
  const n = Math.max(props.actions.length, 1)
  try {
    return n * uni.upx2px(128)
  } catch {
    return n * 64
  }
})

/** Swipe left: track moves left, actions on the right edge */
const maxOffset = computed(() => -actionWidthPx.value)

let startX = 0
let startOffset = 0
let dragging = false

function clampOffset(x: number) {
  const min = maxOffset.value
  return Math.max(Math.min(x, 0), min)
}

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  if (!t) return
  startX = t.clientX
  startOffset = offsetX.value
  dragging = true
}

function onTouchMove(e: TouchEvent) {
  if (!dragging) return
  const t = e.touches[0]
  if (!t) return
  offsetX.value = clampOffset(startOffset + (t.clientX - startX))
}

function onTouchEnd() {
  dragging = false
  const min = maxOffset.value
  const threshold = min * 0.35
  open.value = offsetX.value < threshold
  offsetX.value = open.value ? min : 0
}

function close() {
  open.value = false
  offsetX.value = 0
}

function onAction(key: string) {
  emit('action', key)
  close()
}

defineExpose({ close })
</script>

<template>
  <view class="swipe-row">
    <view
      class="swipe-row__track"
      :class="{ 'swipe-row__track--dragging': dragging }"
      :style="{ transform: 'translateX(' + offsetX + 'px)' }"
    >
      <view
        class="swipe-row__main"
        @touchstart.stop="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend.stop="onTouchEnd"
        @touchcancel.stop="onTouchEnd"
      >
        <slot />
      </view>
      <view class="swipe-row__actions" :style="{ width: actionWidthPx + 'px' }">
        <view
          v-for="a in actions"
          :key="a.key"
          class="swipe-row__btn"
          :class="'swipe-row__btn--' + (a.tone || 'primary')"
          @tap.stop="onAction(a.key)"
        >
          {{ a.label }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.swipe-row {
  width: 100%;
  overflow: hidden;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  background: #f1f5f9;
}

.swipe-row__track {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  transition: transform 0.22s ease;
  will-change: transform;
}

.swipe-row__track--dragging {
  transition: none;
}

.swipe-row__main {
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.swipe-row__actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.swipe-row__btn {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  padding: 0 12rpx;
  box-sizing: border-box;
}

.swipe-row__btn--danger {
  background: #e11d48;
}

.swipe-row__btn--primary {
  background: #0d9488;
}

.swipe-row__btn--muted {
  background: #64748b;
}
</style>
