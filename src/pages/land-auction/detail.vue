<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchLandAuctionDetail } from '@/api/landAuction'
import { LAND_STATUS_OPTIONS } from '@/composables/useLandAuctionForm'
import type { LandAuctionDetail, LandAuctionStatus } from '@/types/landAuction'
import { consumeLandAuctionDetailRefresh } from '@/utils/landAuctionNav'

const id = ref('')
const d = ref<LandAuctionDetail | null>(null)
const loading = ref(false)
const loadError = ref('')

const statusLabel = computed(() => {
  if (!d.value) return ''
  return LAND_STATUS_OPTIONS.find((s) => s.value === d.value!.auctionStatus)?.label ?? ''
})

function statusTone(key: LandAuctionStatus) {
  if (key === 'auctioning') return 'amber'
  if (key === 'completed') return 'mint'
  return 'slate'
}

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
  if (id.value) void load()
})

onShow(() => {
  if (id.value && consumeLandAuctionDetailRefresh(id.value)) void load()
})

async function load() {
  if (!id.value) {
    loadError.value = '缺少记录标识'
    return
  }
  loading.value = true
  loadError.value = ''
  d.value = null
  try {
    d.value = await fetchLandAuctionDetail(id.value)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/land-auction/index' }) })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/land-auction/edit?id=${encodeURIComponent(id.value)}` })
}

function fmtPrice(v: number | null, suffix: string) {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v} ${suffix}`
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub land-detail-frame">
      <NavIconBar title="土地详情" @back="back" />

      <view v-if="loading" class="page-scroll land-detail-state">
        <text class="hint">加载中…</text>
      </view>

      <view v-else-if="loadError && !d" class="page-scroll land-detail-state">
        <text class="hint" style="margin-bottom: 24rpx">{{ loadError }}</text>
        <button class="btn-secondary" @click="load">重试</button>
      </view>

      <scroll-view v-else-if="d" scroll-y :show-scrollbar="false" class="page-scroll land-detail-scroll">
        <view class="page-scroll__inner">
          <view class="card card-glow">
            <view class="land-detail-head">
              <text class="land-detail-title">{{ d.title }}</text>
              <text class="land-detail-tag" :class="`land-detail-tag--${statusTone(d.auctionStatus)}`">
                {{ statusLabel }}
              </text>
            </view>
            <view v-if="d.region" class="land-detail-meta">所属区域 {{ d.region }}</view>
            <view class="land-detail-meta">面积 {{ fmtPrice(d.areaMu, '亩') }}</view>
            <view v-if="d.transferTerm" class="land-detail-meta">出让年限 {{ d.transferTerm }}</view>
            <view v-if="d.taxPerMu != null" class="land-detail-meta">亩产税（万/亩） {{ d.taxPerMu }}</view>
            <view v-if="d.investmentPerMu != null" class="land-detail-meta">亩产投资（万/亩） {{ d.investmentPerMu }}</view>
            <template v-if="d.auctionStatus === 'upcoming' || d.auctionStatus === 'auctioning'">
              <view v-if="d.depositWan != null" class="land-detail-meta">保证金 {{ fmtPrice(d.depositWan, '万元') }}</view>
              <view class="land-detail-meta">起始价 {{ fmtPrice(d.startPriceWan, '万元') }}</view>
            </template>
            <template v-else-if="d.auctionStatus === 'completed'">
              <view class="land-detail-meta">成交价 {{ fmtPrice(d.dealPriceWan, '万元') }}</view>
              <view v-if="d.avgPricePerMu != null" class="land-detail-meta">
                均价 {{ fmtPrice(d.avgPricePerMu, '万元/亩') }}
              </view>
              <view v-if="d.buyerInfo" class="land-detail-meta">买方 {{ d.buyerInfo }}</view>
            </template>
            <view
              v-else-if="d.startPriceWan != null"
              class="land-detail-meta"
            >起拍价 {{ fmtPrice(d.startPriceWan, '万元') }}</view>
          </view>

          <view class="section-title">时间信息</view>
          <view class="card">
            <view v-if="d.listingDate" class="land-kv">
              <text class="land-kv__k">预计挂拍</text>
              <text class="land-kv__v">{{ d.listingDate }}</text>
            </view>
            <view v-if="d.auctionStartAt" class="land-kv">
              <text class="land-kv__k">拍卖开始</text>
              <text class="land-kv__v">{{ d.auctionStartAt }}</text>
            </view>
            <view v-if="d.auctionEndAt" class="land-kv">
              <text class="land-kv__k">拍卖结束</text>
              <text class="land-kv__v">{{ d.auctionEndAt }}</text>
            </view>
            <view v-if="d.completedAt" class="land-kv">
              <text class="land-kv__k">成交时间</text>
              <text class="land-kv__v">{{ d.completedAt }}</text>
            </view>
            <view
              v-if="!d.listingDate && !d.auctionStartAt && !d.auctionEndAt && !d.completedAt"
              class="hint"
            >暂无时间信息</view>
          </view>

          <view v-if="d.remark" class="section-title">备注</view>
          <view v-if="d.remark" class="card">
            <text class="land-remark">{{ d.remark }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="d?.canEdit" class="page-footer land-detail-footer">
        <view class="page-footer__row">
          <button class="btn-primary land-detail-edit-btn" @click="goEdit">编辑</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.land-detail-frame {
  display: flex;
  flex-direction: column;
}

.land-detail-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.land-detail-scroll {
  flex: 1;
  min-height: 0;
}

.land-detail-footer {
  flex-shrink: 0;
}

.land-detail-edit-btn {
  width: 100%;
}

.land-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.land-detail-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.land-detail-tag {
  flex-shrink: 0;
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.land-detail-tag--slate {
  background: #f1f5f9;
  color: #475569;
}

.land-detail-tag--amber {
  background: #fffbeb;
  color: #b45309;
}

.land-detail-tag--mint {
  background: rgba(26, 58, 108, 0.1);
  color: var(--brand, #1a3a6c);
}

.land-detail-meta {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--muted);
  line-height: 1.45;
}

.land-kv {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 12rpx 0;
  font-size: 28rpx;
}

.land-kv__k {
  color: var(--muted);
  flex-shrink: 0;
}

.land-kv__v {
  text-align: right;
  color: var(--ink);
}

.land-remark {
  font-size: 28rpx;
  line-height: 1.55;
  color: var(--ink);
}
</style>
