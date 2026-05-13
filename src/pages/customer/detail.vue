<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchCustomerDetail } from '@/api/customer'
import { postAction } from '@/api/message'
import type { CustomerDetailMock } from '@/mock/data/customers'

const topBarInsetStyle = useTopBarInsetStyle()
const id = ref('zhangchen')
const d = ref<CustomerDetailMock | null>(null)

const badges = computed(() => {
  const raw = d.value?.badgesHtml || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
})

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
})

async function load() {
  d.value = await fetchCustomerDetail(id.value)
}

onShow(() => {
  load()
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/customer/list' }) })
}

function goFollow() {
  uni.navigateTo({ url: `/pages/follow/add?customerId=${encodeURIComponent(id.value)}` })
}

async function saveFollow() {
  if (!d.value) return
  await postAction('customer-follow-save', {
    id: id.value,
    grade: d.value.followGradeValue,
    next: d.value.nextFollowInput,
  })
  uni.showToast({ title: '已保存（原型）', icon: 'none' })
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
          <view class="top-bar__nav-mid">客户档案</view>
          <view class="top-bar__nav-right">
            <button class="btn-ghost" @click="goFollow">跟进</button>
          </view>
        </view>
      </view>
      <scroll-view v-if="d" scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <text style="font-size: 32rpx; font-weight: 700">{{ d.h2 }}</text>
          <view style="display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 20rpx; align-items: center">
            <text class="chip ok">{{ d.gradeLabel }}</text>
            <text class="chip" :class="d.reminderTone === 'warn' ? 'warn' : ''">{{ d.reminderText }}</text>
            <text v-for="(b, i) in badges" :key="i" class="chip" style="background: #f1f5f9; color: #475569; border-color: rgba(100, 116, 139, 0.25)">{{
              b
            }}</text>
          </view>
          <view style="margin-top: 20rpx; font-size: 28rpx">电话 {{ d.phone }}</view>
          <view style="margin-top: 8rpx; font-size: 24rpx; color: var(--muted)">最近跟进 {{ d.lastFollow }}</view>
        </view>
        <view class="section-title">需求画像</view>
        <view class="card">
          <view v-for="(row, i) in d.kv" :key="i" style="display: flex; gap: 20rpx; padding: 16rpx 0; border-bottom: 1px solid var(--border)">
            <text style="width: 200rpx; flex-shrink: 0; color: var(--muted); font-size: 26rpx">{{ row.dt }}</text>
            <text style="flex: 1; font-size: 26rpx">{{ row.dd }}</text>
          </view>
        </view>
        <view class="section-title">时间轴</view>
        <view class="timeline">
          <view v-for="(line, i) in d.timeline" :key="i" class="timeline-item">
            <text class="timeline-line">{{ line }}</text>
          </view>
        </view>
        <view class="section-title">写跟进（原型）</view>
        <view class="card">
          <text class="hint" style="display: block; margin-bottom: 20rpx">{{ d.inheritHint }}</text>
          <view class="form-group">
            <text class="label">跟进等级</text>
            <input v-model="d.followGradeValue" />
          </view>
          <view class="form-group">
            <text class="label">下次提醒（datetime-local 字符串）</text>
            <input v-model="d.nextFollowInput" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 16rpx" @click="saveFollow">保存到时间轴</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
