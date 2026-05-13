<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">取消</text>
      </template>
      <template #center>
        <text class="center-title">客户档案</text>
      </template>
      <template #right>
        <text class="ghost" @tap="save">保存</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="sec">客户分型与等级（CRM）</text>
        <view class="chip-row">
          <ic-chip :on="seg === '求租客户'" @tap="seg = '求租客户'">求租客户</ic-chip>
          <ic-chip :on="seg === '求购客户'" @tap="seg = '求购客户'">求购客户</ic-chip>
          <ic-chip :on="seg === '拿地建厂'" @tap="seg = '拿地建厂'">拿地建厂客户</ic-chip>
          <ic-chip :on="seg === '产业园入驻'" @tap="seg = '产业园入驻'">产业园入驻</ic-chip>
        </view>
        <text class="hint">客户等级 ABC（与跟进表一致）</text>
        <view class="chip-row mt">
          <ic-chip :on="grade === 'A'" type="ok" @tap="grade = 'A'">A 类重点</ic-chip>
          <ic-chip :on="grade === 'B'" type="plain" @tap="grade = 'B'">B 类培育</ic-chip>
          <ic-chip :on="grade === 'C'" type="neutral" @tap="grade = 'C'">C 类观察</ic-chip>
        </view>
      </ic-card>

      <ic-card>
        <text class="sec">基础信息</text>
        <text class="lbl">公司名称 / 客户主体<text class="req">*</text></text>
        <input class="inp" placeholder="营业执照全称或习惯称呼" />
        <view class="two">
          <view class="col">
            <text class="lbl">客户姓名<text class="req">*</text></text>
            <input class="inp" placeholder="真实姓名或职务称呼" />
          </view>
          <view class="col">
            <text class="lbl">手机号<text class="req">*</text></text>
            <input class="inp" type="number" placeholder="11 位" />
          </view>
        </view>
        <text class="lbl">意向区域<text class="req">*</text></text>
        <input class="inp" placeholder="例：黄埔区科学城周边 / 南沙万顷沙" />
        <text class="lbl">需求摘要</text>
        <textarea class="area" placeholder="对应跟进表「需求」列：尽量结构化关键词" />
      </ic-card>

      <ic-card>
        <text class="sec">权限 · 标签 · 状态</text>
        <view class="sw">
          <text>私有客户（他人不可见）</text>
          <switch :checked="priv" @change="priv = $event.detail.value" />
        </view>
        <text class="lbl">成交状态</text>
        <picker :range="deals" @change="dealIdx = Number($event.detail.value)">
          <view class="inp picker">{{ deals[dealIdx] }}</view>
        </picker>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { CUSTOMER_FORM_DEAL_OPTIONS } from '@/mock/index.js'
import { showToast } from '@/utils/toast.js'

const seg = ref('求租客户')
const grade = ref('A')
const priv = ref(true)
const deals = CUSTOMER_FORM_DEAL_OPTIONS
const dealIdx = ref(0)

function back() {
  uni.navigateBack({ delta: 1 })
}
function save() {
  showToast('客户档案已保存（演示）')
  uni.navigateBack({ delta: 1 })
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
  margin-bottom: 14rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.08em;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
}
.hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.mt {
  margin-top: 12rpx;
}
.lbl {
  display: block;
  margin: 14rpx 0 10rpx;
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
.two {
  display: flex;
  gap: 20rpx;
}
.col {
  flex: 1;
  min-width: 0;
}
.sw {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $ic-border;
  font-size: 28rpx;
}
</style>
