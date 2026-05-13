<script setup lang="ts">
import { ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { postAction } from '@/api/message'

const topBarInsetStyle = useTopBarInsetStyle()
const start = ref('2026-05-12 14:00')
const end = ref('15:30')
const prop = ref('#P-8821')
const customer = ref('张晨')
const staff = ref('陈思远')

async function submit() {
  await postAction('viewing-create', {
    start: start.value,
    end: end.value,
    prop: prop.value,
    customer: customer.value,
    staff: staff.value,
  })
  uni.showToast({ title: '带看已登记（原型）', icon: 'none' })
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
          <view class="top-bar__nav-mid">新建带看</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <view class="form-group">
            <text class="label">开始时间</text>
            <input v-model="start" />
          </view>
          <view class="form-group">
            <text class="label">结束时间</text>
            <input v-model="end" />
          </view>
          <view class="form-group">
            <text class="label">房源编号</text>
            <input v-model="prop" />
          </view>
          <view class="form-group">
            <text class="label">客户</text>
            <input v-model="customer" />
          </view>
          <view class="form-group">
            <text class="label">陪同同事</text>
            <input v-model="staff" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 24rpx" @click="submit">提交</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
