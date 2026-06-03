<script setup lang="ts">
import { getCurrentInstance, nextTick, ref } from 'vue'
import { onVideoComponentError } from '@/utils/request'

const props = withDefaults(
  defineProps<{
    urls: string[]
    disabled?: boolean
    kind?: 'image' | 'video'
  }>(),
  { disabled: false, kind: 'image' },
)

const emit = defineEmits<{
  reorder: [from: number, to: number]
  remove: [index: number]
  preview: [index: number]
  previewVideo: [url: string]
}>()

const instance = getCurrentInstance()
const dragging = ref(false)
const dragFrom = ref(-1)
const dragOver = ref(-1)
let sortHintShown = false

type CellRect = { left: number; top: number; right: number; bottom: number; index: number }
const cellRects = ref<CellRect[]>([])

function canSort() {
  return !props.disabled && props.urls.length > 1
}

function measureCells() {
  return new Promise<void>((resolve) => {
    const proxy = instance?.proxy
    if (!proxy) {
      resolve()
      return
    }
    uni
      .createSelectorQuery()
      .in(proxy)
      .selectAll('.prop-media-sort__hit')
      .boundingClientRect((raw) => {
        const rects = (Array.isArray(raw) ? raw : raw ? [raw] : []) as UniApp.NodeInfo[]
        cellRects.value = rects.map((r, index) => {
          const left = Number(r.left) || 0
          const top = Number(r.top) || 0
          const w = Number(r.width) || 0
          const h = Number(r.height) || 0
          return { left, top, right: left + w, bottom: top + h, index }
        })
        resolve()
      })
      .exec()
  })
}

function touchPoint(e: UniHelper.TouchEvent) {
  const t = e.touches?.[0] || e.changedTouches?.[0]
  if (!t) return null
  const x = Number((t as UniHelper.TouchDetail).clientX ?? (t as UniHelper.TouchDetail).pageX)
  const y = Number((t as UniHelper.TouchDetail).clientY ?? (t as UniHelper.TouchDetail).pageY)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y }
}

function indexAtTouch(e: UniHelper.TouchEvent): number {
  const p = touchPoint(e)
  if (!p) return dragOver.value
  const hit = cellRects.value.find(
    (r) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom,
  )
  return hit != null ? hit.index : dragOver.value
}

async function onLongPress(i: number) {
  if (!canSort()) return
  dragging.value = true
  dragFrom.value = i
  dragOver.value = i
  if (!sortHintShown) {
    sortHintShown = true
    uni.showToast({ title: '拖动到目标位置后松手', icon: 'none', duration: 1500 })
  }
  uni.vibrateShort?.({ type: 'light' })
  await nextTick()
  await measureCells()
}

function onGridTouchMove(e: UniHelper.TouchEvent) {
  if (!dragging.value) return
  const idx = indexAtTouch(e)
  if (idx >= 0 && idx < props.urls.length) dragOver.value = idx
}

function finishDrag() {
  if (!dragging.value) return
  const from = dragFrom.value
  const to = dragOver.value
  if (from >= 0 && to >= 0 && from !== to) emit('reorder', from, to)
  dragging.value = false
  dragFrom.value = -1
  dragOver.value = -1
  cellRects.value = []
}

function onPreview(i: number) {
  if (dragging.value) return
  emit('preview', i)
}

function onPreviewVideo(url: string) {
  if (dragging.value) return
  emit('previewVideo', url)
}
</script>

<template>
  <view
    v-if="kind === 'image' && urls.length"
    class="prop-media-editor__grid prop-media-sort"
    :class="{ 'prop-media-sort--active': dragging }"
    @touchend="finishDrag"
    @touchcancel="finishDrag"
    @touchmove.stop.prevent="onGridTouchMove"
  >
    <view
      v-for="(url, i) in urls"
      :key="'sort-img-' + url + '-' + i"
      class="prop-media-editor__cell prop-media-sort__cell prop-media-sort__hit"
      :class="{
        'prop-media-sort__cell--dragging': dragging && dragFrom === i,
        'prop-media-sort__cell--over': dragging && dragOver === i && dragFrom !== i,
      }"
      @longpress="onLongPress(i)"
    >
      <image class="prop-media-editor__img" :src="url" mode="aspectFill" @click="onPreview(i)" />
      <text
        v-if="canSort() && !disabled"
        class="prop-media-sort__handle"
        @longpress.stop="onLongPress(i)"
      >≡</text>
      <text v-if="!disabled" class="prop-media-editor__del" @tap.stop="emit('remove', i)">×</text>
    </view>
  </view>

  <view
    v-else-if="kind === 'video' && urls.length"
    class="prop-media-editor__video-list prop-media-sort"
    :class="{ 'prop-media-sort--active': dragging }"
    @touchend="finishDrag"
    @touchcancel="finishDrag"
    @touchmove.stop.prevent="onGridTouchMove"
  >
    <view
      v-for="(url, i) in urls"
      :key="'sort-vid-' + url + '-' + i"
      class="prop-media-editor__video-block prop-media-sort__video-block prop-media-sort__hit"
      :class="{
        'prop-media-sort__cell--dragging': dragging && dragFrom === i,
        'prop-media-sort__cell--over': dragging && dragOver === i && dragFrom !== i,
      }"
      @longpress="onLongPress(i)"
    >
      <view class="prop-media-editor__cell prop-media-editor__cell--video">
        <video
          class="prop-media-editor__img prop-media-editor__video"
          :src="url"
          controls
          show-center-play-btn
          object-fit="cover"
          @error="onVideoComponentError"
        />
        <text
          v-if="canSort() && !disabled"
          class="prop-media-sort__handle prop-media-sort__handle--video"
          @longpress.stop="onLongPress(i)"
        >≡</text>
        <text v-if="!disabled" class="prop-media-editor__del" @tap.stop="emit('remove', i)">×</text>
      </view>
      <text class="prop-media-editor__link" @tap="onPreviewVideo(url)">全屏播放</text>
    </view>
  </view>
</template>
