<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">客户详情</text>
      </template>
      <template #right>
        <text class="ghost" @tap="follow">跟进</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card glow>
        <view class="chips">
          <ic-chip v-for="(b, i) in c.badges" :key="i" :type="b.type">{{ b.text }}</ic-chip>
        </view>
        <text class="h2">{{ c.title }}</text>
        <view class="kv"><text class="k">电话</text><text class="v">{{ phone }}</text></view>
        <view class="kv"><text class="k">最近跟进时间</text><text class="v">2026-05-11 16:20</text></view>
        <view class="kv">
          <text class="k">系统提醒</text>
          <view class="v"><ic-chip type="warn">{{ c.reminderChip }}</ic-chip></view>
        </view>
        <view class="kv"><text class="k">意向区域</text><text class="v">黄埔 / 增城交界</text></view>
        <view class="kv"><text class="k">意向面积</text><text class="v">3000–5000㎡</text></view>
        <view class="kv"><text class="k">预算</text><text class="v">租金 ≤35 元/㎡·月</text></view>
        <view class="kv"><text class="k">行业</text><text class="v">电子装配 + 仓储</text></view>
        <view class="kv"><text class="k">需求偏好</text><text class="v">丙二类、5T 行车、卸货平台、宿舍 2km 内</text></view>
        <view class="kv">
          <text class="k">成交状态</text>
          <view class="v"><ic-chip type="warn">洽谈中</ic-chip></view>
        </view>
      </ic-card>

      <text class="sec">跟进台账</text>
      <ic-card>
        <view class="tl">
          <view v-for="item in timelineItems" :key="item.title" class="tl__item">
            <text class="tl__t">{{ item.title }}</text>
            <text class="tl__b">{{ item.body }}</text>
          </view>
        </view>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CUSTOMER_DETAIL_TIMELINE_ITEMS, getCustomer } from '@/mock/index.js'
import { getCustomerDetailId, setCustomerDetailId } from '@/utils/storage.js'

const id = ref('zhangchen')
const c = computed(() => getCustomer(id.value))
const phone = computed(() => (id.value === 'wangli' ? '0576****7707' : '139****9024'))
const timelineItems = CUSTOMER_DETAIL_TIMELINE_ITEMS

onLoad((q) => {
  id.value = (q && q.id) || getCustomerDetailId()
  setCustomerDetailId(id.value)
})

function back() {
  uni.navigateBack({ delta: 1 })
}
function follow() {
  uni.navigateTo({ url: '/package-customer/follow' })
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
.chips {
  display: flex;
  flex-wrap: wrap;
}
.h2 {
  display: block;
  margin-top: 18rpx;
  font-size: 36rpx;
  font-weight: 700;
}
.kv {
  display: flex;
  gap: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
}
.k {
  width: 200rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: $ic-muted;
}
.v {
  flex: 1;
  font-size: 26rpx;
  color: $ic-text;
  line-height: 1.45;
}
.sec {
  display: block;
  margin: 18rpx 0 14rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.12em;
}
.tl {
  border-left: 4rpx solid rgba(13, 148, 136, 0.35);
  padding-left: 22rpx;
}
.tl__item {
  margin-bottom: 18rpx;
}
.tl__t {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $ic-text;
}
.tl__b {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
</style>
