<script setup lang="ts">
import { computed, ref } from 'vue'
import { createMultiPickerSession, destroyMultiPickerSession } from '@/utils/pickerSession'
import { propertyNavKey, searchPropertyPicker } from '@/api/property'
import type { PropertyListItem } from '@/types/property'

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

export type PropertyPickOption = { key: string; label: string }

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    hint?: string
    sheetTitle?: string
    minCount?: number
    searchPlaceholder?: string
  }>(),
  {
    placeholder: '请选择房源（可多选）',
    sheetTitle: '选择房源',
    minCount: 1,
    searchPlaceholder: '搜索编号 / 标题 / 区位…',
  },
)

const pickedOptions = ref<PropertyPickOption[]>([])

const labelByKey = computed(() => {
  const m = new Map<string, string>()
  for (const p of pickedOptions.value) {
    if (p.key && p.label) m.set(p.key, p.label)
  }
  return m
})

const displayText = computed(() => {
  const labels = model.value.map((k) => labelByKey.value.get(k)).filter(Boolean) as string[]
  return labels.length ? labels.join('、') : props.placeholder
})

const showPlaceholder = computed(() => !model.value.length)

function formatPropertyDisplayLabel(code: string, title: string) {
  const c = String(code || '').trim() || '—'
  const t = String(title || '').trim()
  return t ? `${c} · ${t}` : c
}

function propertyPickLabel(p: PropertyListItem) {
  return formatPropertyDisplayLabel(String(p.code || p.id || ''), String(p.title || ''))
}

async function searchProperties(q: string) {
  const r = await searchPropertyPicker(q, 1)
  return r.list.map((p) => ({
    id: propertyNavKey(p),
    name: propertyPickLabel(p),
  }))
}

function mergePicked(selections: { id?: string; name?: string }[]) {
  for (const s of selections) {
    const key = String(s.id || '').trim()
    if (!key) continue
    const label = String(s.name || '').trim() || key
    if (!pickedOptions.value.some((x) => x.key === key)) {
      pickedOptions.value = [...pickedOptions.value, { key, label }]
    }
  }
}

function openSheet() {
  const sessionId = createMultiPickerSession({
    searchFn: searchProperties,
    title: props.sheetTitle,
    searchPlaceholder: props.searchPlaceholder,
    minCount: props.minCount,
    initialIds: [...model.value],
  })
  uni.navigateTo({
    url: `/pages/common/multi-picker?id=${encodeURIComponent(sessionId)}`,
    events: {
      picked: (payload: { ids?: string[]; selections?: { id: string; name: string }[] }) => {
        if (Array.isArray(payload?.ids)) model.value = payload.ids.map(String)
        if (Array.isArray(payload?.selections)) mergePicked(payload.selections)
      },
    },
    fail: () => {
      destroyMultiPickerSession(sessionId)
      uni.showToast({ title: '无法打开选择页', icon: 'none' })
    },
  })
}

/** Seed labels when parent resolves keys (e.g. route prefill). */
function setPickedOptions(rows: PropertyPickOption[]) {
  pickedOptions.value = rows.filter((r) => r.key)
}

defineExpose({ setPickedOptions })
</script>

<template>
  <view class="form-group property-multi-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view class="sop-trigger" :class="{ 'sop-trigger--placeholder': showPlaceholder }" @click="openSheet">
      <text class="sop-trigger__text">{{ displayText }}</text>
      <text class="sop-trigger__chev">›</text>
    </view>
    <text v-if="hint" class="hint property-multi-field__hint">{{ hint }}</text>
  </view>
</template>

<style scoped>
.sop-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  min-height: 88rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(15, 23, 42, 0.06);
  border: 2rpx solid rgba(148, 163, 184, 0.22);
  box-sizing: border-box;
}

.sop-trigger--placeholder .sop-trigger__text {
  color: var(--muted, #94a3b8);
  font-weight: 400;
}

.sop-trigger__text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  line-height: 1.4;
}

.sop-trigger__chev {
  font-size: 36rpx;
  color: var(--muted, #94a3b8);
  transform: rotate(90deg);
}

.property-multi-field__hint {
  display: block;
  margin-top: 8rpx;
}
</style>
