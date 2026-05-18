<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchViewingList } from '@/api/extra'
import { consumeListStale } from '@/utils/listStale'

type ViewingRow = {
  start: string
  end: string
  prop: string
  customer: string
  staff: string
  grade: string
}

const list = ref<ViewingRow[]>([])
const loading = ref(false)
const loadError = ref('')
const skipNextShow = ref(false)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const r = await fetchViewingList()
    list.value = r.list as ViewingRow[]
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
  if (consumeListStale('viewing-list')) {
    void load()
  }
})

function goNew() {
  uni.navigateTo({ url: '/pages/viewing/new' })
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar
        title="带看记录"
        :actions="[{ key: 'add', icon: 'add', ariaLabel: '新建带看' }]"
        @back="back"
        @action="goNew"
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
          <text class="hint">暂无带看记录</text>
        </view>
        <view v-for="(v, i) in list" :key="i" class="card" style="margin-bottom: 24rpx">
          <view style="display: flex; justify-content: space-between; align-items: center">
            <text style="font-weight: 700">{{ v.start }} – {{ v.end }}</text>
            <text class="chip ok">等级 {{ v.grade }}</text>
          </view>
          <text class="hint" style="display: block; margin-top: 12rpx">房源 {{ v.prop }} · 客户 {{ v.customer }}</text>
          <text class="hint" style="display: block; margin-top: 8rpx">陪同 {{ v.staff }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
