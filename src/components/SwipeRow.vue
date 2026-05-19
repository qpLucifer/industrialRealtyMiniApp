<script setup lang="ts">
import { computed, ref } from 'vue'

export type SwipeAction = {
  key: string
  label: string
  tone?: 'danger' | 'primary' | 'muted'
}

const props = withDefaults(
  defineProps<{
    actions: SwipeAction[]
    /** left: swipe right to reveal; right (default): swipe left to reveal */
    actionsSide?: 'left' | 'right'
  }>(),
  { actionsSide: 'right' },
)

const emit = defineEmits<{ action: [key: string] }>()

const offsetX = ref(0)
const open = ref(false)

const actionWidthPx = computed(() => {
  const n = Math.max(props.actions.length, 1)
  try {
    return n * uni.upx2px(144)
  } catch {
    return n * 72
  }
})

const maxOffset = computed(() =>
  props.actionsSide === 'left' ? actionWidthPx.value : -actionWidthPx.value,
)

let startX = 0
let startOffset = 0
let dragging = false

function clampOffset(x: number) {
  const max = maxOffset.value
  if (max > 0) return Math.min(Math.max(x, 0), max)
  return Math.max(Math.min(x, 0), max)
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
  const dx = t.clientX - startX
  offsetX.value = clampOffset(startOffset + dx)
}

function onTouchEnd() {
  dragging = false
  const max = maxOffset.value
  const threshold = max * 0.35
  if (max > 0) {
    open.value = offsetX.value > threshold
    offsetX.value = open.value ? max : 0
  } else {
    open.value = offsetX.value < threshold
    offsetX.value = open.value ? max : 0
  }
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
      v-if="actionsSide === 'left'"
      class="swipe-row__actions swipe-row__actions--left"
      :style="{ width: actionWidthPx + 'px' }"
    >
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

    <view
      class="swipe-row__panel"
      :style="{ transform: 'translateX(' + offsetX + 'px)' }"
      @touchstart.stop="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop="onTouchEnd"
      @touchcancel.stop="onTouchEnd"
    >
      <slot />
    </view>

    <view
      v-if="actionsSide !== 'left'"
      class="swipe-row__actions swipe-row__actions--right"
      :style="{ width: actionWidthPx + 'px' }"
    >
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
</template>

<style scoped>
.swipe-row {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
}

.swipe-row__panel {
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease;
  background: #fff;
}

.swipe-row__actions {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  z-index: 1;
}

.swipe-row__actions--right {
  right: 0;
}

.swipe-row__actions--left {
  left: 0;
}

.swipe-row__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  padding: 0 8rpx;
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
