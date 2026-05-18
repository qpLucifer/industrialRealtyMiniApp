<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchMyPublished, navigateToPropertyDetail, navigateToPropertyPublish } from '@/api/property'
import { consumeListStale } from '@/utils/listStale'

type Row = {
  code: string
  title: string
  status: string
  statusTone: 'ok' | 'warn' | 'rejected' | 'draft'
  meta: string
}

const list = ref<Row[]>([])
const loading = ref(false)
const loadError = ref('')
const skipNextShow = ref(false)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const r = await fetchMyPublished()
    list.value = r.list as Row[]
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(async () => {
  skipNextShow.value = true
  await load()
})

onShow(() => {
  if (skipNextShow.value) {
    skipNextShow.value = false
    return
  }
  if (consumeListStale('my-published')) {
    void load()
  }
})

function chipStyle(tone: Row['statusTone']) {
  if (tone === 'ok') return ''
  if (tone === 'warn') return ''
  if (tone === 'rejected') return 'background:rgba(254,226,226,0.9);color:#b91c1c;border-color:rgba(244,63,94,0.35)'
  return 'background:#e2e8f0;color:#475569;border-color:rgba(100,116,139,0.25)'
}

function chipClass(tone: Row['statusTone']) {
  if (tone === 'ok') return 'chip ok'
  if (tone === 'warn') return 'chip warn'
  return 'chip'
}

function goDetail(code: string) {
  navigateToPropertyDetail(code)
}

function goPublish(code?: string) {
  navigateToPropertyPublish(code, { clear: !code })
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar
        title="我的发布"
        :actions="[{ key: 'add', icon: 'add', ariaLabel: '发布房源' }]"
        @back="back"
        @action="goPublish()"
      />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view v-if="loading && !list.length" class="card" style="margin-bottom: 24rpx">
          <text class="hint">加载中…</text>
        </view>
        <view v-else-if="loadError && !list.length" class="card" style="margin-bottom: 24rpx">
          <text class="hint">{{ loadError }}</text>
          <button class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
        </view>
        <view v-else-if="!list.length" class="card" style="margin-bottom: 24rpx">
          <text class="hint">暂无发布记录</text>
        </view>
        <view
          v-for="p in list"
          :key="p.code"
          class="prop-list-card"
          @click="goDetail(p.code)"
        >
          <view class="thumb" />
          <view style="flex: 1; min-width: 0">
            <view style="display: flex; justify-content: space-between; gap: 8px">
              <view class="list-title-strong" style="flex: 1">{{ p.title }}</view>
              <view :class="chipClass(p.statusTone)" :style="chipStyle(p.statusTone)">{{ p.status }}</view>
            </view>
            <text class="hint" style="display: block; margin-top: 8rpx">{{ p.meta }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
