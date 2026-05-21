<script setup lang="ts">
import { ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchUserProfile, updateUserProfile } from '@/api/user'
import type { UserProfile } from '@/types/user'
import { uploadOssFile } from '@/utils/request'

const topBarInsetStyle = useTopBarInsetStyle()

const profile = ref<UserProfile | null>(null)
const profileLoading = ref(false)
const avatarUploading = ref(false)

const menuItems = [
  { title: '我的发布', hint: '草稿 / 待审 / 已上架', path: '/pages/me/my-properties', tone: 'mint' as const },
  { title: '带看记录', hint: '日程与纪要', path: '/pages/viewing/list', tone: 'slate' as const },
  { title: '视频话术库', hint: '验厂高频问答', path: '/pages/video-faq/index', tone: 'cyan' as const },
  { title: '安全与隐私', hint: '查看全站策略', path: '/pages/settings/settings', tone: 'slate' as const },
]

async function loadProfile() {
  profileLoading.value = true
  try {
    profile.value = await fetchUserProfile()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  } finally {
    profileLoading.value = false
  }
}

useTabPageShow(() => loadProfile(), { requireAuth: true })

function go(path: string) {
  uni.navigateTo({ url: path })
}

async function onChooseAvatar(e: { detail?: { avatarUrl?: string } }) {
  const path = e.detail?.avatarUrl
  if (!path) return
  avatarUploading.value = true
  try {
    const { url } = await uploadOssFile(path, 'miniapp/avatars')
    const updated = await updateUserProfile({ avatarUrl: url })
    profile.value = updated
    uni.showToast({ title: '头像已更新', icon: 'none' })
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '头像上传失败',
      icon: 'none',
    })
  } finally {
    avatarUploading.value = false
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab me-screen">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">我的</view>
          <view class="sub">账号 · 资产 · 安全</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll me-scroll">
        <view v-if="profileLoading && !profile" class="card">
          <text class="hint">加载中…</text>
        </view>
        <view v-else-if="profile" class="card card-glow me-hero">
          <view class="me-hero__accent" />
          <view class="me-hero__body">
            <view class="me-avatar-wrap">
              <!-- #ifdef MP-WEIXIN -->
              <button
                class="me-avatar-btn"
                open-type="chooseAvatar"
                :disabled="avatarUploading"
                @chooseavatar="onChooseAvatar"
              >
                <view class="me-avatar-ring">
                  <image
                    v-if="profile.avatarUrl"
                    class="me-avatar-img"
                    :src="profile.avatarUrl"
                    mode="aspectFill"
                  />
                  <view v-else class="me-avatar-placeholder">{{ (profile.name || '?').slice(0, 1) }}</view>
                </view>
              </button>
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
              <view class="me-avatar-btn me-avatar-btn--static">
                <view class="me-avatar-ring">
                  <image
                    v-if="profile.avatarUrl"
                    class="me-avatar-img"
                    :src="profile.avatarUrl"
                    mode="aspectFill"
                  />
                  <view v-else class="me-avatar-placeholder">{{ (profile.name || '?').slice(0, 1) }}</view>
                </view>
              </view>
              <!-- #endif -->
              <!-- #ifdef MP-WEIXIN -->
              <text class="me-avatar-tip">{{ avatarUploading ? '上传中…' : '点击更换头像' }}</text>
              <!-- #endif -->
            </view>
            <view class="me-hero__meta">
              <text class="me-hero__name">{{ profile.name }}</text>
              <view v-if="profile.roleLine" class="chip me-role-chip">{{ profile.roleLine }}</view>
              <text v-if="profile.employeeNo" class="hint me-hero__line">工号 {{ profile.employeeNo }}</text>
              <text class="hint me-hero__line me-region">{{ profile.regionLine }}</text>
            </view>
          </view>
        </view>

        <view class="section-title">常用入口</view>
        <view class="me-menu">
          <view
            v-for="item in menuItems"
            :key="item.path"
            class="card list-item me-menu-item"
            @click="go(item.path)"
          >
            <view class="me-menu-icon" :class="`me-menu-icon--${item.tone}`" />
            <view class="me-menu-text">
              <text class="me-menu-title">{{ item.title }}</text>
              <text class="hint me-menu-hint">{{ item.hint }}</text>
            </view>
            <text class="me-menu-chevron">›</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.me-screen {
  display: flex;
  flex-direction: column;
}

.me-scroll {
  flex: 1;
  min-height: 0;
  padding: 0 32rpx 48rpx;
  box-sizing: border-box;
}

.me-hero {
  position: relative;
  overflow: hidden;
  margin-top: 8rpx;
  margin-bottom: 32rpx;
  padding: 0;
}

.me-hero__accent {
  height: 8rpx;
  background: linear-gradient(90deg, #1a3a6c 0%, #4a6fa8 55%, #d4deed 100%);
}

.me-hero__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx 36rpx;
  text-align: center;
}

.me-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.me-avatar-btn {
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  line-height: 1;
}

.me-avatar-btn::after {
  border: none;
}

.me-avatar-ring {
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: linear-gradient(135deg, #1a3a6c, #4a6fa8, #c5d4e8);
  box-shadow: 0 12rpx 32rpx rgba(26, 58, 108, 0.22);
}

.me-avatar-img,
.me-avatar-placeholder {
  width: 156rpx;
  height: 156rpx;
  border-radius: 50%;
  display: block;
}

.me-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  font-weight: 700;
  color: #0f766e;
  background: #ecfdf5;
}

.me-avatar-tip {
  margin-top: 16rpx;
  font-size: 22rpx;
  color: var(--muted);
}

.me-hero__meta {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.me-hero__name {
  font-family: var(--display);
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text);
}

.me-role-chip {
  max-width: 100%;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
}

.me-hero__line {
  font-size: 24rpx;
  line-height: 1.5;
  max-width: 100%;
}

.me-region {
  padding: 0 12rpx;
}

.me-menu {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.me-menu-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 28rpx !important;
  margin-bottom: 0 !important;
}

.me-menu-item:active {
  opacity: 0.92;
  transform: scale(0.995);
}

.me-menu-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.me-menu-icon--mint {
  background: linear-gradient(145deg, #ccfbf1, #5eead4);
  box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.15);
}

.me-menu-icon--slate {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  box-shadow: 0 4rpx 12rpx rgba(71, 85, 105, 0.12);
}

.me-menu-icon--cyan {
  background: linear-gradient(145deg, #cffafe, #67e8f9);
  box-shadow: 0 4rpx 12rpx rgba(6, 182, 212, 0.15);
}

.me-menu-text {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.me-menu-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text);
}

.me-menu-hint {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.me-menu-chevron {
  flex-shrink: 0;
  font-size: 36rpx;
  color: var(--muted);
  line-height: 1;
}
</style>
