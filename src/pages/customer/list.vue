<script setup lang="ts">
import { ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { useTabPageShow } from '@/composables/useTabPageShow'
import { fetchCustomerList } from '@/api/customer'
import { consumeCustomerListStale } from '@/utils/customerNav'
import type { CustomerListItem } from '@/types/customer'

const topBarInsetStyle = useTopBarInsetStyle()

const list = ref<CustomerListItem[]>([])
const loading = ref(false)
const seg = ref(0)
const keyword = ref('')

function gradeChipClass(c: CustomerListItem) {
  if (c.grade.startsWith('A') || c.gradeTone === 'ok') return 'ok'
  return ''
}

function avatarStyle(c: CustomerListItem) {
  const mint = gradeChipClass(c) === 'ok'
  return {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    flexShrink: 0,
    background: mint
      ? 'linear-gradient(135deg,#1a3a6c,#2d4f8c)'
      : 'linear-gradient(135deg,#64748b,#94a3b8)',
  }
}

async function reload() {
  loading.value = true
  try {
    const scope = seg.value === 0 ? 'mine' : 'public'
    const r = await fetchCustomerList({
      scope,
      q: keyword.value.trim() || undefined,
    })
    list.value = r.list
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

useTabPageShow(() => {
  if (consumeCustomerListStale()) {
    /* explicit stale after create/edit */
  }
  return reload()
}, { requireAuth: true })

function onSeg(i: number) {
  seg.value = i
  void reload()
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/customer/detail?id=${encodeURIComponent(id)}` })
}

function goNew() {
  uni.navigateTo({ url: '/pages/customer/new' })
}

function goVideoFaq() {
  uni.navigateTo({ url: '/pages/video-faq/index' })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">客户池</view>
          <view class="sub">ABC 分级 · 成交状态 · 下次提醒</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="segmented">
            <button class="seg-btn" :class="{ active: seg === 0 }" @click="onSeg(0)">我的私有</button>
            <button class="seg-btn" :class="{ active: seg === 1 }" @click="onSeg(1)">公司公有</button>
          </view>
          <view class="search-bar">
            <input
              v-model="keyword"
              type="text"
              placeholder="公司 / 手机尾号 / 姓名…"
              confirm-type="search"
              @confirm="reload"
            />
          </view>
          <view v-if="loading && !list.length" class="card">
            <text class="hint">加载中…</text>
          </view>
          <view v-else-if="!list.length" class="card">
            <text class="hint">暂无客户</text>
          </view>
          <view
            v-for="c in list"
            :key="c.id"
            class="prop-list-card"
            style="align-items: flex-start"
            @click="goDetail(c.id)"
          >
            <view :style="avatarStyle(c)" />
            <view style="flex: 1; min-width: 0">
              <view style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px">
                <view style="min-width: 0; flex: 1">
                  <view class="list-meta-muted">{{ c.company }}</view>
                  <view class="list-title-strong" style="display: block; margin-top: 2px">
                    {{ c.contactName || c.titleLine }}
                  </view>
                </view>
                <view
                  class="chip"
                  :class="gradeChipClass(c)"
                  :style="
                    gradeChipClass(c)
                      ? ''
                      : 'background:#f1f5f9;color:#475569;border-color:var(--border);flex-shrink:0'
                  "
                >
                  {{ c.grade }}
                </view>
              </view>
              <view class="list-meta-muted" style="margin-top: 6px">
                {{ c.dealStatus }}
                <text v-if="c.ownerName"> · {{ c.ownerName }}</text>
              </view>
              <view class="list-meta-muted" style="margin-top: 4px">{{ c.recent ? c.recent : '暂无最近跟进' }}</view>
              <view
                v-if="c.nextReminder && c.nextReminder !== '—'"
                style="font-size: 11px; color: var(--amber); margin-top: 6px; line-height: 1.45"
              >
                下次沟通 {{ c.nextReminder }}
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="fab-col">
        <view
          class="fab fab--view"
          style="background: linear-gradient(145deg, #2d4f8c, #1a3a6c); box-shadow: 0 14px 36px rgba(26, 58, 108, 0.35)"
          @tap="goNew"
        >
          <text>＋</text>
        </view>
        <view class="fab-sub" @tap="goVideoFaq">
          <view class="ic-video-faq" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tb-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.ic-video-faq {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a6c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='5' width='14' height='14' rx='2'/%3E%3Cpath d='M16 10l6-3v10l-6-3V10z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}
</style>
