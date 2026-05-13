<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">预约带看</text>
      </template>
      <template #right>
        <text class="ghost" @tap="submit">提交</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="lbl">关联房源<text class="req">*</text></text>
        <picker :range="props" @change="pIdx = Number($event.detail.value)">
          <view class="inp picker">{{ props[pIdx] }}</view>
        </picker>
        <text class="lbl">关联客户<text class="req">*</text></text>
        <picker :range="custs" @change="cIdx = Number($event.detail.value)">
          <view class="inp picker">{{ custs[cIdx] }}</view>
        </picker>
        <text class="lbl">内部陪同人<text class="req">*</text></text>
        <input class="inp" value="陈思远、王敏（工程顾问）" />
        <text class="lbl">门禁 / 车辆报备信息</text>
        <textarea v-model="gate" class="area" />
        <text class="lbl">意向评级</text>
        <picker :range="grades" @change="gIdx = Number($event.detail.value)">
          <view class="inp picker">{{ grades[gIdx] }}</view>
        </picker>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  VIEWING_FORM_CUSTOMER_OPTIONS,
  VIEWING_FORM_DEFAULT_GATE,
  VIEWING_FORM_GRADE_OPTIONS,
  VIEWING_FORM_PROPERTY_OPTIONS,
} from '@/mock/index.js'
import { showToast } from '@/utils/toast.js'

const props = VIEWING_FORM_PROPERTY_OPTIONS
const custs = VIEWING_FORM_CUSTOMER_OPTIONS
const grades = VIEWING_FORM_GRADE_OPTIONS
const pIdx = ref(0)
const cIdx = ref(0)
const gIdx = ref(1)
const gate = ref(VIEWING_FORM_DEFAULT_GATE)

function back() {
  uni.navigateBack({ delta: 1 })
}
function submit() {
  showToast('带看预约已写入台账（演示）')
  uni.navigateTo({ url: '/package-me/viewing-list' })
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
.lbl {
  display: block;
  margin: 12rpx 0 10rpx;
  font-size: 24rpx;
  color: $ic-muted;
}
.req {
  color: $ic-rose;
}
.inp {
  width: 100%;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.picker {
  line-height: 1.2;
}
.area {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
</style>
