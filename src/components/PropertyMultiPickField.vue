<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { createMultiPickerSession, destroyMultiPickerSession } from '@/utils/pickerSession'
import { propertyNavKey, searchPropertyPicker } from '@/api/property'
import { isInternalPropertyId, propertyDisplayName, propertyPickerNavKey } from '@/utils/propertyNav'
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
    disabled?: boolean
    /** Parent-resolved labels (route prefill, edit row). */
    initialOptions?: PropertyPickOption[]
  }>(),
  {
    placeholder: '请选择房源（可多选）',
    sheetTitle: '选择房源',
    minCount: 1,
    searchPlaceholder: '搜索编号 / 标题 / 区位…',
    disabled: false,
    initialOptions: () => [],
  },
)

const pickedOptions = ref<PropertyPickOption[]>([])

const labelByKey = computed(() => {
  const m = new Map<string, string>()
  for (const p of pickedOptions.value) {
    if (p.key && p.label) m.set(p.key, p.label)
  }
  // Parent-resolved labels win (e.g. replace transient "加载中…").
  for (const p of props.initialOptions) {
    if (p.key && p.label) m.set(p.key, p.label)
  }
  return m
})

function lineForKey(key: string) {
  const k = String(key || '').trim()
  if (!k) return ''
  const label = labelByKey.value.get(k)
  if (label && !isTransientLabel(label, k)) return label
  return ''
}

const displayText = computed(() => {
  const lines = model.value.map(lineForKey).filter(Boolean)
  return lines.length ? lines.join('、') : props.placeholder
})

const showPlaceholder = computed(() => !model.value.some((k) => lineForKey(k)))

function propertyPickLabel(p: PropertyListItem) {
  return propertyDisplayName({
    title: p.title,
    code: p.code || p.id,
    fallbackKey: propertyNavKey(p),
  })
}

function mergePicked(selections: { id?: string; name?: string }[]) {
  let next = [...pickedOptions.value]
  for (const s of selections) {
    const key = String(s.id || '').trim()
    if (!key) continue
    const label = String(s.name || '').trim() || key
    const idx = next.findIndex((x) => x.key === key)
    if (idx >= 0) {
      if (next[idx].label !== label) {
        next = [...next]
        next[idx] = { key, label }
      }
    } else {
      next = [...next, { key, label }]
    }
  }
  pickedOptions.value = next
}

function isTransientLabel(label: string | undefined, key?: string) {
  const s = String(label || '').trim()
  const k = String(key || '').trim()
  if (!s) return true
  if (s === '加载中…') return true
  if (k && s === k) return true
  if (isInternalPropertyId(s)) return true
  return false
}

let resolveSeq = 0
async function resolveMissingLabels(keys: string[]) {
  const pending = keys.filter((k) => k && isTransientLabel(labelByKey.value.get(k), k))
  if (!pending.length) return
  const seq = ++resolveSeq
  for (const key of pending) {
    if (seq !== resolveSeq) return
    if (labelByKey.value.get(key)) continue
    try {
      const r = await searchPropertyPicker(key, 1)
      const hit = r.list.find((p) => propertyNavKey(p) === key || p.code === key || p.id === key)
      if (hit) {
        const navKey = propertyPickerNavKey({ id: hit.id, code: hit.code })
        mergePicked([{ id: navKey, name: propertyPickLabel(hit) }])
        if (navKey !== key && model.value.includes(key)) {
          model.value = model.value.map((id) => (id === key ? navKey : id))
        }
      }
    } catch {
      /* keep resolving via parent */
    }
  }
}

watch(
  () => props.initialOptions,
  (rows) => {
    if (!rows?.length) return
    mergePicked(rows.map((r) => ({ id: r.key, name: r.label })))
  },
  { immediate: true, deep: true },
)

watch(
  () => [...model.value],
  (keys) => {
    void resolveMissingLabels(keys)
  },
  { immediate: true },
)

async function searchProperties(q: string) {
  const r = await searchPropertyPicker(q, 1)
  return r.list.map((p) => ({
    id: propertyPickerNavKey({ id: p.id, code: p.code }),
    name: propertyPickLabel(p),
  }))
}

function openSheet() {
  if (props.disabled) return
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
  pickedOptions.value = rows.filter((r) => r.key).map((r) => ({ key: r.key, label: r.label || r.key }))
}

defineExpose({ setPickedOptions })
</script>

<template>
  <view class="form-group property-multi-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view
      class="sop-trigger"
      :class="{
        'sop-trigger--placeholder': showPlaceholder,
        'sop-trigger--disabled': disabled,
      }"
      @click="openSheet"
    >
      <view class="sop-trigger__text">{{ displayText }}</view>
      <text v-if="!disabled" class="sop-trigger__chev">›</text>
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

.sop-trigger--disabled {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.sop-trigger__text {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
  line-height: 1.4;
  word-break: break-all;
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
