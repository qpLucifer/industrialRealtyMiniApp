<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchViewingList } from '@/api/extra'

const topBarInsetStyle = useTopBarInsetStyle()
const list = ref<{ start: string; end: string; prop: string; customer: string; staff: string; grade: string }[]>([])

onMounted(async () => {
  const r = await fetchViewingList()
  list.value = r.list
})

function goNew() {
  uni.navigateTo({ url: '/pages/viewing/new' })
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
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
          <view class="top-bar__nav-mid">带看记录</view>
          <view class="top-bar__nav-right">
            <button class="btn-ghost" @click="goNew">新建</button>
          </view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-for="(v, i) in list" :key="i" class="card" style="margin-bottom: 24rpx">
          <view style="display: flex; justify-content: space-between; align-items: center">
            <text style="font-weight: 700">{{ v.start }} – {{ v.end }}</text>
            <text class="chip ok">等级 {{ v.grade }}</text>
          </view>
          <text class="hint" style="display: block; margin-top: 12rpx">房源 {{ v.prop }} · 客户 {{ v.customer }}</text>
          <text class="hint" style="display: block; margin-top: 8rpx">陪同 {{ v.staff }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
