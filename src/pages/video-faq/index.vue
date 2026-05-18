<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchVideoFaqList } from '@/api/extra'
import type { VideoFaqItem } from '@/types/videoFaq'
import { onVideoComponentError, previewNetworkVideo, resolveMediaUrl } from '@/utils/request'

const list = ref<VideoFaqItem[]>([])
const loading = ref(false)
const loadError = ref('')
const active = ref<VideoFaqItem | null>(null)

const activePlayUrl = computed(() => {
  const v = active.value
  if (!v) return ''
  return resolveMediaUrl(v.playUrl || v.videoPath || '')
})

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    const r = await fetchVideoFaqList()
    list.value = r.list
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}

function openItem(v: VideoFaqItem) {
  active.value = v
}

function closeSheet() {
  active.value = null
}

function copyScript() {
  const v = active.value
  if (!v) return
  const text = `${v.title}\n${v.summary}\n关键词：${v.keywords}`
  uni.setClipboardData({ data: text })
}

function playActiveFullscreen() {
  if (!activePlayUrl.value) {
    uni.showToast({ title: '暂无可用视频地址', icon: 'none' })
    return
  }
  previewNetworkVideo(activePlayUrl.value)
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="视频话术" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="loading && !list.length" class="card" style="margin-bottom: 24rpx">
          <text class="hint">加载中…</text>
        </view>
        <view v-else-if="loadError && !list.length" class="card" style="margin-bottom: 24rpx">
          <text class="hint">{{ loadError }}</text>
        </view>
        <view v-for="v in list" :key="v.id" class="card" style="margin-bottom: 24rpx" @click="openItem(v)">
          <text style="display: block; font-size: 30rpx; font-weight: 700">{{ v.title }}</text>
          <text class="hint" style="display: block; margin-top: 12rpx; line-height: 1.55">{{ v.summary }}</text>
          <text style="display: block; margin-top: 12rpx; font-size: 24rpx; color: var(--cyan)">关键词：{{ v.keywords }}</text>
        </view>
      </scroll-view>
    </view>

    <view v-if="active" class="modal-overlay show" @click.self="closeSheet">
      <view class="modal-sheet modal-sheet--video" @click.stop>
        <text style="font-size: 30rpx; font-weight: 700">{{ active.title }}</text>
        <text class="hint" style="display: block; margin-top: 20rpx; line-height: 1.55">{{ active.summary }}</text>
        <video
          v-if="activePlayUrl"
          class="faq-video"
          :src="activePlayUrl"
          controls
          show-center-play-btn
          enable-play-gesture
          object-fit="contain"
          :show-fullscreen-btn="true"
          @error="onVideoComponentError"
        />
        <text v-else class="hint" style="display: block; margin-top: 20rpx">未配置可播放视频（需 OSS 地址或 VITE_OSS_PUBLIC_BASE_URL）</text>
        <view style="display: flex; gap: 20rpx; margin-top: 32rpx; flex-wrap: wrap">
          <button class="btn-secondary" style="flex: 1; min-width: 200rpx" @click="closeSheet">关闭</button>
          <button v-if="activePlayUrl" class="btn-secondary" style="flex: 1; min-width: 200rpx" @click="playActiveFullscreen">全屏</button>
          <button class="btn-primary" style="flex: 1; min-width: 200rpx" @click="copyScript">复制话术</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.modal-sheet--video {
  max-height: 85vh;
  overflow-y: auto;
}
.faq-video {
  width: 100%;
  height: 400rpx;
  margin-top: 24rpx;
  border-radius: 16rpx;
  background: #0f172a;
}
</style>
