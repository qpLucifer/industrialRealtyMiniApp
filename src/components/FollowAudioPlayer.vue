<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { resolveMediaUrl } from '@/utils/request'
import { applyInnerAudioOutputOptions } from '@/utils/innerAudioSetup'

const props = withDefaults(
  defineProps<{
    src: string
    /** e.g. "语音 1" */
    label?: string
    removable?: boolean
  }>(),
  {
    label: '跟进语音',
    removable: false,
  },
)

const emit = defineEmits<{ remove: [] }>()

const playing = ref(false)
const durationSec = ref(0)
const currentSec = ref(0)
const bufferedSec = ref(0)
const playPending = ref(false)
const waiting = ref(false)

/** Resolved URL; InnerAudioContext is created only after user taps play. */
const srcReady = ref('')

let ctx: UniApp.InnerAudioContext | null = null
let playPendingTimer: ReturnType<typeof setTimeout> | null = null

const isLoading = computed(() => playPending.value || waiting.value)

const progressPct = computed(() => {
  if (durationSec.value <= 0) return 0
  return Math.min(100, (currentSec.value / durationSec.value) * 100)
})

const bufferPct = computed(() => {
  if (durationSec.value > 0) {
    return Math.min(100, (bufferedSec.value / durationSec.value) * 100)
  }
  if (bufferedSec.value > 0) return Math.min(100, bufferedSec.value * 4)
  return 0
})

const durationLabel = computed(() =>
  durationSec.value > 0 ? formatTime(durationSec.value) : '--:--',
)

const timeDisplay = computed(() => {
  if (waiting.value && (playing.value || playPending.value)) return '缓冲中…'
  if (playPending.value) return '加载中…'
  if (playing.value || currentSec.value > 0) {
    return `${formatTime(currentSec.value)} / ${durationLabel.value}`
  }
  return durationSec.value > 0 ? formatTime(durationSec.value) : durationLabel.value
})

const showWaves = computed(() => playing.value && !waiting.value && !playPending.value)

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function syncDuration() {
  const d = Number(ctx?.duration)
  if (Number.isFinite(d) && d > 0) durationSec.value = d
}

function syncBuffered() {
  const b = Number((ctx as { buffered?: number } | null)?.buffered)
  if (Number.isFinite(b) && b >= 0) bufferedSec.value = b
}

function clearPlayPendingTimer() {
  if (playPendingTimer) {
    clearTimeout(playPendingTimer)
    playPendingTimer = null
  }
}

function clearLoadingFlags() {
  playPending.value = false
  waiting.value = false
  clearPlayPendingTimer()
}

function destroyCtx() {
  clearPlayPendingTimer()
  if (ctx) {
    try {
      ctx.stop()
      ctx.destroy()
    } catch {
      /* ignore */
    }
    ctx = null
  }
  playing.value = false
  clearLoadingFlags()
}

function resetPlaybackState() {
  destroyCtx()
  durationSec.value = 0
  currentSec.value = 0
  bufferedSec.value = 0
}

function bindCtxHandlers() {
  if (!ctx) return

  ctx.onCanplay(() => {
    syncDuration()
    syncBuffered()
    if (bufferedSec.value > currentSec.value + 0.2) waiting.value = false
  })

  ctx.onWaiting(() => {
    if (playPending.value || playing.value) waiting.value = true
  })

  ctx.onTimeUpdate(() => {
    const c = Number(ctx?.currentTime)
    if (Number.isFinite(c)) currentSec.value = c
    syncDuration()
    syncBuffered()
    if (waiting.value && bufferedSec.value > currentSec.value + 0.25) {
      waiting.value = false
    }
  })

  ctx.onPlay(() => {
    playing.value = true
    playPending.value = false
    waiting.value = false
    clearPlayPendingTimer()
    syncDuration()
    syncBuffered()
  })

  ctx.onPause(() => {
    playing.value = false
    playPending.value = false
    waiting.value = false
    clearPlayPendingTimer()
  })

  ctx.onStop(() => {
    playing.value = false
    currentSec.value = 0
    playPending.value = false
    waiting.value = false
    clearPlayPendingTimer()
  })

  ctx.onEnded(() => {
    playing.value = false
    currentSec.value = 0
    playPending.value = false
    waiting.value = false
    clearPlayPendingTimer()
  })

  ctx.onError(() => {
    playing.value = false
    clearLoadingFlags()
    uni.showToast({ title: '音频无法播放', icon: 'none' })
  })
}

function ensureCtx(): boolean {
  if (ctx) return true
  if (!srcReady.value) return false
  ctx = uni.createInnerAudioContext()
  ctx.src = srcReady.value
  bindCtxHandlers()
  return true
}

function prepareSrc(url: string) {
  resetPlaybackState()
  srcReady.value = resolveMediaUrl(url) || ''
}

function togglePlay() {
  if (!srcReady.value || playPending.value) return
  applyInnerAudioOutputOptions()

  if (playing.value && ctx) {
    ctx.pause()
    return
  }

  if (!ensureCtx() || !ctx) return

  playPending.value = true
  waiting.value = false
  clearPlayPendingTimer()
  playPendingTimer = setTimeout(() => {
    if (playPending.value && !playing.value) {
      playPending.value = false
      waiting.value = false
      uni.showToast({ title: '加载超时，请重试', icon: 'none' })
    }
  }, 20000)

  ctx.play()
  setTimeout(() => {
    syncDuration()
    syncBuffered()
  }, 120)
}

