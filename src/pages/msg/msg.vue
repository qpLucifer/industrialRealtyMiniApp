<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchMessageList } from '@/api/message'
import type { MessageItem } from '@/types/message'

const topBarInsetStyle = useTopBarInsetStyle()

const list = ref<MessageItem[]>([])

async function reload() {
  try {
    const r = await fetchMessageList()
    list.value = r.list
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  }
}

onShow(() => {
  reload()
})

function iconStyle(tone: MessageItem['iconTone']) {
  const map: Record<MessageItem['iconTone'], string> = {
    amber: 'background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f',
    rose: 'background:linear-gradient(135deg,#fb7185,#e11d48);color:#fff',
    mint: 'background:linear-gradient(135deg,#34d399,#0d9488);color:#fff',
    cyan: 'background:linear-gradient(135deg,#22d3ee,#0ea5e9);color:#0c4a6e',
    slate: 'background:linear-gradient(135deg,#94a3b8,#64748b);color:#fff',
  }
  return map[tone] || map.slate
}

function open(m: MessageItem) {
  if (m.nav === 'property-detail' && m.propId) {
    uni.navigateTo({ url: `/pages/property/detail?id=${encodeURIComponent(m.propId)}` })
    return
  }
  if (m.nav === 'customer-detail' && m.customerId) {
    uni.navigateTo({ url: `/pages/customer/detail?id=${encodeURIComponent(m.customerId)}` })
    return
  }
  if (m.nav === 'announcements') {
    uni.navigateTo({ url: '/pages/announcements/list' })
    return
  }
  if (m.nav === 'settings') {
    uni.navigateTo({ url: '/pages/settings/settings' })
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">消息中心</view>
          <view class="sub">审核 · 任务 · 系统</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="!list.length" class="hint" style="padding: 48rpx; text-align: center">暂无消息</view>
        <view
          v-for="m in list"
          :key="m.id"
          class="list-item"
          style="align-items: flex-start"
          @click="open(m)"
        >
          <view
            style="width: 80rpx; height: 80rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; font-weight: 700; flex-shrink: 0"
            :style="iconStyle(m.iconTone)"
            >{{ m.icon }}</view
          >
          <view style="flex: 1; min-width: 0">
            <view style="display: flex; justify-content: space-between; gap: 16rpx">
              <text style="font-size: 28rpx; font-weight: 700">{{ m.title }}</text>
              <text v-if="m.time" style="font-size: 22rpx; color: var(--muted); flex-shrink: 0">{{ m.time }}</text>
            </view>
            <text class="hint" style="display: block; margin-top: 10rpx; font-size: 24rpx">{{ m.hint }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
