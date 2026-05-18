<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchPropertyLogs } from '@/api/property'

const list = ref<{ line: string; sub: string }[]>([])
const code = ref('')

onLoad(async (q) => {
  code.value = String(q?.id || q?.code || '').trim()
  if (!code.value) {
    uni.showToast({ title: '缺少房源编号', icon: 'none' })
    return
  }
  try {
    const r = await fetchPropertyLogs(code.value)
    list.value = r.list
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
  }
})

function isRejectLog(t: { line: string; sub: string }) {
  const text = `${t.line} ${t.sub}`
  return /驳回/.test(text)
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar :title="code ? `操作日志 · ${code}` : '操作日志'" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="!list.length" class="hint" style="padding: 48rpx; text-align: center">暂无该房源操作记录</view>
        <view class="timeline">
          <view
            v-for="(t, i) in list"
            :key="i"
            class="timeline-item"
            :class="{ 'timeline-item--reject': isRejectLog(t) }"
          >
            <text class="timeline-line" style="font-weight: 700">{{ t.line }}</text>
            <text class="hint" style="display: block; margin-top: 8rpx">{{ t.sub }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
