<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchPropertyLogs } from '@/api/property'

const topBarInsetStyle = useTopBarInsetStyle()
const list = ref<{ line: string; sub: string }[]>([])

onMounted(async () => {
  const r = await fetchPropertyLogs()
  list.value = r.list
})

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
          <view class="top-bar__nav-mid">操作日志</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="timeline">
          <view v-for="(t, i) in list" :key="i" class="timeline-item">
            <text class="timeline-line" style="font-weight: 700">{{ t.line }}</text>
            <text class="hint" style="display: block; margin-top: 8rpx">{{ t.sub }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
