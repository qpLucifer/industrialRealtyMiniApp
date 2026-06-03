<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import CustomerFollowTimelineItem from '@/components/CustomerFollowTimelineItem.vue'
import { fetchCustomerDetail } from '@/api/customer'
import { useSecuritySettings } from '@/composables/useSecuritySettings'
import { consumeCustomerDetailRefresh } from '@/utils/customerNav'
import type { CustomerDetail } from '@/types/customer'
import { formatBeijingDisplay } from '@/utils/beijingTime'
import { customerAvatarToneClass, customerInitials } from '@/utils/customerDisplay'
import { toFollowEntry } from '@/utils/customerFollowTimeline'
import { resolveMediaUrl } from '@/utils/request'

const { noCopyClass } = useSecuritySettings()

const id = ref('')
const d = ref<CustomerDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const expandedTimelineIdx = ref<number | null>(null)

const displayTitle = computed(() => {
  if (!d.value) return ''
  return d.value.titleLine || `${d.value.contactName} · ${d.value.company}`
})

const customerAvatarSrc = computed(() => {
  const u = String(d.value?.avatarUrl || '').trim()
  return u ? resolveMediaUrl(u) : ''
})

const timelineEntries = computed(() => {
  const rows = d.value?.timeline ?? []
  return rows.map((raw) => toFollowEntry(raw)).filter((x): x is NonNullable<typeof x> => Boolean(x))
})

const canDialPhone = computed(() => {
  const p = String(d.value?.phone || '').trim()
  if (!p || p.includes('*')) return false
  const digits = p.replace(/\D/g, '')
  return digits.length >= 7
})

function onCallPhone() {
  if (!canDialPhone.value || !d.value) {
    uni.showToast({ title: '号码不可用', icon: 'none' })
    return
  }
  const digits = String(d.value.phone).replace(/\s/g, '').replace(/[^\d+]/g, '')
  uni.makePhoneCall({
    phoneNumber: digits,
    fail: () => uni.showToast({ title: '无法唤起拨号', icon: 'none' }),
  })
}

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
  if (id.value) void load()
})

onShow(() => {
  if (id.value && consumeCustomerDetailRefresh(id.value)) {
    void load()
  }
})

