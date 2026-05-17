<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchAnnouncementList } from '@/api/message'

const topBarInsetStyle = useTopBarInsetStyle()
const list = ref<{ title: string; body: string }[]>([])

onMounted(async () => {
  const r = await fetchAnnouncementList()
  list.value = r.list
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/home' }) })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">公告</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-for="(a, i) in list" :key="i" class="card" style="margin-bottom: 24rpx">
          <text style="font-size: 30rpx; font-weight: 700">{{ a.title }}</text>
          <text class="hint" style="display: block; margin-top: 16rpx; line-height: 1.55">{{ a.body }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
