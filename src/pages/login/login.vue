<template>
  <view class="page login">
    <view class="login__body">
      <view class="login__logo" />
      <text class="login__brand">INDUSTRIAL CORE</text>
      <text class="login__sub">企业内部 · 厂房 / 土地 / 园区房源与客户闭环</text>
      <view class="login__spacer" />
      <text class="login__hint">
        须完成微信授权与手机号绑定；手机号不在白名单将无法进入。全程脱敏与操作留痕。
      </text>
      <button class="btn-primary" type="primary" @tap="onLoginTap">微信授权并绑定手机号</button>
      <text class="login__legal">登录即同意《保密协议》《内部数据安全规范》</text>
    </view>

    <view v-if="showGate" class="modal">
      <view class="modal__panel" @tap.stop>
        <text class="modal__title">双重校验通过</text>
        <text class="modal__desc">微信 OpenID 已绑定 · 手机号在白名单内 · 账号未停用。</text>
        <button class="btn-primary" type="primary" @tap="enterWorkbench">进入工作台</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { setLoggedIn } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const showGate = ref(false)

function onLoginTap() {
  showGate.value = true
}

function enterWorkbench() {
  showGate.value = false
  setLoggedIn(true)
  showToast('已登录 · 区域权限：黄埔区 / 增城区')
  uni.switchTab({ url: '/pages/home/home' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.login {
  min-height: 100vh;
  background: $ic-bg-deep;
  padding: 40rpx 48rpx 64rpx;
}

.login__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 90vh;
}

.login__logo {
  width: 184rpx;
  height: 184rpx;
  margin: 72rpx auto 40rpx;
  border-radius: 48rpx;
  border: 1rpx solid $ic-border;
  background: linear-gradient(145deg, rgba(20, 184, 166, 0.18), #ffffff);
  box-shadow: $ic-shadow-md;
}

.login__brand {
  text-align: center;
  font-size: 52rpx;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: $ic-text;
}

.login__sub {
  margin-top: 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: $ic-muted;
  line-height: 1.55;
}

.login__spacer {
  flex: 1;
}

.login__hint {
  text-align: center;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.55;
  margin-bottom: 24rpx;
}

.btn-primary {
  width: 100%;
  border-radius: 28rpx;
  padding: 26rpx 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
  border: none;
  @include ic-gradient-primary;
  box-shadow: 0 8rpx 24rpx rgba(13, 148, 136, 0.28);
}

.login__legal {
  margin-top: 28rpx;
  text-align: center;
  font-size: 22rpx;
  color: $ic-muted;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 32rpx;
  z-index: 1000;
}

.modal__panel {
  width: 100%;
  max-width: 720rpx;
  background: #ffffff;
  border-radius: 40rpx 40rpx 24rpx 24rpx;
  padding: 36rpx 32rpx 44rpx;
  border: 1rpx solid $ic-border;
  margin-bottom: 96rpx;
}

.modal__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ic-text;
  margin-bottom: 16rpx;
}

.modal__desc {
  display: block;
  font-size: 26rpx;
  color: $ic-muted;
  line-height: 1.55;
  margin-bottom: 36rpx;
}
</style>
