<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  fetchPublicPropertyShare,
  onVideoComponentError,
  resolveMediaUrl,
  sharePageTopStyle,
} from '@/utils/request'
import { hideWeixinShareMenu, resolveSharePageToken } from '@/utils/session'

const topStyle = sharePageTopStyle()

const token = ref('')
const statusText = ref('加载中…')
const showRetry = ref(false)
const title = ref('房源展示')
const specLine = ref('')
const mediaImages = ref<string[]>([])
const mediaVideos = ref<string[]>([])

let loadSeq = 0

function applyMediaUrls(images: string[], videos: string[]) {
  if (images.length === 0 && videos.length === 0 && mediaImages.value.length + mediaVideos.value.length > 0) {
    return
  }
  mediaImages.value = images
  mediaVideos.value = videos
}

onLoad((q) => {
  const launch = uni.getLaunchOptionsSync?.()
  token.value = resolveSharePageToken(q as Record<string, string | undefined>, launch)
  if (token.value) {
    void load()
  } else {
    statusText.value = '分享无效或已失效'
    showRetry.value = true
  }
})

onShow(() => {
  // #ifdef MP-WEIXIN
  hideWeixinShareMenu()
  // #endif
})

async function load() {
  if (!token.value) {
    statusText.value = '分享无效或已失效'
    showRetry.value = true
    return
  }
  const seq = ++loadSeq
  statusText.value = '加载中…'
  showRetry.value = false
  try {
    const payload = await fetchPublicPropertyShare(token.value)
    if (seq !== loadSeq) return

    title.value = payload.title || '房源展示'
    specLine.value = payload.specLine || ''
    const images = (payload.mediaImages ?? []).map((u) => resolveMediaUrl(String(u || ''))).filter(Boolean)
    const videos = (payload.mediaVideos ?? []).map((u) => resolveMediaUrl(String(u || ''))).filter(Boolean)
    applyMediaUrls(images, videos)

    if (images.length === 0 && videos.length === 0) {
      statusText.value = '暂无可展示的图片或视频'
      showRetry.value = true
    } else {
      statusText.value = ''
      showRetry.value = false
    }
  } catch (e) {
    if (seq !== loadSeq) return
    statusText.value = e instanceof Error ? e.message : '加载失败'
    showRetry.value = true
  }
}
</script>

<template>
  <!-- Must sit above global page::before/after gradients (prototype.css); other pages use .app-shell z-index:1 -->
  <view class="share-page-root">
    <view class="share-shell">
      <view class="share-shell__head" :style="topStyle">
        <text class="share-shell__badge">只读浏览</text>
        <text class="share-shell__title">{{ title }}</text>
        <text v-if="specLine" class="share-shell__sub">{{ specLine }}</text>
      </view>

      <view v-if="statusText" class="share-shell__status">
        <text class="share-shell__status-txt">{{ statusText }}</text>
      </view>

      <view v-if="showRetry" class="share-shell__retry-wrap">
        <view class="share-shell__retry" @tap="load">点此重试</view>
      </view>

      <view v-for="(url, idx) in mediaImages" :key="'img-' + idx" class="share-shell__media">
        <image class="share-shell__img" :src="url" mode="widthFix" :show-menu-by-longpress="false" />
      </view>

      <view v-for="(url, idx) in mediaVideos" :key="'vid-' + idx" class="share-shell__media">
        <video
          class="share-shell__video"
          :src="url"
          controls
          :show-center-play-btn="true"
          :enable-play-gesture="true"
          object-fit="contain"
          @error="onVideoComponentError"
        />
      </view>

      <view class="share-shell__foot">
        <text class="share-shell__foot-txt">本页仅供查看房源图片与视频，链接过期后将无法访问。</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.share-page-root {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: #0f172a;
  box-sizing: border-box;
}

.share-shell {
  min-height: 100vh;
  padding: 0 32rpx 48rpx;
  background: #0f172a;
  color: #f1f5f9;
  box-sizing: border-box;
}

.share-shell__head {
  padding-bottom: 16rpx;
}

.share-shell__badge {
  display: inline-block;
  font-size: 22rpx;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  margin-bottom: 16rpx;
}

.share-shell__title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.45;
  color: #f8fafc;
  word-break: break-word;
}

.share-shell__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #94a3b8;
  line-height: 1.5;
}

.share-shell__status {
  padding: 24rpx 0;
}

.share-shell__status-txt {
  display: block;
  font-size: 30rpx;
  line-height: 1.6;
  color: #fca5a5;
}

.share-shell__retry-wrap {
  padding: 8rpx 0 24rpx;
}

.share-shell__retry {
  display: inline-block;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
}

.share-shell__media {
  margin-bottom: 24rpx;
}

.share-shell__img {
  width: 100%;
  border-radius: 16rpx;
  background: #1e293b;
  display: block;
}

.share-shell__video {
  width: 100%;
  min-height: 360rpx;
  border-radius: 16rpx;
  background: #000;
}

.share-shell__foot {
  margin-top: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.share-shell__foot-txt {
  display: block;
  font-size: 24rpx;
  line-height: 1.55;
  color: #94a3b8;
}
</style>
