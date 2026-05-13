<template>
  <view class="ic-card" :class="{ 'ic-card--glow': glow }">
    <slot />
  </view>
</template>

<script setup>
defineProps({
  glow: { type: Boolean, default: false },
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';

.ic-card {
  @include ic-card-base;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
}

.ic-card--glow {
  border-color: rgba(13, 148, 136, 0.2);
  box-shadow:
    0 0 0 1rpx rgba(13, 148, 136, 0.08),
    $ic-shadow-md;
}
</style>
