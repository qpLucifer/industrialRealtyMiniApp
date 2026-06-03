<script setup lang="ts">
import { computed } from 'vue'
import { followMediaSummary } from '@/utils/followMediaSummary'

const props = defineProps<{
  expanded: boolean
  imageCount: number
  audioCount: number
}>()

defineEmits<{ toggle: [] }>()

const summary = computed(() => followMediaSummary(props.imageCount, props.audioCount))
const hasMedia = computed(() => props.imageCount > 0 || props.audioCount > 0)
</script>

<template>
  <view v-if="hasMedia" class="follow-media-panel">
    <view class="follow-media-panel__toggle" @tap="$emit('toggle')">
      <text class="follow-media-panel__text">
        {{ expanded ? '收起附件' : `展开附件（${summary}）` }}
      </text>
      <text class="follow-media-panel__chevron">{{ expanded ? '▲' : '▼' }}</text>
    </view>
    <view v-if="expanded" class="follow-media-panel__body">
      <slot />
    </view>
  </view>
</template>

<style scoped>
.follow-media-panel {
  margin-top: 16rpx;
}

.follow-media-panel__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 14rpx 18rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  border: 1rpx solid rgba(15, 23, 42, 0.06);
}

.follow-media-panel__text {
  font-size: 24rpx;
  color: #1a3a6c;
  font-weight: 500;
}

.follow-media-panel__chevron {
  flex-shrink: 0;
  font-size: 20rpx;
  color: #64748b;
}

.follow-media-panel__body {
  margin-top: 12rpx;
}
</style>
