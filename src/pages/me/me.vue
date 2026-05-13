<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchUserProfile } from '@/api/user'
import type { UserProfile } from '@/mock/data/user'

const topBarInsetStyle = useTopBarInsetStyle()

const profile = ref<UserProfile | null>(null)

onMounted(async () => {
  profile.value = await fetchUserProfile()
})

function go(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">我的</view>
          <view class="sub">账号 · 资产 · 安全</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view v-if="profile" class="card" style="display: flex; gap: 28rpx; align-items: center">
          <view class="thumb" style="width: 120rpx; height: 120rpx; border-radius: 36rpx" />
          <view style="flex: 1; min-width: 0">
            <text style="font-size: 17px; font-weight: 700">{{ profile.name }}</text>
            <text class="hint" style="display: block; margin-top: 8rpx">{{ profile.roleLine }}</text>
            <text class="hint" style="display: block; margin-top: 6rpx; font-size: 24rpx">{{ profile.regionLine }}</text>
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
