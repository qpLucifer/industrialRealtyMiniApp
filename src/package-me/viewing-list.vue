<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">带看台账</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="t">05-12 14:00–15:30</text>
        <text class="d">房源 #8821 · 客户张晨 · 陪同 陈思远/王敏\n反馈：层高满意，配电增容周期待业主书面确认。</text>
        <view class="chips">
          <ic-chip type="ok">已回填</ic-chip>
          <ic-chip type="plain">意向 B</ic-chip>
        </view>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
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
.t {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $ic-text;
}
.d {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
  white-space: pre-line;
}
.chips {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}
</style>
