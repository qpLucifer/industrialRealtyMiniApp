<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { postAction } from '@/api/message'

const customerId = ref('')
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
  if (!customerId.value.trim()) {
    uni.showToast({ title: '缺少客户', icon: 'none' })
    return
  }
  await postAction('follow-add', { customerId: customerId.value, note: note.value, channel: channel.value })
  uni.showToast({ title: '跟进已记录', icon: 'none' })
  uni.navigateBack()
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="写跟进" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
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
