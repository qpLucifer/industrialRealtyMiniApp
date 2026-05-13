<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">隐私与安全</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <view class="sw">
          <text>房源联系人脱敏显示</text>
          <switch :checked="s1" @change="s1 = $event.detail.value" />
        </view>
        <view class="sw">
          <text>客户电话脱敏显示</text>
          <switch :checked="s2" @change="s2 = $event.detail.value" />
        </view>
        <view class="sw">
          <text>禁止长按复制（前端增强）</text>
          <switch :checked="s3" @change="s3 = $event.detail.value" />
        </view>
        <view class="sw">
          <text>房源发布需管理员审核（全局）</text>
          <switch :checked="audit" @change="onAudit" />
        </view>
        <text class="hint">「审核发布」与后台策略联动；开启后新房源进入待审核队列。</text>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getAuditPublishRequired, setAuditPublishRequired } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const s1 = ref(true)
const s2 = ref(true)
const s3 = ref(true)
const audit = ref(true)

onShow(() => {
  audit.value = getAuditPublishRequired()
})

function onAudit(e) {
  audit.value = !!e.detail.value
  setAuditPublishRequired(audit.value)
  showToast(audit.value ? '审核发布：已开启' : '审核发布：已关闭')
}

function back() {
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
.sw {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid $ic-border;
  font-size: 28rpx;
  color: $ic-text;
}
.hint {
  display: block;
  margin-top: 18rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
</style>
