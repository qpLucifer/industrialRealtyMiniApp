<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">写跟进</text>
      </template>
      <template #right>
        <text class="ghost" @tap="submit">提交</text>
      </template>
    </ic-top-bar>
    <scroll-view scroll-y class="scroll">
      <ic-card>
        <text class="lbl">客户等级（本条沿用档案，可改）</text>
        <picker :range="grades" :value="gradeIndex" @change="onGrade">
          <view class="inp picker">{{ grades[gradeIndex] }}</view>
        </picker>
        <text class="hint">{{ inherit }}</text>

        <text class="lbl">跟进类型</text>
        <picker :range="types" @change="typeIndex = Number($event.detail.value)">
          <view class="inp picker">{{ types[typeIndex] }}</view>
        </picker>

        <text class="lbl">跟进内容<text class="req">*</text></text>
        <textarea v-model="content" class="area" placeholder="事实描述、客户原话摘要、下一步动作" />

        <text class="lbl">跟进发生时间<text class="req">*</text></text>
        <input class="inp" placeholder="YYYY-MM-DD HH:mm（演示）" />

        <text class="lbl">下次沟通提醒</text>
        <input class="inp" placeholder="可选" />
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CUSTOMER_FOLLOW_GRADE_OPTIONS, CUSTOMER_FOLLOW_TYPE_OPTIONS, getCustomer } from '@/mock/index.js'
import { getCustomerDetailId } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const grades = CUSTOMER_FOLLOW_GRADE_OPTIONS
const gradeIndex = ref(0)
const types = CUSTOMER_FOLLOW_TYPE_OPTIONS
const typeIndex = ref(1)
const content = ref('')

const inherit = computed(() => {
  const c = getCustomer(getCustomerDetailId())
  return c.inheritHint
})

onLoad(() => {
  const c = getCustomer(getCustomerDetailId())
  gradeIndex.value = c.followGradeValue === 'B' ? 1 : c.followGradeValue === 'C' ? 2 : 0
})

function onGrade(e) {
  gradeIndex.value = Number(e.detail.value)
}

function back() {
  uni.navigateBack({ delta: 1 })
}
function submit() {
  showToast('跟进记录已追加（演示）')
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
  min-height: 200rpx;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.hint {
  display: block;
  margin: 10rpx 0 8rpx;
  font-size: 22rpx;
  color: $ic-muted;
  line-height: 1.45;
}
</style>
