<script setup lang="ts">
import FollowAudioPlayer from '@/components/FollowAudioPlayer.vue'
import type { PropertyLogEntry } from '@/types/property'
import { formatTimelineLine } from '@/utils/beijingTime'
import { resolveMediaUrl } from '@/utils/request'

defineProps<{ entry: PropertyLogEntry }>()

function isReject(entry: PropertyLogEntry) {
  return /驳回/.test(`${entry.line} ${entry.sub}`)
}

function mediaSrc(url: string) {
  return resolveMediaUrl(url)
}

function previewImage(urls: string[], idx: number) {
  uni.previewImage({
    current: mediaSrc(urls[idx] || ''),
    urls: urls.map((u) => mediaSrc(u)),
  })
}
</script>

<template>
  <view class="prop-log-entry" :class="{ 'prop-log-entry--reject': isReject(entry) }">
    <text class="prop-log-entry__line">{{ entry.line }}</text>
    <text v-if="entry.kind === 'follow-up' && entry.displayLine" class="prop-log-entry__sub">
      {{ entry.displayLine }}
    </text>
    <text v-else-if="entry.sub" class="prop-log-entry__sub">{{ formatTimelineLine(entry.sub) }}</text>
    <text v-if="entry.kind === 'follow-up' && entry.note" class="prop-log-entry__note">{{ entry.note }}</text>
    <view v-if="entry.imageUrls?.length" class="prop-log-entry__images">
      <image
        v-for="(img, j) in entry.imageUrls"
        :key="img"
        :src="mediaSrc(img)"
        mode="aspectFill"
        class="prop-log-entry__img"
        @tap="previewImage(entry.imageUrls!, j)"
      />
    </view>
    <view v-if="entry.audioUrls?.length" class="prop-log-entry__audios">
      <FollowAudioPlayer
        v-for="(aud, j) in entry.audioUrls"
        :key="aud"
        :src="aud"
        :label="`语音 ${j + 1}`"
      />
    </view>
  </view>
</template>

<style scoped>
.prop-log-entry {
  padding: 8rpx 0;
}

.prop-log-entry__line {
  display: block;
  font-weight: 700;
  font-size: 28rpx;
  color: var(--text, #1e293b);
  line-height: 1.45;
}

.prop-log-entry--reject .prop-log-entry__line {
  color: #be123c;
}

.prop-log-entry__sub,
.prop-log-entry__note {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--muted, #64748b);
  line-height: 1.5;
}

.prop-log-entry__note {
  white-space: pre-wrap;
}

.prop-log-entry__images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.prop-log-entry__img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
}

.prop-log-entry__audios {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 16rpx;
}
</style>
