<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchVideoFaqList } from '@/api/extra'
import type { VideoFaqItem } from '@/mock/data/videoFaq'

const topBarInsetStyle = useTopBarInsetStyle()
const list = ref<VideoFaqItem[]>([])

onMounted(async () => {
  const r = await fetchVideoFaqList()
  list.value = r.list
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}

function play() {
  uni.showToast({ title: '正式版可接视频点播', icon: 'none' })
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">视频话术</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view v-for="v in list" :key="v.id" class="card" style="margin-bottom: 24rpx" @click="play">
          <text style="font-size: 22rpx; color: var(--muted)">{{ v.meta }}</text>
          <text style="display: block; margin-top: 12rpx; font-size: 30rpx; font-weight: 700">{{ v.title }}</text>
          <text class="hint" style="display: block; margin-top: 12rpx; line-height: 1.55">{{ v.summary }}</text>
          <text style="display: block; margin-top: 12rpx; font-size: 24rpx; color: var(--cyan)">关键词：{{ v.keywords }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