async function load() {
  if (!id.value) {
    loadError.value = '缺少客户标识'
    return
  }
  loading.value = true
  loadError.value = ''
  expandedTimelineIdx.value = null
  d.value = null
  try {
    d.value = await fetchCustomerDetail(id.value)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/customer/list' }) })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/customer/edit?id=${encodeURIComponent(id.value)}` })
}

function goFollow() {
  uni.navigateTo({ url: `/pages/customer/follow?id=${encodeURIComponent(id.value)}` })
}

function toggleTimelineMedia(idx: number) {
  expandedTimelineIdx.value = expandedTimelineIdx.value === idx ? null : idx
}
</script>

<template>
  <view class="app-shell" :class="noCopyClass">
    <view class="page-frame screen active screen--sub cust-detail-frame">
      <NavIconBar title="客户档案" @back="back" />

      <view v-if="loading" class="page-scroll cust-detail-state">
        <text class="hint">加载中…</text>
      </view>

      <view v-else-if="loadError && !d" class="page-scroll cust-detail-state">
        <text class="hint" style="margin-bottom: 24rpx">{{ loadError }}</text>
        <button class="btn-secondary" @click="load">重试</button>
      </view>

      <scroll-view v-else-if="d" scroll-y :show-scrollbar="false" class="page-scroll cust-detail-scroll">
        <view class="page-scroll__inner">
          <view class="card card-glow">
            <view class="cust-detail-head">
              <view class="cust-avatar cust-detail-avatar" :class="d ? customerAvatarToneClass(d) : ''">
                <image v-if="d.avatarUrl" class="cust-avatar__img" :src="customerAvatarSrc" mode="aspectFill" />
                <text v-else class="cust-avatar__text">{{ customerInitials(d) }}</text>
              </view>
              <view class="cust-detail-head__text">
                <text class="cust-head-title">{{ displayTitle }}</text>
                <view class="cust-chip-row">
                  <text class="chip ok">{{ d.grade }}</text>
                  <text v-if="d.nextReminder" class="chip warn">下次 {{ d.nextReminder }}</text>
                  <text class="chip">{{ d.dealStatus }}</text>
                </view>
              </view>
            </view>
            <view v-if="canDialPhone" class="cust-meta cust-meta--dial" @tap="onCallPhone">
              电话 {{ d.phone }}
              <text class="cust-meta__action"> 拨打</text>
            </view>
            <view v-else class="cust-meta">电话 {{ d.phone }}</view>
            <view v-if="d.district" class="cust-meta">所属区域 {{ d.district }}</view>
            <view v-if="d.ownerName" class="cust-meta">负责人 {{ d.ownerName }}</view>
            <view class="cust-meta">最近跟进 {{ formatBeijingDisplay(d.lastFollow) || d.lastFollow || '—' }}</view>
          </view>

          <view class="section-title">需求与地址</view>
          <view class="card">
            <view class="cust-block-label">需求摘要</view>
            <text class="cust-block-text">{{ d.demandSummary || '—' }}</text>
            <view v-if="d.district" class="cust-block-label" style="margin-top: 16rpx">所属区域</view>
            <text v-if="d.district" class="cust-block-text">{{ d.district }}</text>
            <view class="cust-block-label" style="margin-top: 16rpx">地址提示</view>
            <text class="cust-block-text">{{ d.addressHint || '—' }}</text>
          </view>

          <view class="section-title">跟进时间轴</view>
          <view v-if="timelineEntries.length" class="timeline">
            <CustomerFollowTimelineItem
              v-for="(entry, i) in timelineEntries"
              :key="i"
              :entry="entry"
              :media-expanded="expandedTimelineIdx === i"
              @toggle-media="toggleTimelineMedia(i)"
            />
          </view>
          <view v-else class="card">
            <text class="hint">暂无跟进记录</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="d?.canEdit" class="page-footer cust-detail-footer">
        <view class="page-footer__row">
          <button class="btn-primary" @click="goFollow">写跟进</button>
          <button class="btn-secondary cust-detail-edit-btn" @click="goEdit">编辑</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.cust-detail-frame {
  display: flex;
  flex-direction: column;
}

.cust-detail-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.cust-detail-scroll {
  flex: 1;
  min-height: 0;
}

.cust-detail-footer {
  flex-shrink: 0;
}

.cust-detail-edit-btn {
  border-color: rgba(52, 211, 153, 0.35);
  color: var(--mint);
}

.cust-detail-head {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 8rpx;
}

.cust-detail-head__text {
  flex: 1;
  min-width: 0;
}

.cust-detail-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 22rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cust-detail-avatar.cust-avatar--brand {
  background: linear-gradient(145deg, #1a3a6c, #2d4f8c);
}

.cust-detail-avatar.cust-avatar--blue {
  background: linear-gradient(145deg, #0284c7, #38bdf8);
}

.cust-detail-avatar.cust-avatar--slate {
  background: linear-gradient(145deg, #64748b, #94a3b8);
}

.cust-detail-avatar .cust-avatar__img {
  width: 100%;
  height: 100%;
  border-radius: 22rpx;
}

.cust-detail-avatar .cust-avatar__text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.cust-head-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.cust-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
  align-items: center;
}

.cust-meta {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--muted);
  line-height: 1.45;
}

.cust-meta--dial {
  color: var(--navy);
}

.cust-meta__action {
  color: var(--mint);
  font-weight: 600;
}

.cust-block-label {
  font-size: 24rpx;
  color: var(--muted);
}

.cust-block-text {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  line-height: 1.55;
}
</style>
