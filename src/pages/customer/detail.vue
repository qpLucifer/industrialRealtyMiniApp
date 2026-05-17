<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchCustomerDetail, postCustomerFollowUp } from '@/api/customer'
import type { CustomerDetail, CustomerGrade } from '@/types/customer'

const topBarInsetStyle = useTopBarInsetStyle()
const id = ref('')
const d = ref<CustomerDetail | null>(null)
const followNote = ref('')
const followOccurredAt = ref('')
const followGrade = ref<'' | CustomerGrade>('')
const followNextAt = ref('')
const saving = ref(false)

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']

const displayTitle = computed(() => {
  if (!d.value) return ''
  return d.value.titleLine || `${d.value.contactName} · ${d.value.company}`
})

function resetFollowFields() {
  followNote.value = ''
  followOccurredAt.value = formatNowLocal()
  followGrade.value = ''
  followNextAt.value = ''
}

function formatNowLocal() {
  const n = new Date()
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())} ${pad(n.getHours())}:${pad(n.getMinutes())}`
}

function toPickerValue(s: string) {
  return s.replace(' ', 'T').slice(0, 16)
}

function fromPickerValue(s: string) {
  return s.replace('T', ' ')
}

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
})

async function load() {
  d.value = await fetchCustomerDetail(id.value)
  if (!followOccurredAt.value) resetFollowFields()
}

onShow(() => {
  void load()
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/customer/list' }) })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/customer/edit?id=${encodeURIComponent(id.value)}` })
}

function onOccurredChange(e: { detail: { value: string } }) {
  followOccurredAt.value = fromPickerValue(e.detail.value)
}

function onNextChange(e: { detail: { value: string } }) {
  followNextAt.value = fromPickerValue(e.detail.value)
}

function onGradePick(e: { detail: { value: string | number } }) {
  const i = Number(e.detail.value)
  if (i <= 0) {
    followGrade.value = ''
    return
  }
  followGrade.value = grades[i - 1] ?? ''
}

async function onSaveFollow() {
  if (!d.value || saving.value) return
  if (!followNote.value.trim()) {
    uni.showToast({ title: '请填写跟进内容', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const payload: Record<string, string> = {
      slug: id.value,
      note: followNote.value.trim(),
      occurredAt: followOccurredAt.value || formatNowLocal(),
    }
    if (followGrade.value) payload.grade = followGrade.value
    if (followNextAt.value) payload.nextReminderAt = followNextAt.value
    await postCustomerFollowUp(payload as Parameters<typeof postCustomerFollowUp>[0])
    uni.showToast({ title: '跟进已保存', icon: 'none' })
    resetFollowFields()
    await load()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">客户档案</view>
          <view class="top-bar__nav-right">
            <button v-if="d?.canEdit" class="btn-ghost" @click="goEdit">编辑</button>
          </view>
        </view>
      </view>
      <scroll-view v-if="d" scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="card card-glow">
            <text class="cust-head-title">{{ displayTitle }}</text>
            <view class="cust-chip-row">
              <text class="chip ok">{{ d.grade }}</text>
              <text v-if="d.nextReminder" class="chip warn">下次 {{ d.nextReminder }}</text>
              <text class="chip">{{ d.scope }}</text>
              <text class="chip">{{ d.dealStatus }}</text>
            </view>
            <view class="cust-meta">电话 {{ d.phoneMasked || d.phone }}</view>
            <view v-if="d.ownerName" class="cust-meta">负责人 {{ d.ownerName }}</view>
            <view class="cust-meta">最近跟进 {{ d.lastFollow || '—' }}</view>
          </view>

          <view class="section-title">需求与地址</view>
          <view class="card">
            <view class="cust-block-label">需求摘要</view>
            <text class="cust-block-text">{{ d.demandSummary || '—' }}</text>
            <view class="cust-block-label" style="margin-top: 16rpx">地址 / 区域</view>
            <text class="cust-block-text">{{ d.addressHint || '—' }}</text>
          </view>

          <view v-if="d.kv.length" class="section-title">档案信息</view>
          <view v-if="d.kv.length" class="card">
            <view
              v-for="(row, i) in d.kv"
              :key="i"
              class="cust-kv-row"
            >
              <text class="cust-kv-dt">{{ row.dt }}</text>
              <text class="cust-kv-dd">{{ row.dd }}</text>
            </view>
          </view>

          <view class="section-title">跟进时间轴</view>
          <view v-if="d.timeline.length" class="timeline">
            <view v-for="(line, i) in d.timeline" :key="i" class="timeline-item">
              <text class="timeline-line">{{ line }}</text>
            </view>
          </view>
          <view v-else class="card">
            <text class="hint">暂无跟进记录</text>
          </view>

          <view v-if="d.canEdit" class="section-title">写跟进</view>
          <view v-if="d.canEdit" class="card">
            <view class="form-group">
              <text class="label">跟进内容<text class="req">*</text></text>
              <textarea v-model="followNote" placeholder="事实描述、客户原话、下一步" />
            </view>
            <view class="form-group">
              <text class="label">跟进时间<text class="req">*</text></text>
              <picker mode="datetime" :value="toPickerValue(followOccurredAt)" @change="onOccurredChange">
                <view class="picker-like" :class="{ placeholder: !followOccurredAt }">
                  {{ followOccurredAt || '选择时间' }}
                </view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">客户等级调整</text>
              <picker :range="['不调整', ...grades]" @change="onGradePick">
                <view class="picker-like">{{ followGrade || '不调整' }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">下次沟通提醒（可选）</text>
              <picker mode="datetime" :value="toPickerValue(followNextAt)" @change="onNextChange">
                <view class="picker-like" :class="{ placeholder: !followNextAt }">
                  {{ followNextAt || '选择提醒时间' }}
                </view>
              </picker>
            </view>
            <button class="btn-primary" style="width: 100%; margin-top: 16rpx" :disabled="saving" @click="onSaveFollow">
              {{ saving ? '保存中…' : '保存跟进' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
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
  margin-top: 20rpx;
  align-items: center;
}

.cust-meta {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--muted);
  line-height: 1.45;
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

.cust-kv-row {
  display: flex;
  gap: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1px solid var(--border);
}

.cust-kv-row:last-child {
  border-bottom: none;
}

.cust-kv-dt {
  width: 200rpx;
  flex-shrink: 0;
  color: var(--muted);
  font-size: 26rpx;
}

.cust-kv-dd {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.45;
}
</style>
