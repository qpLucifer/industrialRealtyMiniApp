<template>
  <view class="page tab-page">
    <ic-top-bar>
      <template #left>
        <view>
          <text class="h1">我的</text>
          <text class="sub">账号 · 合规</text>
        </view>
      </template>
      <template #right>
        <text class="ghost" @tap="goSettings">设置</text>
      </template>
    </ic-top-bar>

    <scroll-view scroll-y class="tab-page__scroll">
      <ic-card glow>
        <view class="profile">
          <view class="avatar" />
          <view class="profile__txt">
            <text class="name">陈思远</text>
            <text class="line">业务员 · 华东事业部</text>
            <text class="line2">负责区域：黄埔区、增城区（不可跨区导出）</text>
          </view>
        </view>
      </ic-card>

      <text class="sec">常用入口</text>

      <view class="menu" @tap="goMyProps">
        <view class="menu__icon p" />
        <view class="menu__body">
          <text class="menu__t">我发布的房源</text>
          <text class="menu__d">已上架、待审核、驳回与草稿 · 与审核台状态一致</text>
        </view>
        <text class="chev">›</text>
      </view>

      <view class="menu" @tap="goVisitList">
        <view class="menu__icon v" />
        <view class="menu__body">
          <text class="menu__t">带看台账</text>
          <text class="menu__d">预约记录、回填与意向评级</text>
        </view>
        <text class="chev">›</text>
      </view>

      <view class="menu" @tap="goDeal">
        <view class="menu__icon d" />
        <view class="menu__body">
          <text class="menu__t">成交备案</text>
          <text class="menu__d">标的、佣金与财务字段</text>
        </view>
        <text class="chev">›</text>
      </view>

      <view class="menu" @tap="goSettings">
        <view class="menu__icon s" />
        <view class="menu__body">
          <text class="menu__t">隐私与安全</text>
          <text class="menu__d">脱敏、防复制与审核发布策略</text>
        </view>
        <ic-chip class="meta" type="ok">脱敏开</ic-chip>
        <text class="chev">›</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
function goSettings() {
  uni.navigateTo({ url: '/package-me/settings' })
}
function goMyProps() {
  uni.navigateTo({ url: '/package-me/my-properties' })
}
function goVisitList() {
  uni.navigateTo({ url: '/package-me/viewing-list' })
}
function goDeal() {
  uni.navigateTo({ url: '/package-me/deal-form' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.tab-page {
  min-height: 100vh;
  background: $ic-bg-deep;
}
.tab-page__scroll {
  height: calc(100vh - 120rpx);
  padding: 28rpx 28rpx 160rpx;
}
.h1 {
  font-size: 34rpx;
  font-weight: 600;
}
.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}
.profile {
  display: flex;
  align-items: center;
  gap: 28rpx;
}
.avatar {
  width: 116rpx;
  height: 116rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, $ic-cyan, #0891b2);
  flex-shrink: 0;
}
.name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ic-text;
}
.line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
}
.line2 {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.sec {
  display: block;
  margin: 32rpx 0 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.12em;
}
.menu {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 30rpx;
  border-radius: 32rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface;
  margin-bottom: 20rpx;
  box-shadow: $ic-shadow-md;
}
.menu__icon {
  width: 92rpx;
  height: 92rpx;
  border-radius: 28rpx;
  flex-shrink: 0;
}
.menu__icon.p {
  background: linear-gradient(145deg, rgba(14, 165, 233, 0.18), rgba(13, 148, 136, 0.12));
  border: 1rpx solid rgba(14, 165, 233, 0.28);
}
.menu__icon.v {
  background: linear-gradient(145deg, rgba(251, 191, 36, 0.22), rgba(253, 224, 71, 0.12));
  border: 1rpx solid rgba(251, 191, 36, 0.4);
}
.menu__icon.d {
  background: linear-gradient(145deg, rgba(52, 211, 153, 0.2), rgba(45, 212, 191, 0.1));
  border: 1rpx solid rgba(45, 212, 191, 0.35);
}
.menu__icon.s {
  background: linear-gradient(145deg, rgba(148, 163, 184, 0.25), rgba(226, 232, 240, 0.9));
  border: 1rpx solid rgba(100, 116, 139, 0.25);
}
.menu__body {
  flex: 1;
  min-width: 0;
}
.menu__t {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ic-text;
}
.menu__d {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.meta {
  margin: 0 8rpx 0 0;
}
.chev {
  color: $ic-muted;
  font-size: 40rpx;
}
</style>
