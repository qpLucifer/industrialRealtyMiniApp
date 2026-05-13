<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchPropertyList } from '@/api/property'
import type { PropertyListItem } from '@/mock/data/properties'

const topBarInsetStyle = useTopBarInsetStyle()
const list = ref<PropertyListItem[]>([])
const filterOpen = ref(false)
const seg = ref(0)

onMounted(async () => {
  const r = await fetchPropertyList()
  list.value = r.list
})

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/property/detail?id=${encodeURIComponent(id)}` })
}

function onPropertyRow(p: PropertyListItem) {
  if (p.status === '草稿') {
    goPublish(false, p.id)
    return
  }
  goDetail(p.id)
}

function goPublish(clear?: boolean, editId?: string) {
  let url = '/pages/property/publish'
  const q: string[] = []
  if (clear) q.push('clear=1')
  if (editId) q.push(`editId=${encodeURIComponent(editId)}`)
  if (q.length) url += '?' + q.join('&')
  uni.navigateTo({ url })
}

function applyFilter() {
  filterOpen.value = false
  uni.showToast({ title: '已应用筛选条件', icon: 'none' })
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">房源库</view>
          <view class="sub">品类全 · 已按区域隔离</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="search-bar search-bar--suffix">
          <input type="text" placeholder="关键词：区位 / 配电 / 行车 / 行业…" />
          <view class="search-bar__suffix" @click="filterOpen = true">
            <view class="ic-filter" />
          </view>
        </view>
        <view class="segmented">
          <button class="seg-btn" :class="{ active: seg === 0 }" @click="seg = 0">全部</button>
          <button class="seg-btn" :class="{ active: seg === 1 }" @click="seg = 1">草稿</button>
          <button class="seg-btn" :class="{ active: seg === 2 }" @click="seg = 2">待租</button>
          <button class="seg-btn" :class="{ active: seg === 3 }" @click="seg = 3">待售</button>
          <button class="seg-btn" :class="{ active: seg === 4 }" @click="seg = 4">意向中</button>
        </view>
        <view
          v-for="p in list"
          :key="p.id"
          v-show="seg === 0 || (seg === 1 && p.status === '草稿') || (seg === 2 && p.status === '待租') || (seg === 3 && p.status === '待售') || (seg === 4 && p.status === '意向中')"
          class="list-item"
          @click="onPropertyRow(p)"
        >
          <view class="thumb" />
          <view style="flex: 1; min-width: 0">
            <view style="display: flex; justify-content: space-between; gap: 8px; align-items: center">
              <view class="list-title-strong" style="flex: 1; min-width: 0">{{ p.title }}</view>
              <view
                class="chip"
                :class="p.statusTone === 'ok' ? 'ok' : p.statusTone === 'warn' ? 'warn' : ''"
                :style="
                  p.statusTone === 'draft'
                    ? 'background:#e2e8f0;color:#475569;border-color:rgba(100,116,139,0.25);flex-shrink:0'
                    : 'flex-shrink:0'
                "
                >{{ p.status }}</view
              >
            </view>
            <view class="list-meta-muted" style="margin-top: 6px">{{ p.metaLine }}</view>
            <view v-if="p.draftHint" style="font-size: 12px; color: var(--amber); margin-top: 4px; line-height: 1.45">{{ p.draftHint }}</view>
            <view v-if="p.priceLine" class="list-price-line" style="margin-top: 8px">{{ p.priceLine }}</view>
          </view>
        </view>
      </scroll-view>
      <button class="fab" @click="goPublish(true)">＋</button>
    </view>

    <view v-if="filterOpen" class="modal-overlay show" @click.self="filterOpen = false">
      <view class="modal-sheet" @click.stop>
        <view class="tb-title" style="margin-bottom: 12px">高级筛选</view>
        <view class="section-title">行政区域</view>
        <view class="form-group">
          <picker :range="['广东省']"><view class="picker-like">广东省</view></picker>
        </view>
        <view class="section-title">面积（㎡）</view>
        <view class="form-row-2">
          <view class="form-group"><text class="label">最小</text><input type="number" value="2000" /></view>
          <view class="form-group"><text class="label">最大</text><input type="number" value="8000" /></view>
        </view>
        <button class="btn-primary" style="margin-top: 12px" @click="applyFilter">应用筛选</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tb-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
}
.picker-like {
  padding: 20rpx;
  border: 1px solid var(--border);
  border-radius: 20rpx;
  background: #fff;
}

.ic-filter {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}
</style>
