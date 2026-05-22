<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import DateTimeField from '@/components/DateTimeField.vue'
import { postCustomerFollowUp } from '@/api/customer'
import { markCustomerDetailStale, markCustomerListStale } from '@/utils/customerNav'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { CustomerGrade } from '@/types/customer'
import { nowBeijingYmdHm } from '@/utils/beijingTime'

const id = ref('')
const followNote = ref('')
const followOccurredAt = ref('')
const followGrade = ref<'' | CustomerGrade>('')
const followNextAt = ref('')
const saving = ref(false)

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']

onLoad((q) => {
  if (q?.id) id.value = String(q.id)
  followOccurredAt.value = nowBeijingYmdHm()
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
      occurredAt: followOccurredAt.value || nowBeijingYmdHm(),
    }
    if (followGrade.value) payload.grade = followGrade.value
    if (followNextAt.value) payload.nextReminderAt = followNextAt.value
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
                :cursor-spacing="160"
                :show-confirm-bar="true"
                :adjust-position="true"
                :hold-keyboard="true"
                :auto-height="false"
              />
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

<style scoped>
.customer-form-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.page-scroll__inner {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
