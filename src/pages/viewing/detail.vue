<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchViewingDetail, deleteViewing } from '@/api/extra'
import { prepareWorkTaskSubscribe } from '@/utils/wechatSubscribe'
import type { ViewingDetail } from '@/types/viewingDeal'
import { consumeViewingDetailRefresh } from '@/utils/viewingNav'
import { markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import { viewingPhase, viewingPhaseLabel, viewingPhaseTone } from '@/utils/viewingStatus'

const viewingId = ref(0)
const detail = ref<ViewingDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const canceling = ref(false)

const phase = computed(() => {
  const d = detail.value
  if (!d) return 'ended' as const
  return viewingPhase(d.start, d.end)
})

const statusLabel = computed(() => viewingPhaseLabel(phase.value))
const statusTone = computed(() => viewingPhaseTone(phase.value))

const propertyLabel = computed(() => {
  const d = detail.value
  if (!d) return '—'
  const title = String(d.propertyTitle || '').trim()
  if (title) return title
  return String(d.propertyRef || d.propertyId || d.miniPropCode || '—').trim() || '—'
})

const customerLabel = computed(() => {
  const d = detail.value
  if (!d) return '—'
  return String(d.customerName || d.customerSlug || '—').trim() || '—'
})

const companionsLabel = computed(() => {
  const d = detail.value
  if (!d) return '—'
  const c = String(d.companions || d.miniStaff || '').trim()
  return c || '—'
})

function fmtSlot(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

onLoad((q) => {
  const id = q?.id != null ? Number(q.id) : NaN
  if (Number.isFinite(id) && id > 0) {
    viewingId.value = id
    void load()
  } else {
    loadError.value = '缺少带看记录'
  }
})

onShow(() => {
  if (viewingId.value && consumeViewingDetailRefresh(viewingId.value)) void load()
})

async function load() {
  if (!viewingId.value) return
  loading.value = true
  loadError.value = ''
  detail.value = null
  try {
    detail.value = await fetchViewingDetail(viewingId.value)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/home' }) })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/viewing/new?id=${viewingId.value}` })
}

function onCancel() {
  if (!viewingId.value || canceling.value) return
  uni.showModal({
    title: '取消带看',
    content: '确定取消该带看记录？',
    confirmText: '取消带看',
    confirmColor: '#e11d48',
    success: async (res) => {
      if (!res.confirm) return
      canceling.value = true
      try {
        await prepareWorkTaskSubscribe()
        await deleteViewing(viewingId.value)
        markListStale('viewing-list')
        markWorkbenchStale()
        uni.showToast({ title: '已取消', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 300)
      } catch (e) {
        uni.showToast({ title: e instanceof Error ? e.message : '操作失败', icon: 'none' })
      } finally {
        canceling.value = false
      }
    },
  })
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub viewing-detail-frame">
      <NavIconBar title="带看详情" @back="back" />

      <view v-if="loading" class="page-scroll viewing-detail-state">
        <text class="hint">加载中…</text>
      </view>

      <view v-else-if="loadError && !detail" class="page-scroll viewing-detail-state">
        <text class="hint" style="margin-bottom: 24rpx">{{ loadError }}</text>
        <button class="btn-secondary" @click="load">重试</button>
      </view>

      <scroll-view v-else-if="detail" scroll-y :show-scrollbar="false" class="page-scroll viewing-detail-scroll">
        <view class="page-scroll__inner">
          <view class="card card-glow">
            <view class="viewing-detail-head">
              <text class="viewing-detail-title">{{ propertyLabel }}</text>
              <text class="viewing-detail-tag" :class="`viewing-detail-tag--${statusTone}`">
                {{ statusLabel }}
              </text>
            </view>
            <view class="viewing-detail-meta">客户 {{ customerLabel }}</view>
            <view v-if="detail.score" class="viewing-detail-meta">等级 {{ detail.score }}</view>
          </view>

          <view class="section-title">带看时间</view>
          <view class="card">
            <view class="viewing-kv">
              <text class="viewing-kv__k">开始</text>
              <text class="viewing-kv__v">{{ fmtSlot(detail.start) }}</text>
            </view>
            <view class="viewing-kv">
              <text class="viewing-kv__k">结束</text>
              <text class="viewing-kv__v">{{ fmtSlot(detail.end) }}</text>
            </view>
          </view>

          <view class="section-title">陪同人员</view>
          <view class="card">
            <text class="viewing-companions">{{ companionsLabel }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="detail" class="page-footer viewing-detail-footer">
        <view class="page-footer__row viewing-detail-footer__row">
          <button class="btn-secondary viewing-detail-cancel-btn" :disabled="canceling" @click="onCancel">
            取消带看
          </button>
          <button class="btn-primary viewing-detail-edit-btn" @click="goEdit">编辑</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.viewing-detail-frame {
  display: flex;
  flex-direction: column;
}

.viewing-detail-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.viewing-detail-scroll {
  flex: 1;
  min-height: 0;
}

.viewing-detail-footer {
  flex-shrink: 0;
}

.viewing-detail-footer__row {
  display: flex;
  gap: 20rpx;
}

.viewing-detail-cancel-btn,
.viewing-detail-edit-btn {
  flex: 1;
  margin: 0;
}

.viewing-detail-cancel-btn {
  color: #e11d48;
  border-color: rgba(225, 29, 72, 0.35);
}

.viewing-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.viewing-detail-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.viewing-detail-tag {
  flex-shrink: 0;
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.viewing-detail-tag--upcoming {
  background: #fffbeb;
  color: #b45309;
}

.viewing-detail-tag--active {
  background: rgba(26, 58, 108, 0.12);
  color: var(--brand, #1a3a6c);
}

.viewing-detail-tag--ended {
  background: #f1f5f9;
  color: #64748b;
}

.viewing-detail-meta {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--muted);
  line-height: 1.45;
}

.viewing-kv {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 12rpx 0;
  font-size: 28rpx;
}

.viewing-kv__k {
  color: var(--muted);
  flex-shrink: 0;
}

.viewing-kv__v {
  text-align: right;
  color: var(--ink);
}

.viewing-companions {
  font-size: 28rpx;
  line-height: 1.55;
  color: var(--ink);
}
</style>
