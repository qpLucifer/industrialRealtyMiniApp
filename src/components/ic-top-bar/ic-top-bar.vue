<template>
  <view class="ic-top" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="ic-top__row">
      <view class="ic-top__left">
        <slot name="left" />
      </view>
      <view class="ic-top__center">
        <slot name="center" />
      </view>
      <view class="ic-top__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'

const statusBarHeight = ref(20)

onMounted(() => {
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';

.ic-top {
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1rpx solid $ic-border;
}

.ic-top__row {
  min-height: 88rpx;
  padding: 12rpx 24rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ic-top__left,
.ic-top__right {
  flex-shrink: 0;
}

.ic-top__center {
  flex: 1;
  min-width: 0;
}
</style>
