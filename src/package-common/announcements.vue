<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">公告</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="t">电费计价调整</text>
        <text class="d">全文略。支持弹窗、已读统计、按角色推送。</text>
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
}
</style>
