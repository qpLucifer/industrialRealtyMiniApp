<script setup lang="ts">
import FollowAudioPlayer from '@/components/FollowAudioPlayer.vue'
import FollowEntryMediaPanel from '@/components/FollowEntryMediaPanel.vue'
import type { CustomerFollowEntry } from '@/types/customer'
import { hasFollowMedia } from '@/utils/followMediaSummary'
import { resolveMediaUrl } from '@/utils/request'

const props = defineProps<{
  entry: CustomerFollowEntry
  mediaExpanded?: boolean
}>()

defineEmits<{ 'toggle-media': [] }>()

function mediaSrc(url: string) {
  return resolveMediaUrl(url)
}

function previewImage(urls: string[], idx: number) {
  uni.previewImage({
    current: mediaSrc(urls[idx] || ''),
    urls: urls.map((u) => mediaSrc(u)),
  })
}

const imageCount = () => props.entry.imageUrls?.length ?? 0
const audioCount = () => props.entry.audioUrls?.length ?? 0
</script>

<template>
  <view class="timeline-item">
    <text class="timeline-line">{{ entry.displayLine }}</text>
    <FollowEntryMediaPanel
      v-if="hasFollowMedia(entry.imageUrls, entry.audioUrls)"
      :expanded="!!mediaExpanded"
      :image-count="imageCount()"
      :audio-count="audioCount()"
      @toggle="$emit('toggle-media')"
    >
      <view v-if="entry.imageUrls.length" class="timeline-images">
        <image
          v-for="(img, j) in entry.imageUrls"
          :key="img"
          :src="mediaSrc(img)"
          mode="aspectFill"
          class="timeline-img"
          @tap="previewImage(entry.imageUrls, j)"
        />
      </view>
      <view v-if="entry.audioUrls.length" class="timeline-audios">
        <FollowAudioPlayer
          v-for="(aud, j) in entry.audioUrls"
          :key="`${j}-${aud}`"
          :src="aud"
          :label="`语音 ${j + 1}`"
        />
      </view>
    </FollowEntryMediaPanel>
  </view>
</template>

<style scoped>
.timeline-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.timeline-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
}

.timeline-audios {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 12rpx;
}

.timeline-audios:first-child {
  margin-top: 0;
}
</style>
