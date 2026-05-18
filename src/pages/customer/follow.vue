<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import DateTimeField from '@/components/DateTimeField.vue'
import { postCustomerFollowUp } from '@/api/customer'
import type { CustomerGrade } from '@/types/customer'

const id = ref('')
const followNote = ref('')
const followOccurredAt = ref('')
const followGrade = ref<'' | CustomerGrade>('')
const followNextAt = ref('')
const saving = ref(false)

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']

function formatNowLocal() {
  const n = new Date()
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())} ${pad(n.getHours())}:${pad(n.getMinutes())}`
}

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
  followOccurredAt.value = formatNowLocal()
})

function back() {
  uni.navigateBack()
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
      occurredAt: followOccurredAt.value || formatNowLocal(),
    }
    if (followGrade.value) payload.grade = followGrade.value
    if (followNextAt.value) payload.nextReminderAt = followNextAt.value
    await postCustomerFollowUp(payload as Parameters<typeof postCustomerFollowUp>[0])
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
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="card">
            <view class="form-group">
              <text class="label">跟进内容<text class="req">*</text></text>
              <textarea v-model="followNote" placeholder="事实描述、客户原话、下一步" />
            </view>
            <DateTimeField v-model="followOccurredAt" label="跟进时间" placeholder="选择跟进时间" />
            <view class="form-group">
              <text class="label">客户等级调整</text>
              <picker :range="['不调整', ...grades]" @change="onGradePick">
                <view class="picker-like">{{ followGrade || '不调整' }}</view>
              </picker>
            </view>
            <DateTimeField v-model="followNextAt" label="下次沟通提醒（可选）" placeholder="选择提醒时间" />
            <button class="btn-primary" style="width: 100%; margin-top: 16rpx" :disabled="saving" @click="onSaveFollow">
              {{ saving ? '保存中…' : '保存跟进' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
