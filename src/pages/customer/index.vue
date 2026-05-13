<template>
  <view class="page tab-page">
    <ic-top-bar>
      <template #left>
        <view>
          <text class="h1">客户池</text>
          <text class="sub">私有优先 · ABC 分级 · 提醒联动</text>
        </view>
      </template>
      <template #right>
        <view class="right-actions">
          <text class="ghost" @tap="goVideo">视频答疑</text>
          <text class="ghost" @tap="goNew">新建</text>
        </view>
      </template>
    </ic-top-bar>

    <scroll-view scroll-y class="tab-page__scroll">
      <view class="seg">
        <text class="seg__btn seg__btn--on">我的私有</text>
        <text class="seg__btn">公司公有</text>
      </view>
      <view class="search">
        <input class="search__input" type="text" placeholder="公司 / 手机尾号 / 姓名 / 区域 / 标签…" />
      </view>
      <view class="chips">
        <ic-chip :on="true">刚需</ic-chip>
        <ic-chip>投资</ic-chip>
        <ic-chip>急租</ic-chip>
        <ic-chip>急购</ic-chip>
        <ic-chip>大客户</ic-chip>
        <ic-chip>外地</ic-chip>
      </view>

      <view class="li" @tap="open('zhangchen')">
        <view class="avatar a" />
        <view class="li__body">
          <view class="row-between">
            <view class="min0">
              <text class="co">广州××电子装配有限公司</text>
              <text class="name">张晨 · 求租 · 139****9024</text>
            </view>
            <ic-chip type="ok">A 类</ic-chip>
          </view>
          <text class="muted">最近：接受半年付，需业主消防协助书面。</text>
          <text class="warnline">下次沟通 明天 10:00 · 黄埔/增城</text>
        </view>
      </view>

      <view class="li" @tap="open('wangli')">
        <view class="avatar b" />
        <view class="li__body">
          <view class="row-between">
            <view class="min0">
              <text class="co">台州星兔塑业有限公司</text>
              <text class="name">王莉 · 求租 · 0576****7707</text>
            </view>
            <ic-chip type="neutral">C 类</ic-chip>
          </view>
          <text class="muted">最近：暂不考虑，节后回访；已发 11 亩厂房备选资料。</text>
          <text class="warnline">下次沟通 周五 14:00</text>
        </view>
      </view>
    </scroll-view>

    <view class="fab" @tap="goNew">＋</view>
  </view>
</template>

<script setup>
import { setCustomerDetailId } from '@/utils/storage.js'

function open(id) {
  setCustomerDetailId(id)
  uni.navigateTo({ url: '/package-customer/detail' })
}

function goNew() {
  uni.navigateTo({ url: '/package-customer/form' })
}

function goVideo() {
  uni.navigateTo({ url: '/package-customer/video-faq' })
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
  padding: 28rpx 28rpx 200rpx;
}
.h1 {
  font-size: 34rpx;
  font-weight: 600;
  color: $ic-text;
}
.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.right-actions {
  display: flex;
  gap: 12rpx;
}
.ghost {
  color: $ic-mint;
  font-size: 24rpx;
  font-weight: 600;
  padding: 8rpx 10rpx;
}
.seg {
  display: flex;
  background: #f1f5f9;
  border-radius: 24rpx;
  padding: 8rpx;
  border: 1rpx solid $ic-border;
  margin-bottom: 24rpx;
}
.seg__btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  border-radius: 20rpx;
  font-weight: 600;
}
.seg__btn--on {
  background: #fff;
  color: $ic-mint;
}
.search {
  margin-bottom: 20rpx;
}
.search__input {
  width: 100%;
  padding: 22rpx 26rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12rpx;
}
.li {
  display: flex;
  gap: 22rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $ic-border;
}
.avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 28rpx;
  flex-shrink: 0;
}
.avatar.a {
  background: linear-gradient(135deg, #0d9488, #14b8a6);
}
.avatar.b {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}
.li__body {
  flex: 1;
  min-width: 0;
}
.row-between {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: flex-start;
}
.min0 {
  min-width: 0;
}
.co {
  display: block;
  font-size: 24rpx;
  color: $ic-muted;
}
.name {
  display: block;
  margin-top: 6rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: $ic-text;
}
.muted {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.warnline {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $ic-amber;
}
.fab {
  position: fixed;
  right: 36rpx;
  bottom: 200rpx;
  width: 108rpx;
  height: 108rpx;
  border-radius: 36rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  z-index: 20;
  @include ic-gradient-primary;
  box-shadow: 0 14rpx 36rpx rgba(20, 184, 166, 0.35);
}
</style>
