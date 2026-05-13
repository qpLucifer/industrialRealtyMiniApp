<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">操作日志</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <view class="tl">
        <view v-for="(it, i) in items" :key="i" class="tl__item">
          <text class="tl__t">{{ it.title }}</text>
          <text class="tl__b">{{ it.body }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { PROPERTY_LOG_ITEMS } from '@/mock/index.js'

const items = PROPERTY_LOG_ITEMS

function back() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.page {
  min-height: 100vh;
  background: $ic-bg-deep;
}
.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}
.center-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
}
.scroll {
  height: calc(100vh - 120rpx);
  padding: 28rpx;
}
.tl {
  border-left: 4rpx solid rgba(13, 148, 136, 0.35);
  padding-left: 22rpx;
}
.tl__item {
  margin-bottom: 22rpx;
}
.tl__t {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $ic-text;
}
.tl__b {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
</style>
