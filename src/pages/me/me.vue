<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchUserProfile, updateUserProfile } from '@/api/user'
import type { UserProfile } from '@/types/user'
import { uploadOssFile } from '@/utils/request'

const topBarInsetStyle = useTopBarInsetStyle()

const profile = ref<UserProfile | null>(null)
const avatarUploading = ref(false)

onMounted(async () => {
  profile.value = await fetchUserProfile()
})

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

async function onNicknameBlur(e: { detail?: { value?: string } }) {
  const nick = String(e.detail?.value || '').trim()
  if (!nick || !profile.value || nick === profile.value.wechatNickname) return
  try {
    const updated = await updateUserProfile({ nickName: nick })
    profile.value = updated
    uni.showToast({ title: '昵称已保存', icon: 'none' })
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '保存失败',
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">我的</view>
          <view class="sub">账号 · 资产 · 安全</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="profile" class="card me-profile-card">
          <!-- #ifdef MP-WEIXIN -->
          <button class="me-avatar-btn" open-type="chooseAvatar" :disabled="avatarUploading" @chooseavatar="onChooseAvatar">
            <image
              v-if="profile.avatarUrl"
              class="me-avatar-img"
              :src="profile.avatarUrl"
              mode="aspectFill"
            />
            <view v-else class="me-avatar-placeholder">{{ (profile.name || '?').slice(0, 1) }}</view>
          </button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="me-avatar-btn">
            <image
              v-if="profile.avatarUrl"
              class="me-avatar-img"
              :src="profile.avatarUrl"
              mode="aspectFill"
            />
            <view v-else class="me-avatar-placeholder">{{ (profile.name || '?').slice(0, 1) }}</view>
          </view>
          <!-- #endif -->
          <view class="me-profile-meta">
            <text class="me-profile-name">{{ profile.name }}</text>
            <text class="hint me-profile-line">{{ profile.roleLine }}</text>
            <text class="hint me-profile-line">{{ profile.regionLine }}</text>
            <view class="form-group me-nick-group">
              <text class="label">微信昵称（后台回显）</text>
              <input
                type="nickname"
                class="me-nick-input"
                :value="profile.wechatNickname || ''"
                placeholder="点击使用微信昵称"
                @blur="onNicknameBlur"
              />
            </view>
            <text v-if="profile.miniProgramOpenId" class="hint me-openid-line">OpenID 已绑定</text>
          </view>
        </view>
        <view class="section-title">常用入口</view>
        <view class="card list-item" @click="go('/pages/me/my-properties')">
          <view style="flex: 1">
            <text style="font-weight: 700">我的发布</text>
            <text class="hint" style="display: block; margin-top: 8rpx">草稿 / 待审 / 已上架</text>
          </view>
          <text style="color: var(--muted)">›</text>
        </view>
        <view class="card list-item" @click="go('/pages/viewing/list')">
          <view style="flex: 1">
            <text style="font-weight: 700">带看记录</text>
            <text class="hint" style="display: block; margin-top: 8rpx">日程与纪要</text>
          </view>
          <text style="color: var(--muted)">›</text>
        </view>
        <view class="card list-item" @click="go('/pages/video-faq/index')">
          <view style="flex: 1">
            <text style="font-weight: 700">视频话术库</text>
            <text class="hint" style="display: block; margin-top: 8rpx">验厂高频问答</text>
          </view>
          <text style="color: var(--muted)">›</text>
        </view>
        <view class="card list-item" @click="go('/pages/settings/settings')">
          <view style="flex: 1">
            <text style="font-weight: 700">安全与隐私</text>
            <text class="hint" style="display: block; margin-top: 8rpx">脱敏 · 复制 · 审核</text>
          </view>
          <text style="color: var(--muted)">›</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.me-profile-card {
  display: flex;
  gap: 28rpx;
  align-items: flex-start;
}

.me-avatar-btn {
  width: 120rpx;
  height: 120rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 36rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #e2e8f0;
  line-height: 1;
}

.me-avatar-btn::after {
  border: none;
}

.me-avatar-img,
.me-avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
}

.me-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: 700;
  color: #0f766e;
  background: #ccfbf1;
}

.me-profile-meta {
  flex: 1;
  min-width: 0;
}

.me-profile-name {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
}

.me-profile-line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.me-nick-group {
  margin-top: 16rpx;
  margin-bottom: 0;
}

.me-nick-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 72rpx;
  line-height: 1.5;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
}

.me-openid-line {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
}
</style>
