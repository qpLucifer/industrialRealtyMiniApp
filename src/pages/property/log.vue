<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import PropertyLogEntryCard from '@/components/PropertyLogEntryCard.vue'
import { fetchPropertyLogs, parsePropertyRouteKey } from '@/api/property'
import { consumePropertyLogRefresh, navigateToPropertyFollow } from '@/utils/propertyNav'
import type { PropertyLogEntry } from '@/types/property'

const list = ref<PropertyLogEntry[]>([])
const code = ref('')
const loading = ref(false)
const loadError = ref('')

onLoad((q) => {
  code.value = parsePropertyRouteKey(q)
  if (!code.value) loadError.value = '缺少房源编号'
  else void load()
})

onShow(() => {
  if (code.value && consumePropertyLogRefresh(code.value)) void load()
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

function back() {
  uni.navigateBack()
}

function goFollow() {
  if (!code.value) return
  navigateToPropertyFollow(code.value)
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub prop-log-frame">
      <NavIconBar title="操作日志" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll prop-log-scroll">
        <view v-if="loading" class="card">
          <text class="hint">加载中…</text>
        </view>
        <view v-else-if="loadError" class="card">
          <text class="hint">{{ loadError }}</text>
          <button v-if="code" class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
        </view>
        <template v-else>
          <view v-for="(t, i) in list" :key="i" class="card prop-log-card">
            <PropertyLogEntryCard :entry="t" />
          </view>
          <view v-if="!list.length" class="card">
            <text class="hint">暂无日志</text>
          </view>
        </template>
      </scroll-view>
      <view v-if="code" class="page-footer">
        <button class="btn-primary" style="width: 100%" @click="goFollow">写跟进</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.prop-log-frame {
  display: flex;
  flex-direction: column;
}

.prop-log-scroll {
  flex: 1;
  min-height: 0;
}

.prop-log-card {
  margin-bottom: 24rpx;
}
</style>
