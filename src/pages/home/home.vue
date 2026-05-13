<template>
  <view class="page tab-page">
    <ic-top-bar>
      <template #left>
        <view>
          <text class="h1">工作台</text>
          <text class="sub">授权区域：黄埔区 · 增城区 · UID 900218</text>
        </view>
      </template>
      <template #right>
        <text class="ghost" @tap="goAnnounce">公告</text>
      </template>
    </ic-top-bar>

    <scroll-view scroll-y class="tab-page__scroll">
      <ic-card glow>
        <view class="row-between">
          <view>
            <text class="kicker">TODAY</text>
            <text class="hero-num">待跟进 <text class="mint">5</text></text>
          </view>
          <ic-chip type="warn">待审核 1</ic-chip>
        </view>
        <view class="remind">
          <text class="remind__strong">系统提醒</text>
          <text> · 今天 10:00 回访张晨（A 类）· 明天 14:00 台州星兔塑业跟进</text>
        </view>
        <view class="todo" @tap="openCustomer('zhangchen')">
          <view class="avatar avatar--a" />
          <view class="todo__mid">
            <text class="todo__title">今日待跟进 · 张晨</text>
            <text class="muted">A 类 · 明天 10:00 电话 · 黄埔/增城</text>
          </view>
          <text class="chev">›</text>
        </view>
        <view class="todo todo--mt" @tap="openCustomer('wangli')">
          <view class="avatar avatar--b" />
          <view class="todo__mid">
            <text class="todo__title">今日待跟进 · 王莉</text>
            <text class="muted">C 类 · 周五 14:00 · 台州星兔塑业</text>
          </view>
          <text class="chev">›</text>
        </view>
        <view class="stats">
          <view class="stat">
            <text class="stat__n">128</text>
            <text class="stat__l">可租房源</text>
          </view>
          <view class="stat">
            <text class="stat__n">42</text>
            <text class="stat__l">意向客户</text>
          </view>
          <view class="stat">
            <text class="stat__n">7</text>
            <text class="stat__l">本周带看</text>
          </view>
        </view>
      </ic-card>

      <view class="row-actions">
        <button class="btn-half primary" @tap="newProperty">＋ 发布房源</button>
        <button class="btn-half secondary" @tap="newCustomer">＋ 新建客户</button>
      </view>

      <text class="sec-title">公告 · 策略</text>
      <ic-card @tap="goAnnounce">
        <view class="row-between">
          <text class="strong">园区电费计价规则调整</text>
          <ic-chip type="warn">必读</ic-chip>
        </view>
        <text class="muted mt">自 6 月起执行分时电价，对内公示，禁止外链。</text>
        <text class="tiny mt2">今天 09:30 · 行政部</text>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/utils/storage.js'
import { setCustomerDetailId } from '@/utils/storage.js'

onShow(() => {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})

function goAnnounce() {
  uni.navigateTo({ url: '/package-common/announcements' })
}

function openCustomer(id) {
  setCustomerDetailId(id)
  uni.navigateTo({ url: '/package-customer/detail' })
}

function newProperty() {
  uni.navigateTo({ url: '/package-property/publish?mode=new' })
}

function newCustomer() {
  uni.navigateTo({ url: '/package-customer/form' })
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
  display: block;
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

.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
  padding: 8rpx 12rpx;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.kicker {
  display: block;
  font-size: 22rpx;
  color: $ic-cyan;
  letter-spacing: 0.12em;
}

.hero-num {
  display: block;
  margin-top: 10rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: $ic-text;
}

.mint {
  color: $ic-mint;
}

.remind {
  margin-top: 28rpx;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
  font-size: 24rpx;
  color: $ic-text;
  line-height: 1.45;
}

.remind__strong {
  color: $ic-amber;
  font-weight: 700;
}

.todo {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.todo--mt {
  margin-top: 16rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.avatar--a {
  background: linear-gradient(135deg, #0d9488, #14b8a6);
}

.avatar--b {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}

.todo__mid {
  flex: 1;
  min-width: 0;
}

.todo__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $ic-text;
}

.muted {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}

.chev {
  color: $ic-muted;
  font-size: 40rpx;
}

.stats {
  margin-top: 36rpx;
  display: flex;
  justify-content: space-between;
  text-align: center;
}

.stat__n {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $ic-text;
}

.stat__l {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $ic-muted;
}

.row-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.btn-half {
  flex: 1;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 700;
  padding: 22rpx 12rpx;
}

.btn-half.primary {
  color: #fff;
  border: none;
  @include ic-gradient-primary;
}

.btn-half.secondary {
  color: $ic-mint;
  background: #f8fafc;
  border: 1rpx solid rgba(52, 211, 153, 0.35);
}

.sec-title {
  display: block;
  margin: 8rpx 0 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.12em;
}

.strong {
  font-size: 30rpx;
  font-weight: 700;
  color: $ic-text;
}

.mt {
  margin-top: 12rpx;
}

.mt2 {
  margin-top: 16rpx;
  font-size: 22rpx;
  color: $ic-muted;
}

.tiny {
  font-size: 22rpx;
  color: $ic-muted;
}
</style>
