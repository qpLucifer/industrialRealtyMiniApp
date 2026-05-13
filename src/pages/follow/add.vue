<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { postAction } from '@/api/message'

const topBarInsetStyle = useTopBarInsetStyle()
const customerId = ref('zhangchen')
const note = ref('')
const channel = ref('电话')
const channels = ['电话', '微信', '现场', '邮件']

function onChannelChange(e: { detail: { value: string | number } }) {
  const i = Number(e.detail.value)
  channel.value = channels[i] ?? channels[0]
}

onLoad((q) => {
  if (q?.customerId) customerId.value = String(q.customerId)
})

async function submit() {
  await postAction('follow-add', { customerId: customerId.value, note: note.value, channel: channel.value })
  uni.showToast({ title: '跟进已记录（原型）', icon: 'none' })
  uni.navigateBack()
}

function back() {
  uni.navigateBack()
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
          <view class="top-bar__nav-mid">写跟进</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <text class="hint" style="display: block; margin-bottom: 20rpx">客户 ID：{{ customerId }}</text>
          <view class="form-group">
            <text class="label">渠道</text>
            <picker :range="channels" @change="onChannelChange">
              <view class="picker-like">{{ channel }}</view>
            </picker>
          </view>
          <view class="form-group">
            <text class="label">内容<text class="req">*</text></text>
            <textarea v-model="note" placeholder="沟通要点、承诺、异议…" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 24rpx" @click="submit">提交</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
