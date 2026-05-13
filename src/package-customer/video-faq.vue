<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">视频答疑</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <view class="search">
        <input v-model="q" class="inp" type="text" placeholder="搜索：配电、环评、独门独院、土地亩数…" />
      </view>
      <text class="hint">一线收集客户问题 → 短视频呈现 · 支持关键词检索（与后台「视频 FAQ」库同步）。</text>

      <view v-for="item in filtered" :key="item.title" class="vcard" @tap="play(item)">
        <view class="thumb" />
        <view class="mid">
          <text class="meta">{{ item.meta }}</text>
          <text class="t">{{ item.title }}</text>
          <text class="d">{{ item.desc }}</text>
        </view>
      </view>

      <text class="hint mt">演示：点击卡片将调起短视频播放（正式版接入视频号 / VOD）。</text>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { VIDEO_FAQ_ITEMS } from '@/mock/index.js'
import { showToast } from '@/utils/toast.js'

const q = ref('')
const all = VIDEO_FAQ_ITEMS

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return all
  return all.filter((x) => (x.kw + x.title + x.desc).toLowerCase().includes(s))
})

function back() {
  uni.navigateBack({ delta: 1 })
}
function play() {
  showToast('播放短视频（演示）')
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.page {
  min-height: 100vh;
  background: $ic-bg-deep;
}
.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}
.center-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
}
.scroll {
  height: calc(100vh - 120rpx);
  padding: 28rpx;
}
.search {
  margin-bottom: 16rpx;
}
.inp {
  width: 100%;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.hint {
  display: block;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
  margin-bottom: 18rpx;
}
.mt {
  margin-top: 22rpx;
}
.vcard {
  display: flex;
  gap: 20rpx;
  padding: 22rpx;
  border-radius: 32rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface;
  margin-bottom: 18rpx;
}
.thumb {
  width: 176rpx;
  height: 112rpx;
  border-radius: 20rpx;
  background: linear-gradient(145deg, #e2e8f0, #f8fafc);
  border: 1rpx solid $ic-border;
  flex-shrink: 0;
}
.mid {
  flex: 1;
  min-width: 0;
}
.meta {
  display: block;
  font-size: 20rpx;
  letter-spacing: 0.08em;
  color: #0f766e;
  margin-bottom: 6rpx;
}
.t {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.45;
  color: $ic-text;
}
.d {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
</style>