function onRemove() {
  srcReady.value = ''
  resetPlaybackState()
  emit('remove')
}

watch(
  () => props.src,
  (v) => prepareSrc(v),
  { immediate: true },
)

onUnmounted(() => {
  srcReady.value = ''
  resetPlaybackState()
})
</script>

<template>
  <view
    class="audio-card"
    :class="{
      'audio-card--playing': playing && !isLoading,
      'audio-card--loading': isLoading,
    }"
  >
    <view class="audio-card__play" @tap.stop="togglePlay">
      <view class="audio-card__play-ring" />
      <view v-if="isLoading && !playing" class="audio-card__spinner" />
      <view v-else-if="playing" class="audio-card__icon audio-card__icon--pause">
        <view class="audio-card__bar" />
        <view class="audio-card__bar" />
      </view>
      <view v-else class="audio-card__icon audio-card__icon--play" />
    </view>

    <view class="audio-card__main" @tap.stop="togglePlay">
      <view class="audio-card__head">
        <view class="audio-card__title-row">
          <text class="audio-card__label">{{ label }}</text>
          <view v-if="showWaves" class="audio-card__waves" aria-hidden="true">
            <view class="audio-card__wave" />
            <view class="audio-card__wave" />
            <view class="audio-card__wave" />
          </view>
        </view>
        <text class="audio-card__time" :class="{ 'audio-card__time--loading': isLoading }">
          {{ timeDisplay }}
        </text>
      </view>
      <view class="audio-card__track" :class="{ 'audio-card__track--loading': isLoading && bufferPct <= 0 }">
        <view class="audio-card__buffer" :style="{ width: `${bufferPct}%` }" />
        <view class="audio-card__fill" :style="{ width: `${progressPct}%` }" />
      </view>
    </view>

    <view v-if="removable" class="audio-card__remove" @tap.stop="onRemove">删除</view>
  </view>
</template>

<style scoped>
.audio-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1rpx solid rgba(26, 58, 108, 0.1);
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.04);
}

.audio-card--playing {
  border-color: rgba(26, 58, 108, 0.22);
  background: linear-gradient(135deg, #f0f4fa 0%, #e8eef8 100%);
}

.audio-card--loading {
  border-color: rgba(26, 58, 108, 0.16);
}

.audio-card__play {
  position: relative;
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-card__play-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a3a6c, #2d4f8c);
  box-shadow: 0 6rpx 16rpx rgba(26, 58, 108, 0.28);
}

.audio-card--playing .audio-card__play-ring {
  box-shadow: 0 6rpx 20rpx rgba(26, 58, 108, 0.36);
}

.audio-card__icon {
  position: relative;
  z-index: 1;
}

.audio-card__spinner {
  position: relative;
  z-index: 1;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: audio-spin 0.75s linear infinite;
}

@keyframes audio-spin {
  to {
    transform: rotate(360deg);
  }
}

.audio-card__icon--play {
  width: 0;
  height: 0;
  margin-left: 6rpx;
  border-top: 14rpx solid transparent;
  border-bottom: 14rpx solid transparent;
  border-left: 22rpx solid #fff;
}

.audio-card__icon--pause {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 28rpx;
  height: 28rpx;
}

.audio-card__bar {
  width: 6rpx;
  height: 24rpx;
  border-radius: 3rpx;
  background: #fff;
}

.audio-card__main {
  flex: 1;
  min-width: 0;
}

.audio-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 14rpx;
}

.audio-card__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.audio-card__label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.audio-card__waves {
  display: flex;
  align-items: flex-end;
  gap: 4rpx;
  height: 24rpx;
}

.audio-card__wave {
  width: 4rpx;
  height: 12rpx;
  border-radius: 2rpx;
  background: #1a3a6c;
  animation: audio-wave 0.9s ease-in-out infinite;
}

.audio-card__wave:nth-child(2) {
  animation-delay: 0.15s;
  height: 18rpx;
}

.audio-card__wave:nth-child(3) {
  animation-delay: 0.3s;
  height: 14rpx;
}

@keyframes audio-wave {
  0%,
  100% {
    transform: scaleY(0.55);
    opacity: 0.55;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.audio-card__time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.audio-card__time--loading {
  color: #1a3a6c;
}

.audio-card__track {
  position: relative;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(26, 58, 108, 0.12);
  overflow: hidden;
}

.audio-card__track--loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(26, 58, 108, 0.18) 50%,
    transparent 100%
  );
  animation: buffer-shimmer 1.2s ease-in-out infinite;
}

@keyframes buffer-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.audio-card__buffer {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 999rpx;
  background: rgba(26, 58, 108, 0.22);
  transition: width 0.2s linear;
  z-index: 0;
}

.audio-card__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #1a3a6c, #3d5f94);
  transition: width 0.12s linear;
  z-index: 1;
}

.audio-card__remove {
  flex-shrink: 0;
  padding: 8rpx 0 8rpx 12rpx;
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.2;
}

.audio-card__remove:active {
  color: #64748b;
}
</style>
