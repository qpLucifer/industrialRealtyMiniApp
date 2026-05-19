<script setup lang="ts">
import { ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import SwipeRow from '@/components/SwipeRow.vue'
import { dismissMessage, fetchMessageList } from '@/api/message'
import { navigateToPropertyDetail } from '@/api/property'
import type { MessageItem } from '@/types/message'

const topBarInsetStyle = useTopBarInsetStyle()

const list = ref<MessageItem[]>([])
const loading = ref(false)

async function reload() {
  loading.value = true
  try {
    const r = await fetchMessageList()
    list.value = r.list
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

useTabPageShow(() => reload(), { requireAuth: true })

function iconClass(tone: MessageItem['iconTone']) {
  return `msg-card__icon msg-card__icon--${tone}`
}

function open(m: MessageItem) {
  if (m.nav === 'property-detail' && m.propId) {
    navigateToPropertyDetail(m.propId)
    return
  }
  if (m.nav === 'customer-detail' && m.customerId) {
    uni.navigateTo({ url: `/pages/customer/detail?id=${encodeURIComponent(m.customerId)}` })
    return
  }
  if (m.nav === 'viewing-list') {
    uni.navigateTo({ url: '/pages/viewing/list' })
    return
  }
  if (m.nav === 'announcements') {
    uni.navigateTo({ url: '/pages/announcements/list' })
    return
  }
  if (m.nav === 'settings') {
    uni.navigateTo({ url: '/pages/settings/settings' })
    return
  }
  uni.showToast({ title: '暂不支持该消息类型', icon: 'none' })
}

async function onDelete(m: MessageItem) {
  try {
    await dismissMessage(m.id)
    list.value = list.value.filter((x) => x.id !== m.id)
    uni.showToast({ title: '已删除', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '删除失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">消息中心</view>
          <view class="sub">左滑可删除 · 审核与任务提醒</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner msg-page">
          <view v-if="loading && !list.length" class="msg-empty">
            <text class="hint">加载中…</text>
          </view>
          <view v-else-if="!list.length" class="msg-empty">
            <text class="msg-empty__title">暂无消息</text>
            <text class="hint">审核结果、客户跟进与带看提醒会出现在这里</text>
          </view>
          <SwipeRow
            v-for="m in list"
            :key="m.id"
            :actions="[{ key: 'delete', label: '删除', tone: 'danger' }]"
            @action="(key) => key === 'delete' && onDelete(m)"
          >
            <view class="msg-card" @tap="open(m)">
              <view :class="iconClass(m.iconTone)">{{ m.icon }}</view>
              <view class="msg-card__body">
                <view class="msg-card__top">
                  <text class="msg-card__title">{{ m.title }}</text>
                  <text v-if="m.time" class="msg-card__time">{{ m.time }}</text>
                </view>
                <text class="msg-card__hint">{{ m.hint }}</text>
              </view>
            </view>
          </SwipeRow>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.msg-page {
  padding-bottom: 32rpx;
}

.msg-empty {
  padding: 80rpx 32rpx;
  text-align: center;
}

.msg-empty__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  margin-bottom: 12rpx;
}

.msg-card {
  display: flex;
  gap: 24rpx;
  padding: 28rpx;
  align-items: flex-start;
}

.msg-card__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.msg-card__icon--amber {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
}

.msg-card__icon--rose {
  background: linear-gradient(135deg, #fb7185, #e11d48);
  color: #fff;
}

.msg-card__icon--mint {
  background: linear-gradient(135deg, #4a6fa8, #1a3a6c);
  color: #fff;
}

.msg-card__icon--cyan {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0c4a6e;
}

.msg-card__icon--slate {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: #fff;
}

.msg-card__body {
  flex: 1;
  min-width: 0;
}

.msg-card__top {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: flex-start;
}

.msg-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
  line-height: 1.35;
  flex: 1;
}

.msg-card__time {
  font-size: 22rpx;
  color: var(--muted, #64748b);
  flex-shrink: 0;
}

.msg-card__hint {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--muted, #64748b);
  line-height: 1.45;
}
</style>
