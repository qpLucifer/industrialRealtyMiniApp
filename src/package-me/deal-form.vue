<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">成交备案</text>
      </template>
      <template #right>
        <text class="ghost" @tap="submit">提交</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="sec">标的与客户</text>
        <text class="lbl">成交房源<text class="req">*</text></text>
        <picker :range="props" @change="pIdx = Number($event.detail.value)">
          <view class="inp picker">{{ props[pIdx] }}</view>
        </picker>
        <text class="lbl">关联客户<text class="req">*</text></text>
        <picker :range="custs" @change="cIdx = Number($event.detail.value)">
          <view class="inp picker">{{ custs[cIdx] }}</view>
        </picker>
        <view class="two">
          <view class="col">
            <text class="lbl">成交类型<text class="req">*</text></text>
            <picker :range="types" @change="tIdx = Number($event.detail.value)">
              <view class="inp picker">{{ types[tIdx] }}</view>
            </picker>
          </view>
          <view class="col">
            <text class="lbl">签约日期<text class="req">*</text></text>
            <input class="inp" value="2026-05-15" />
          </view>
        </view>
      </ic-card>

      <ic-card>
        <text class="sec">金额与佣金</text>
        <view class="two">
          <view class="col">
            <text class="lbl">成交金额（元）<text class="req">*</text></text>
            <input class="inp" type="number" value="1280000" />
          </view>
          <view class="col">
            <text class="lbl">佣金总额（元）</text>
            <input class="inp" type="number" value="64000" />
          </view>
        </view>
        <text class="lbl">备注（财务核算字段预留）</text>
        <textarea v-model="remark" class="area" />
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  DEAL_FORM_CUSTOMER_OPTIONS,
  DEAL_FORM_DEFAULT_REMARK,
  DEAL_FORM_PROPERTY_OPTIONS,
  DEAL_FORM_TYPE_OPTIONS,
} from '@/mock/index.js'
import { showToast } from '@/utils/toast.js'

const props = DEAL_FORM_PROPERTY_OPTIONS
const custs = DEAL_FORM_CUSTOMER_OPTIONS
const types = DEAL_FORM_TYPE_OPTIONS
const pIdx = ref(0)
const cIdx = ref(0)
const tIdx = ref(0)
const remark = ref(DEAL_FORM_DEFAULT_REMARK)

function back() {
  uni.navigateBack({ delta: 1 })
}
function submit() {
  showToast('成交备案已归档（演示）')
  uni.switchTab({ url: '/pages/me/index' })
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
.sec {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.08em;
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
.two {
  display: flex;
  gap: 20rpx;
}
.col {
  flex: 1;
  min-width: 0;
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
