<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchPropertyLogs, parsePropertyRouteKey } from '@/api/property'

const list = ref<{ line: string; sub: string }[]>([])
const code = ref('')
const loading = ref(false)
const loadError = ref('')

onLoad(async (q) => {
  code.value = parsePropertyRouteKey(q)
  if (!code.value) {
    loadError.value = '缺少房源编号'
    return
  }
  await load()
})

async function load() {
  if (!code.value) return
  loading.value = true
  loadError.value = ''
  try {
    const r = await fetchPropertyLogs(code.value)
    list.value = r.list
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

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
      <NavIconBar title="操作日志" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="loading" class="card">
          <text class="hint">加载中…</text>
        </view>
        <view v-else-if="loadError" class="card">
          <text class="hint">{{ loadError }}</text>
          <button v-if="code" class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
        </view>
        <template v-else>
          <view v-for="(t, i) in list" :key="i" class="card" style="margin-bottom: 24rpx">
            <view style="font-weight: 700" :class="{ 'text-rose': isRejectLog(t) }">{{ t.line }}</view>
            <text class="hint" style="display: block; margin-top: 8rpx">{{ t.sub }}</text>
          </view>
          <view v-if="!list.length" class="card">
            <text class="hint">暂无日志</text>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>
