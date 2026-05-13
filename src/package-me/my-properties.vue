<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">我发布的房源</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <text class="hint">以下为当前账号提交的记录；状态与消息中心、审核台联动（演示）。</text>
      <ic-card v-for="row in rows" :key="row.id" @tap="open(row.id)">
        <view class="row-between">
          <text class="t">{{ row.title }}</text>
          <ic-chip :type="row.chipType">{{ row.chip }}</ic-chip>
        </view>
        <text class="d">{{ row.sub }}</text>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { MY_PROPERTIES_ROWS } from '@/mock/index.js'
import { setPropertyDetailId } from '@/utils/storage.js'

const rows = MY_PROPERTIES_ROWS

function back() {
  uni.navigateBack({ delta: 1 })
}
function open(id) {
  setPropertyDetailId(id)
  if (id === 'P-DRAFT-001') {
    uni.navigateTo({ url: '/package-property/publish?mode=draft&id=P-DRAFT-001' })
    return
  }
  uni.navigateTo({ url: '/package-property/detail?id=' + encodeURIComponent(id) })
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
.hint {
  display: block;
  margin-bottom: 18rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.row-between {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: center;
}
.t {
  font-size: 28rpx;
  font-weight: 700;
  color: $ic-text;
}
.d {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
}
</style>
