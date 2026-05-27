<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  miniLoginByPhoneDigits,
  miniLoginByReviewerPhoneDigits,
  miniLoginByWechatPhoneCode,
} from '@/api/auth'
import type { MiniLoginResult } from '@/types/auth'
import { isIndustrialMiniSessionToken } from '@/utils/miniSessionToken'

const loading = ref(false)
const manualPhone = ref('')
const reviewerPhone = ref('')
const agreed = ref(false)
const reviewerEntryVisible = ref(false)

const SECRET_TAP_GOAL = 5
const SECRET_TAP_WINDOW_MS = 2500
let secretTapCount = 0
let secretTapWindowStart = 0

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const phoneFallbackEnabled = (import.meta.env.VITE_MINI_LOGIN_PHONE_FALLBACK ?? 'false') === 'true'

const canLogin = computed(() => agreed.value && !loading.value)

const LOGO_SRC = '/static/brand/logo.png'

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

function warnAgree() {
  uni.showToast({ title: '请先勾选「我已知晓」', icon: 'none' })
}

async function onGetPhoneNumber(e: { detail?: Record<string, unknown> }) {
  if (!agreed.value) {
    warnAgree()
    return
  }
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
  if (!agreed.value) {
    warnAgree()
    return
  }
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

function toggleAgree() {
  agreed.value = !agreed.value
}

function onSecretAreaTap() {
  const now = Date.now()
  if (!secretTapWindowStart || now - secretTapWindowStart > SECRET_TAP_WINDOW_MS) {
    secretTapWindowStart = now
    secretTapCount = 1
  } else {
    secretTapCount += 1
  }
  if (secretTapCount >= SECRET_TAP_GOAL) {
    secretTapCount = 0
    secretTapWindowStart = 0
    reviewerEntryVisible.value = true
    uni.showToast({ title: '审核员登录', icon: 'none', duration: 1200 })
  }
}

async function onReviewerPhoneLogin() {
  if (!agreed.value) {
    warnAgree()
    return
  }
  const d = reviewerPhone.value.replace(/\D/g, '')
  if (d.length !== 11 || !/^1\d{10}$/.test(d)) {
    uni.showToast({ title: '请输入 11 位大陆手机号', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const r = await miniLoginByReviewerPhoneDigits(d)
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
  <view class="login-page" @tap="onSecretAreaTap">
    <view class="login-page__bg" aria-hidden="true" />
    <view class="login-page__body">
      <view class="login-hero">
        <view class="login-hero__logo-wrap">
          <image class="login-hero__logo" :src="LOGO_SRC" mode="aspectFit" />
        </view>
        <text class="login-hero__name">浙江企鹏工业地产</text>
        <text class="login-hero__tag">企业内部 · 厂房 / 土地 / 园区</text>
      </view>

      <view class="login-card" @tap.stop>
        <text class="login-card__lead">使用微信授权手机号登录，号码须在后台白名单且与员工档案一致。</text>

        <view class="login-agree" @tap="toggleAgree">
          <view class="login-agree__box" :class="{ 'login-agree__box--on': agreed }">
            <text v-if="agreed" class="login-agree__tick">✓</text>
          </view>
          <text class="login-agree__text">我已知晓并同意使用本系统处理业务数据</text>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <button
          v-if="canLogin"
          class="login-btn login-btn--primary"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          微信手机号快捷登录
        </button>
        <button v-else class="login-btn login-btn--primary login-btn--ghost" @tap="warnAgree">
          微信手机号快捷登录
        </button>
        <!-- #endif -->

        <!-- #ifndef MP-WEIXIN -->
        <view class="login-card__note">请在微信开发者工具或真机预览中使用小程序登录。</view>
        <!-- #endif -->

        <view v-if="reviewerEntryVisible" class="login-reviewer">
          <text class="login-reviewer__title">审核员登录</text>
          <text class="login-reviewer__hint">手机号须在后台「白名单」且与「员工与账号」中档案一致</text>
          <input
            v-model="reviewerPhone"
            type="number"
            maxlength="11"
            placeholder="11 位手机号"
            class="login-reviewer__input"
            :adjust-position="false"
            :cursor-spacing="80"
          />
          <button class="login-btn login-btn--reviewer" :disabled="loading" @click="onReviewerPhoneLogin">
            手机号登录
          </button>
        </view>

        <view v-if="phoneFallbackEnabled" class="login-dev">
          <input
            v-model="manualPhone"
            type="number"
            maxlength="11"
            placeholder="开发：11 位手机号"
            class="login-dev__input"
            :adjust-position="false"
            :cursor-spacing="80"
          />
          <button class="login-btn login-btn--secondary" :disabled="loading" @click="onManualPhoneLogin">
            开发模式登录
          </button>
        </view>
      </view>

      <text class="login-foot">© 浙江企鹏工业地产</text>
    </view>
  </view>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  background: #f0f4fa;
  overflow: hidden;
}

.login-page__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(26, 58, 108, 0.14), transparent 55%),
    linear-gradient(165deg, #f8fafc 0%, #eef2f8 48%, #e8eef6 100%);
  pointer-events: none;
}

.login-page__body {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: calc(48rpx + env(safe-area-inset-top)) 40rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.login-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0 40rpx;
}

.login-hero__logo-wrap {
  width: 280rpx;
  height: 280rpx;
  border-radius: 32rpx;
  background: #fff;
  box-shadow: 0 16rpx 48rpx rgba(26, 58, 108, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  box-sizing: border-box;
}

.login-hero__logo {
  width: 100%;
  height: 100%;
}

.login-hero__name {
  margin-top: 36rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a3a6c;
  letter-spacing: 0.04em;
  text-align: center;
}

.login-hero__tag {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #64748b;
  text-align: center;
}

.login-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 40rpx 36rpx 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid rgba(26, 58, 108, 0.06);
}

.login-card__lead {
  display: block;
  font-size: 26rpx;
  line-height: 1.55;
  color: #64748b;
  margin-bottom: 32rpx;
}

.login-card__note {
  font-size: 26rpx;
  color: #94a3b8;
  line-height: 1.5;
  text-align: center;
}

.login-agree {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.login-agree__box {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  border-radius: 10rpx;
  border: 2rpx solid #94a3b8;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-top: 4rpx;
}

.login-agree__box--on {
  background: #1a3a6c;
  border-color: #1a3a6c;
}

.login-agree__tick {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
}

.login-agree__text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.5;
  color: #334155;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  margin: 0;
  padding: 0;
}

.login-btn--primary {
  background: linear-gradient(135deg, #1a3a6c 0%, #2d4f8c 100%);
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(26, 58, 108, 0.28);
}

.login-btn--ghost {
  opacity: 0.55;
  box-shadow: none;
}

.login-btn--secondary {
  margin-top: 16rpx;
  background: #f1f5f9;
  color: #334155;
}

.login-reviewer {
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx dashed #cbd5e1;
}

.login-reviewer__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8rpx;
}

.login-reviewer__hint {
  display: block;
  font-size: 24rpx;
  line-height: 1.5;
  color: #94a3b8;
  margin-bottom: 20rpx;
}

.login-reviewer__input {
  width: 100%;
  min-height: 88rpx;
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  font-size: 28rpx;
  box-sizing: border-box;
}

.login-btn--reviewer {
  background: #475569;
  color: #fff;
}

.login-dev {
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid #e2e8f0;
}

.login-dev__input {
  width: 100%;
  min-height: 88rpx;
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  font-size: 28rpx;
  box-sizing: border-box;
}

.login-foot {
  display: block;
  text-align: center;
  margin-top: 32rpx;
  font-size: 22rpx;
  color: #94a3b8;
}
</style>
