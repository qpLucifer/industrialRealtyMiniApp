<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loginApi } from '@/api/home'

const showWhitelist = ref(false)

onMounted(() => {
  if (uni.getStorageSync('mini_token')) {
    uni.reLaunch({ url: '/pages/home/home' })
  }
})

function onWechatLogin() {
  showWhitelist.value = true
}

async function enterApp() {
  showWhitelist.value = false
  const r = await loginApi()
  uni.setStorageSync('mini_token', r.token)
  uni.showToast({ title: '已登录 · 区域权限：黄埔区 / 增城区', icon: 'none' })
  uni.reLaunch({ url: '/pages/home/home' })
}
</script>

<template>
  <view class="app-shell">
    <view
      class="screen active"
      style="display: flex; flex-direction: column; min-height: 100vh; height: 100vh; max-height: 100vh; overflow: hidden"
    >
      <view style="padding: 20px 24px 32px; flex: 1; min-height: 0; display: flex; flex-direction: column">
        <view class="login-logo" aria-hidden="true">
          <text style="font-size: 48px; line-height: 1; color: #0d9488">◆</text>
        </view>
        <view class="hero-brand">INDUSTRIAL CORE</view>
        <view style="text-align: center; color: var(--muted); font-size: 13px; margin-top: 10px"
          >企业内部 · 厂房 / 土地 / 园区房源与客户闭环</view
        >
        <view style="flex: 1" />
        <view class="hint" style="text-align: center; margin-bottom: 12px"
          >须完成微信授权与手机号绑定；手机号不在白名单将无法进入。全程脱敏与操作留痕。</view
        >
        <button class="btn-primary" @click="onWechatLogin">微信授权并绑定手机号</button>
        <view class="hint" style="text-align: center; font-size: 11px; margin-top: 14px"
          >登录即同意《保密协议》《内部数据安全规范》</view
        >
      </view>
    </view>

    <view v-if="showWhitelist" class="modal-overlay show" @click.self="showWhitelist = false">
      <view class="modal-sheet" style="border-radius: 40rpx; margin-bottom: 96rpx" @click.stop>
        <view style="margin-bottom: 16rpx; font-weight: 700">双重校验通过</view>
        <text class="hint">微信 OpenID 已绑定 · 手机号在白名单内 · 账号未停用。</text>
        <button class="btn-primary" style="margin-top: 36rpx" @click="enterApp">进入工作台</button>
      </view>
    </view>
  </view>
</template>
