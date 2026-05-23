<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { postCustomerFollowUp } from '@/api/customer'
import { markCustomerDetailStale, markCustomerListStale } from '@/utils/customerNav'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { CustomerGrade } from '@/types/customer'
import { nowBeijingYmdHm } from '@/utils/beijingTime'

const id = ref('')
const followNote = ref('')
const followGrade = ref<'' | CustomerGrade>('')
const saving = ref(false)

/** Native picker values (YYYY-MM-DD / HH:mm) — kept in page, not in a child component */
const occurredDate = ref('')
const occurredTime = ref('')
const nextDate = ref('')
const nextTime = ref('14:00')

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']
const gradeRange = ['不调整', ...grades]

function parseNow() {
  const now = nowBeijingYmdHm()
  const m = now.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)
  if (m) {
    occurredDate.value = m[1]
    occurredTime.value = m[2]
  }
}

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
  parseNow()
})

function back() {
  uni.navigateBack()
}

function occurredAtPayload() {
  if (!occurredDate.value || !occurredTime.value) return nowBeijingYmdHm()
  return `${occurredDate.value} ${occurredTime.value}`
}

function nextReminderPayload() {
  if (!nextDate.value) return ''
  return `${nextDate.value} ${nextTime.value || '14:00'}`
}

function onGradePick(e: { detail: { value: string | number } }) {
  const i = Number(e.detail.value)
  followGrade.value = i <= 0 ? '' : (grades[i - 1] ?? '')
}

function onOccurredDateChange(e: { detail: { value: string } }) {
  occurredDate.value = e.detail.value
}

function onOccurredTimeChange(e: { detail: { value: string } }) {
  occurredTime.value = e.detail.value
}

function onNextDateChange(e: { detail: { value: string } }) {
  nextDate.value = e.detail.value
}

function onNextTimeChange(e: { detail: { value: string } }) {
  nextTime.value = e.detail.value
}

function clearNextReminder() {
  nextDate.value = ''
  nextTime.value = '14:00'
}

async function onSaveFollow() {
  if (!id.value || saving.value) return
  if (!followNote.value.trim()) {
    uni.showToast({ title: '请填写跟进内容', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const payload: Record<string, string> = {
      slug: id.value,
      note: followNote.value.trim(),
      occurredAt: occurredAtPayload(),
    }
    if (followGrade.value) payload.grade = followGrade.value
    const nextAt = nextReminderPayload()
    if (nextAt) payload.nextReminderAt = nextAt
    await postCustomerFollowUp(payload as Parameters<typeof postCustomerFollowUp>[0])
    markCustomerDetailStale(id.value)
    markCustomerListStale()
    markWorkbenchStale()
    uni.showToast({ title: '跟进已保存', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
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
      <NavIconBar title="写跟进" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll customer-form-scroll">
        <view class="page-scroll__inner">
          <view class="card customer-form">
            <view class="form-group">
              <text class="label">跟进内容<text class="req">*</text></text>
              <textarea
                v-model="followNote"
                class="field-textarea"
                placeholder="事实描述、客户原话、下一步"
                :maxlength="2000"
                :cursor-spacing="120"
                :show-confirm-bar="true"
                :adjust-position="true"
                :auto-height="false"
              />
            </view>

            <view class="form-group">
              <text class="label">跟进日期</text>
              <picker mode="date" :value="occurredDate" @change="onOccurredDateChange">
                <view class="picker-like">{{ occurredDate }}</view>
              </picker>
            </view>

            <view class="form-group">
              <text class="label">跟进时刻</text>
              <picker mode="time" :value="occurredTime" @change="onOccurredTimeChange">
                <view class="picker-like">{{ occurredTime }}</view>
              </picker>
            </view>

            <view class="form-group">
              <text class="label">客户等级调整</text>
              <picker mode="selector" :range="gradeRange" @change="onGradePick">
                <view class="picker-like">{{ followGrade || '不调整' }}</view>
              </picker>
            </view>

            <view class="form-group">
              <text class="label">下次提醒日期（可选）</text>
              <picker
                mode="date"
                :value="nextDate || occurredDate"
                @change="onNextDateChange"
              >
                <view class="picker-like" :class="{ placeholder: !nextDate }">
                  {{ nextDate || '点击选择日期' }}
                </view>
              </picker>
            </view>

            <view class="form-group">
              <text class="label">下次提醒时刻（可选）</text>
              <picker mode="time" :value="nextTime" @change="onNextTimeChange">
                <view class="picker-like" :class="{ placeholder: !nextDate }">{{ nextTime }}</view>
              </picker>
              <text v-if="nextDate" class="follow-hint" @tap="clearNextReminder">清除提醒</text>
            </view>

            <button class="btn-primary follow-save" :disabled="saving" @click="onSaveFollow">
              {{ saving ? '保存中…' : '保存跟进' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.customer-form-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.page-scroll__inner {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* One native picker per row — block host avoids Android narrow tile glitch */
.customer-form .form-group picker {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.customer-form .picker-like {
  width: 100%;
  box-sizing: border-box;
}

.customer-form .picker-like.placeholder {
  color: #94a3b8;
}

.follow-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #64748b;
}

.follow-save {
  width: 100%;
  margin-top: 16rpx;
}
</style>
