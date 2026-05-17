<script setup lang="ts">
import { ref } from 'vue'
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

function gradeTagClass(grade: string) {
  if (grade.startsWith('A')) return 'mint'
  if (grade.startsWith('B')) return 'cyan'
  return 'rose'
}

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
          <view class="top-bar__nav-mid">客户详情</view>
          <view class="top-bar__nav-right">
            <button v-if="d?.canEdit" class="btn-ghost" @click="goEdit">编辑</button>
          </view>
        </view>
      </view>
      <scroll-view v-if="d" scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="crm-hero">
            <view class="crm-hero-title">{{ d.company || '—' }}</view>
            <view class="crm-hero-sub">{{ d.titleLine || `${d.contactName} · ${d.company}` }}</view>
            <view class="crm-hero-meta">
              <text>{{ d.contactName }}</text>
              <text class="crm-dot">·</text>
              <text>手机 {{ d.phoneMasked || d.phone }}</text>
              <text class="crm-dot">·</text>
              <text>{{ d.scope }}</text>
              <text v-if="d.ownerName" class="crm-dot">·</text>
              <text v-if="d.ownerName">负责人 {{ d.ownerName }}</text>
            </view>
            <view style="display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 20rpx">
              <text class="crm-tag" :class="gradeTagClass(d.grade)">{{ d.grade }}</text>
              <text class="crm-tag slate">{{ d.dealStatus }}</text>
              <text v-if="d.nextReminder" class="crm-tag amber">下次 {{ d.nextReminder }}</text>
            </view>
          </view>

          <view class="crm-card">
            <view class="crm-card-title">需求与地址</view>
            <view class="crm-card-body">{{ d.demandSummary || '—' }}</view>
            <view class="crm-card-muted">{{ d.addressHint || '—' }}</view>
            <view class="crm-card-muted" style="margin-top: 8rpx">最近跟进 {{ d.lastFollow || '—' }}</view>
          </view>

          <view v-if="d.kv.length" class="crm-card">
            <view class="crm-card-title">档案字段</view>
            <view v-for="(row, i) in d.kv" :key="i" class="crm-kv-row">
              <text class="crm-kv-dt">{{ row.dt }}</text>
              <text class="crm-kv-dd">{{ row.dd }}</text>
            </view>
          </view>

          <view class="crm-card">
            <view class="crm-card-title">跟进时间轴</view>
            <view v-if="d.timeline.length">
              <view v-for="(line, i) in d.timeline" :key="i" class="crm-timeline-item">
                <text class="crm-timeline-line">{{ line }}</text>
              </view>
            </view>
            <text v-else class="crm-card-muted">暂无跟进记录</text>
          </view>

          <view v-if="d.canEdit" class="crm-card crm-card-accent">
            <view class="crm-card-title">写跟进</view>
            <view class="crm-form-grid">
              <view class="form-group">
                <text class="label">跟进内容<text class="req">*</text></text>
                <textarea v-model="followNote" placeholder="事实描述、客户原话、下一步" />
              </view>
              <view class="form-group">
                <text class="label">跟进时间<text class="req">*</text></text>
                <picker mode="datetime" :value="toPickerValue(followOccurredAt)" @change="onOccurredChange">
                  <view class="crm-picker-field" :class="{ placeholder: !followOccurredAt }">
                    {{ followOccurredAt || '选择时间' }}
                  </view>
                </picker>
              </view>
              <view class="form-group">
                <text class="label">客户等级调整</text>
                <picker :range="['不调整', ...grades]" @change="onGradePick">
                  <view class="crm-picker-field">{{ followGrade || '不调整' }}</view>
                </picker>
              </view>
              <view class="form-group">
                <text class="label">下次沟通提醒（可选）</text>
                <picker mode="datetime" :value="toPickerValue(followNextAt)" @change="onNextChange">
                  <view class="crm-picker-field" :class="{ placeholder: !followNextAt }">
                    {{ followNextAt || '选择提醒时间' }}
                  </view>
                </picker>
              </view>
            </view>
            <button class="btn-primary crm-follow-btn" :disabled="saving" @click="onSaveFollow">
              {{ saving ? '保存中…' : '保存跟进' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped src="@/styles/customer-crm.css"></style>
