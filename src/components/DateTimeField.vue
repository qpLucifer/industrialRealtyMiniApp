<script setup lang="ts">
import { computed, watch } from 'vue'
import { formatBeijingYmdHm } from '@/utils/beijingTime'
import { formatBeijingYmdHm } from '@/utils/beijingTime'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择日期时间',
    disabled: false,
  },
)

function splitDateTime(raw: string) {
  const s = String(raw || '').trim()
  const m = s.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)
  if (m) return { date: m[1], time: m[2] }
  const today = formatBeijingYmdHm().slice(0, 10)
  return { date: today, time: '14:00' }
}

const parts = computed(() => splitDateTime(model.value))

function merge(date: string, time: string) {
  model.value = `${date} ${time}`
}

function onDateChange(e: { detail: { value: string } }) {
  merge(e.detail.value, parts.value.time)
}

function onTimeChange(e: { detail: { value: string } }) {
  merge(parts.value.date, e.detail.value)
}

watch(
  () => model.value,
  (v) => {
    if (!String(v || '').trim()) return
  },
)
</script>

<template>
  <view class="dt-field" :class="{ 'dt-field--disabled': disabled }">
    <text v-if="label" class="dt-field__label">{{ label }}</text>
    <view class="dt-field__row">
      <picker mode="date" :value="parts.date" :disabled="disabled" @change="onDateChange">
        <view class="dt-field__picker" :class="{ 'form-control--disabled': disabled }">
          <text :class="{ 'dt-field__placeholder': !model }">{{ parts.date || '日期' }}</text>
        </view>
      </picker>
      <picker mode="time" :value="parts.time" :disabled="disabled" @change="onTimeChange">
        <view class="dt-field__picker" :class="{ 'form-control--disabled': disabled }">
          <text :class="{ 'dt-field__placeholder': !model }">{{ parts.time || '时间' }}</text>
        </view>
      </picker>
    </view>
    <text v-if="!model && placeholder" class="dt-field__hint">{{ placeholder }}</text>
  </view>
</template>
