<script setup lang="ts">
import { ref } from 'vue'
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

const dragging = ref(false)
const dragFrom = ref(-1)
const dragOver = ref(-1)
let sortHintShown = false

function canSort() {
  return !props.disabled && props.urls.length > 1
}

function onLongPress(i: number) {
  if (!canSort()) return
  dragging.value = true
  dragFrom.value = i
  dragOver.value = i
  if (!sortHintShown) {
    sortHintShown = true
    uni.showToast({ title: '拖动到目标位置后松手', icon: 'none', duration: 1500 })
  }
  uni.vibrateShort?.({ type: 'light' })
}

function onCellTouchMove(i: number) {
  if (!dragging.value) return
  dragOver.value = i
}

function finishDrag() {
  if (!dragging.value) return
  const from = dragFrom.value
  const to = dragOver.value
  if (from >= 0 && to >= 0 && from !== to) emit('reorder', from, to)
  dragging.value = false
  dragFrom.value = -1
  dragOver.value = -1
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
    @touchend="finishDrag"
    @touchcancel="finishDrag"
  >
    <view
      v-for="(url, i) in urls"
      :key="'sort-img-' + i"
      class="prop-media-editor__cell prop-media-sort__cell"
      :class="{
        'prop-media-sort__cell--dragging': dragging && dragFrom === i,
        'prop-media-sort__cell--over': dragging && dragOver === i && dragFrom !== i,
      }"
      @longpress="onLongPress(i)"
      @touchmove.stop.prevent="onCellTouchMove(i)"
    >
      <image class="prop-media-editor__img" :src="url" mode="aspectFill" @click="onPreview(i)" />
      <text v-if="canSort() && !disabled" class="prop-media-sort__handle">≡</text>
      <text v-if="!disabled" class="prop-media-editor__del" @tap.stop="emit('remove', i)">×</text>
    </view>
  </view>

  <view
    v-else-if="kind === 'video' && urls.length"
    class="prop-media-editor__video-list prop-media-sort"
    @touchend="finishDrag"
    @touchcancel="finishDrag"
  >
    <view
      v-for="(url, i) in urls"
      :key="'sort-vid-' + i"
      class="prop-media-editor__video-block prop-media-sort__video-block"
      :class="{
        'prop-media-sort__cell--dragging': dragging && dragFrom === i,
        'prop-media-sort__cell--over': dragging && dragOver === i && dragFrom !== i,
      }"
      @longpress="onLongPress(i)"
      @touchmove.stop.prevent="onCellTouchMove(i)"
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
        <text v-if="canSort() && !disabled" class="prop-media-sort__handle prop-media-sort__handle--video">≡</text>
        <text v-if="!disabled" class="prop-media-editor__del" @tap.stop="emit('remove', i)">×</text>
      </view>
      <text class="prop-media-editor__link" @tap="onPreviewVideo(url)">全屏播放</text>
    </view>
  </view>
</template>
