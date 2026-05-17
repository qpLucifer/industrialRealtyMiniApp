<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchMyPublished } from '@/api/property'

const topBarInsetStyle = useTopBarInsetStyle()
type Row = {
  code: string
  title: string
  status: string
  statusTone: 'ok' | 'warn' | 'rejected' | 'draft'
  meta: string
}

const list = ref<Row[]>([])

onMounted(async () => {
  const r = await fetchMyPublished()
  list.value = r.list as Row[]
})

function chipStyle(tone: Row['statusTone']) {
  if (tone === 'ok') return ''
  if (tone === 'warn') return ''
  if (tone === 'rejected') return 'background:rgba(254,226,226,0.9);color:#b91c1c;border-color:rgba(244,63,94,0.35)'
  return 'background:#e2e8f0;color:#475569;border-color:rgba(100,116,139,0.25)'
}

function chipClass(tone: Row['statusTone']) {
  if (tone === 'ok') return 'chip ok'
  if (tone === 'warn') return 'chip warn'
  return 'chip'
}

function goDetail(code: string) {
  uni.navigateTo({ url: `/pages/property/detail?id=${encodeURIComponent(code)}` })
}

function goPublish(code?: string) {
  if (code) uni.navigateTo({ url: `/pages/property/publish?editId=${encodeURIComponent(code)}` })
  else uni.navigateTo({ url: '/pages/property/publish?clear=1' })
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
          <view class="top-bar__nav-mid">我的发布</view>
          <view class="top-bar__nav-right">
            <button class="btn-ghost" @click="goPublish()">新建</button>
          </view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-for="p in list" :key="p.code" class="card list-item" @click="goDetail(p.code)">
          <view style="flex: 1; min-width: 0">
            <view style="display: flex; justify-content: space-between; gap: 16rpx; align-items: center">
              <text style="font-size: 28rpx; font-weight: 700">#{{ p.code }} {{ p.title }}</text>
              <text :class="chipClass(p.statusTone)" :style="chipStyle(p.statusTone)">{{ p.status }}</text>
            </view>
            <text class="hint" style="display: block; margin-top: 12rpx">{{ p.meta }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
