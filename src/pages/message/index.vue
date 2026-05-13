<template>
  <view class="page tab-page">
    <ic-top-bar>
      <template #left>
        <view>
          <text class="h1">消息中心</text>
          <text class="sub">审核 · 公告 · 风险</text>
        </view>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="tab-page__scroll">
      <view class="li" @tap="toProp('P-7730')">
        <view class="ico warn">审</view>
        <view class="mid">
          <text class="t">房源待审核</text>
          <text class="d">#P-7730 花都汽车城 · 独门独院 · 已排队，处理后将推送结果。</text>
          <text class="m">今天 08:40 · 管理员</text>
        </view>
        <text class="chev">›</text>
      </view>
      <view class="li" @tap="toProp('P-REJECT-001')">
        <view class="ico danger">驳</view>
        <view class="mid">
          <text class="t">房源被驳回 · 请修改后重提</text>
          <text class="d">#P-REJECT-001 南沙万顷沙 · 配电描述与照片不一致。</text>
          <text class="m">昨天 17:20 · 审核台</text>
        </view>
        <text class="chev">›</text>
      </view>
      <view class="li" @tap="toCust">
        <view class="ico ok">跟</view>
        <view class="mid">
          <text class="t">今日待跟进 · 张晨（A）</text>
          <text class="d">明天 10:00 电话回访 · 与首页待办同源。</text>
          <text class="m">系统 · 任务中心</text>
        </view>
        <text class="chev">›</text>
      </view>
      <view class="li" @tap="toProp('P-8821')">
        <view class="ico blue">✓</view>
        <view class="mid">
          <text class="t">房源审核通过</text>
          <text class="d">#P-8821 黄埔科学城 · 已上架，客户侧可见。</text>
          <text class="m">昨天 11:05 · 审核台</text>
        </view>
        <text class="chev">›</text>
      </view>
      <view class="li" @tap="goAnnounce">
        <view class="ico plain">📣</view>
        <view class="mid">
          <text class="t">培训通知 · 新业务报备</text>
          <text class="d">周五 15:00 · 内训频道</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { setPropertyDetailId, setCustomerDetailId } from '@/utils/storage.js'

function toProp(id) {
  setPropertyDetailId(id)
  uni.navigateTo({ url: '/package-property/detail?id=' + encodeURIComponent(id) })
}

function toCust() {
  setCustomerDetailId('zhangchen')
  uni.navigateTo({ url: '/package-customer/detail' })
}

function goAnnounce() {
  uni.navigateTo({ url: '/package-common/announcements' })
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
.li {
  display: flex;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $ic-border;
  align-items: center;
}
.ico {
  width: 84rpx;
  height: 84rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  flex-shrink: 0;
}
.ico.warn {
  background: rgba(251, 191, 36, 0.15);
  border: 1rpx solid rgba(251, 191, 36, 0.35);
  color: #b45309;
}
.ico.danger {
  background: rgba(244, 63, 94, 0.12);
  border: 1rpx solid rgba(244, 63, 94, 0.35);
  color: #be123c;
}
.ico.ok {
  background: rgba(52, 211, 153, 0.15);
  border: 1rpx solid rgba(52, 211, 153, 0.35);
  color: #047857;
}
.ico.blue {
  background: rgba(14, 165, 233, 0.12);
  border: 1rpx solid rgba(14, 165, 233, 0.3);
  color: $ic-cyan;
}
.ico.plain {
  background: rgba(14, 165, 233, 0.12);
  border: 1rpx solid $ic-border;
}
.mid {
  flex: 1;
  min-width: 0;
}
.t {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $ic-text;
}
.d {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.m {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.chev {
  color: $ic-muted;
  font-size: 40rpx;
}
</style>
