<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchCustomerList } from '@/api/customer'
import type { CustomerListItem } from '@/mock/data/customers'

const topBarInsetStyle = useTopBarInsetStyle()

const list = ref<CustomerListItem[]>([])
const seg = ref(0)

onMounted(async () => {
  const r = await fetchCustomerList()
  list.value = r.list
})

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/customer/detail?id=${encodeURIComponent(id)}` })
}

function goNew() {
  uni.navigateTo({ url: '/pages/customer/new' })
}

function goVideoFaq() {
  uni.navigateTo({ url: '/pages/video-faq/index' })
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--stack" :style="topBarInsetStyle">
        <view class="top-bar__titles">
          <view class="tb-title">客户池</view>
          <view class="sub">私有优先 · ABC 分级 · 提醒联动</view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="segmented">
          <button class="seg-btn" :class="{ active: seg === 0 }" @click="seg = 0">我的私有</button>
          <button class="seg-btn" :class="{ active: seg === 1 }" @click="seg = 1">公司公有</button>
        </view>
        <view class="search-bar">
          <input type="text" placeholder="公司 / 手机尾号 / 姓名 / 区域 / 标签…" />
        </view>
        <view class="chip-row" style="margin-bottom: 12px">
          <view class="chip on">刚需</view>
          <view class="chip">投资</view>
          <view class="chip">急租</view>
          <view class="chip">急购</view>
          <view class="chip">大客户</view>
          <view class="chip">外地</view>
        </view>
        <view
          v-for="c in list"
          :key="c.id"
          class="list-item"
          style="align-items: flex-start"
          @click="goDetail(c.id)"
        >
          <view
            :style="{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              flexShrink: 0,
              background: c.gradeTone === 'ok' ? 'linear-gradient(135deg,#0d9488,#14b8a6)' : 'linear-gradient(135deg,#64748b,#94a3b8)',
            }"
          />
          <view style="flex: 1; min-width: 0">
            <view style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px">
              <view style="min-width: 0; flex: 1">
                <view class="list-meta-muted">{{ c.company }}</view>
                <view class="list-title-strong" style="display: block; margin-top: 2px">{{ c.titleLine }}</view>
              </view>
              <view
                class="chip"
                :class="c.gradeTone === 'ok' ? 'ok' : ''"
                :style="
                  c.gradeTone === 'ok'
                    ? ''
                    : 'background:#f1f5f9;color:#475569;border-color:var(--border);flex-shrink:0'
                "
                >{{ c.grade }}</view
              >
            </view>
            <view class="list-meta-muted" style="margin-top: 6px">{{ c.recent }}</view>
            <view style="font-size: 11px; color: var(--amber); margin-top: 6px; line-height: 1.45">{{ c.nextLine }}</view>
          </view>
        </view>
      </scroll-view>
      <view class="fab-col">
        <view
          class="fab fab--view"
          style="background: linear-gradient(145deg, #14b8a6, #0d9488); box-shadow: 0 14px 36px rgba(20, 184, 166, 0.35)"
          @tap="goNew"
        >
          <text>＋</text>
        </view>
        <view class="fab-sub" @tap="goVideoFaq">
          <view class="ic-video-faq" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tb-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.ic-video-faq {
  width: 40rpx;
  height: 40rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='5' width='14' height='14' rx='2'/%3E%3Cpath d='M16 10l6-3v10l-6-3V10z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}
</style>
