<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { miniLoginByPhoneDigits, miniLoginByWechatPhoneCode } from '@/api/auth'
import type { MiniLoginResult } from '@/types/auth'
import { isIndustrialMiniSessionToken } from '@/utils/miniSessionToken'

const loading = ref(false)
const manualPhone = ref('')

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

/** DevTools / H5: type phone when WeChat phone API unavailable */
const phoneFallbackEnabled = (import.meta.env.VITE_MINI_LOGIN_PHONE_FALLBACK ?? 'false') === 'true'

function persistSession(r: MiniLoginResult) {
  if (!USE_MOCK && !isIndustrialMiniSessionToken(r.token)) {
    uni.showToast({
      title: '令牌格式不对，请清除缓存并确认 VITE_API_BASE 指向本项目 API',
      icon: 'none',
      duration: 4000,
    })
    throw new Error('INVALID_MINI_SESSION_TOKEN_SHAPE')
  }
  uni.setStorageSync('mini_token', r.token)
  if (r.expiresAt) uni.setStorageSync('mini_session_expires_at', r.expiresAt)
  try {
    uni.setStorageSync('mini_profile_json', JSON.stringify(r.profile ?? {}))
  } catch {
    /* ignore */
  }
}

function toastAfterLogin(r: MiniLoginResult) {
  const reg = r.profile?.regionLine || '负责区域未配置'
  const short = reg.length > 22 ? `${reg.slice(0, 22)}…` : reg
  uni.showToast({ title: `已登录 · ${short}`, icon: 'none', duration: 2200 })
}

async function onGetPhoneNumber(e: { detail?: Record<string, unknown> }) {
  const detail = (e.detail || {}) as { errMsg?: string; code?: string; errno?: number }
  if (detail.errMsg !== 'getPhoneNumber:ok') {
    const deny = String(detail.errMsg || '').includes('deny') || detail.errno === 1400001
    uni.showToast({ title: deny ? '需要授权手机号才能登录' : '获取手机号失败', icon: 'none' })
    return
  }
  const code = detail.code
  if (!code || typeof code !== 'string') {
    uni.showToast({
      title: '请升级微信或开启后端手机号换取；开发模式可用手动手机号',
      icon: 'none',
      duration: 3200,
    })
    return
  }
  loading.value = true
  try {
    const r = await miniLoginByWechatPhoneCode(code)
    persistSession(r)
    toastAfterLogin(r)
    uni.reLaunch({ url: '/pages/home/home' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '登录失败'
    uni.showToast({ title: msg.length > 36 ? `${msg.slice(0, 36)}…` : msg, icon: 'none', duration: 2800 })
  } finally {
    loading.value = false
  }
}

async function onManualPhoneLogin() {
  const d = manualPhone.value.replace(/\D/g, '')
  if (d.length !== 11 || !/^1\d{10}$/.test(d)) {
    uni.showToast({ title: '请输入 11 位大陆手机号', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const r = await miniLoginByPhoneDigits(d)
    persistSession(r)
    toastAfterLogin(r)
    uni.reLaunch({ url: '/pages/home/home' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '登录失败'
    uni.showToast({ title: msg.length > 36 ? `${msg.slice(0, 36)}…` : msg, icon: 'none', duration: 2800 })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const t = uni.getStorageSync('mini_token')
  if (!t) return
  if (!USE_MOCK && typeof t === 'string' && !isIndustrialMiniSessionToken(t)) {
    uni.removeStorageSync('mini_token')
    uni.removeStorageSync('mini_session_expires_at')
    uni.removeStorageSync('mini_profile_json')
    return
  }
  uni.reLaunch({ url: '/pages/home/home' })
})
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
          >使用微信授权手机号登录；号码须在后台白名单且与员工档案一致。全程脱敏与操作留痕。</view
        >
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="btn-primary"
          open-type="getPhoneNumber"
          :disabled="loading"
          @getphonenumber="onGetPhoneNumber"
        >
          {{ loading ? '登录中…' : '授权手机号并登录' }}
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="hint" style="text-align: center; margin-bottom: 12px">
          当前不是微信小程序运行时，无法拉起手机号授权。请在微信开发者工具/真机预览中使用小程序；或在下方开启回落用手机号（仅开发）。
        </view>
        <!-- #endif -->

        <view v-if="phoneFallbackEnabled" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(15, 23, 42, 0.08)">
          <view class="hint" style="margin-bottom: 8px">开发回落 · 直传手机号（勿用于正式发布）</view>
          <input
            v-model="manualPhone"
            type="number"
            maxlength="11"
            placeholder="11 位手机号"
            style="padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(15, 23, 42, 0.12); margin-bottom: 10px"
          />
          <button class="btn" :disabled="loading" @click="onManualPhoneLogin">用手动手机号登录</button>
        </view>

        <view class="hint" style="text-align: center; font-size: 11px; margin-top: 14px"
          >登录即同意《保密协议》《内部数据安全规范》</view
        >
      </view>
    </view>
  </view>
</template>
