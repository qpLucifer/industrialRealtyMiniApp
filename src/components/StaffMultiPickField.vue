<script setup lang="ts">
import { computed, ref, watch } from 'vue'

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

export type StaffPickOption = { id: string; name: string }

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(
  defineProps<{
    /** Static list when searchFn is omitted */
    options?: StaffPickOption[]
    /** Server search; when set, options prop is only used for display names of selected ids */
    searchFn?: (q: string) => Promise<StaffPickOption[]>
    label?: string
    placeholder?: string
    hint?: string
    sheetTitle?: string
    minCount?: number
    searchPlaceholder?: string
  }>(),
  {
    options: () => [],
    placeholder: '请选择陪同员工',
    sheetTitle: '选择陪同员工',
    minCount: 1,
    searchPlaceholder: '搜索姓名…',
  },
)

const visible = ref(false)
const draft = ref<string[]>([])
const keyword = ref('')
const sheetOptions = ref<StaffPickOption[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0

const nameById = computed(() => {
  const m = new Map<string, string>()
  for (const s of [...props.options, ...sheetOptions.value]) {
    if (s.id && s.name) m.set(s.id, s.name)
  }
  return m
})

const displayText = computed(() => {
  const names = model.value.map((id) => nameById.value.get(id)).filter(Boolean) as string[]
  return names.length ? names.join('、') : props.placeholder
})

const showPlaceholder = computed(() => !model.value.length)

watch(visible, (open) => {
  if (open) {
    draft.value = [...model.value]
    keyword.value = ''
    void loadSheetOptions(true)
    return
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

watch(keyword, () => {
  if (!visible.value) return
  if (!props.searchFn) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void loadSheetOptions(true)
  }, 320)
})

async function loadSheetOptions(reset: boolean) {
  if (!props.searchFn) {
    sheetOptions.value = [...props.options]
    return
  }
  const seq = ++searchSeq
  if (reset) loading.value = true
  try {
    const list = await props.searchFn(keyword.value.trim())
    if (seq !== searchSeq) return
    sheetOptions.value = list
    for (const id of draft.value) {
      if (!list.some((s) => s.id === id)) {
        const fromOpts = props.options.find((s) => s.id === id)
        if (fromOpts) sheetOptions.value = [fromOpts, ...sheetOptions.value]
      }
    }
  } catch (e) {
    if (seq !== searchSeq) return
    sheetOptions.value = []
    uni.showToast({ title: e instanceof Error ? e.message : '搜索失败', icon: 'none' })
  } finally {
    if (seq === searchSeq) loading.value = false
  }
}

const listForSheet = computed(() => {
  if (props.searchFn) return sheetOptions.value
  const q = keyword.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

function openSheet() {
  const hasStatic = props.options.length > 0
  if (!props.searchFn && !hasStatic) {
    uni.showToast({ title: '暂无可选员工', icon: 'none' })
    return
  }
  visible.value = true
}

function closeSheet() {
  visible.value = false
}

function confirmSheet() {
  if (props.minCount > 0 && draft.value.length < props.minCount) {
    uni.showToast({
      title: props.minCount > 1 ? `至少选择 ${props.minCount} 人` : '请至少选择一人',
      icon: 'none',
    })
    return
  }
  model.value = [...draft.value]
  closeSheet()
}

function clearKeyword() {
  keyword.value = ''
}

function onSearchConfirm() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  void loadSheetOptions(true)
}

function isChecked(id: string) {
  return draft.value.includes(id)
}

function toggleRow(id: string) {
  if (draft.value.includes(id)) {
    draft.value = draft.value.filter((x) => x !== id)
  } else {
    draft.value = [...draft.value, id]
  }
}
</script>

<template>
  <view class="form-group staff-multi-field">
    <text v-if="label" class="label">{{ label }}</text>
    <view
      class="sop-trigger"
      :class="{ 'sop-trigger--placeholder': showPlaceholder }"
      @click="openSheet"
    >
      <text class="sop-trigger__text">{{ displayText }}</text>
      <text class="sop-trigger__chev">›</text>
    </view>
    <text v-if="hint" class="hint staff-multi-field__hint">{{ hint }}</text>

    <view v-if="visible" class="modal-overlay show" @click.self="closeSheet">
      <view class="sop-sheet staff-multi-sheet" @click.stop>
        <view class="sop-sheet__head">
          <text class="sop-sheet__title">{{ sheetTitle }}</text>
          <view class="sop-sheet__actions">
            <text class="sop-sheet__link" @click="closeSheet">取消</text>
            <text class="sop-sheet__link sop-sheet__link--ok" @click="confirmSheet">确定</text>
          </view>
        </view>

        <view class="sop-sheet__search-wrap">
          <view class="sop-sheet__search">
            <text class="sop-sheet__search-icon">⌕</text>
            <input
              v-model="keyword"
              class="sop-sheet__search-input"
              type="text"
              :placeholder="searchPlaceholder"
              confirm-type="search"
              :focus="visible"
              @confirm="onSearchConfirm"
            />
            <text v-if="keyword" class="sop-sheet__search-clear" @click="clearKeyword">清除</text>
          </view>
        </view>

        <scroll-view scroll-y class="sop-sheet__list staff-multi-sheet__list" :show-scrollbar="false">
          <view v-if="loading && !listForSheet.length" class="sop-sheet__status">
            <text class="hint">搜索中…</text>
          </view>
          <view v-else-if="!listForSheet.length" class="sop-sheet__status">
            <text class="hint">暂无匹配员工</text>
          </view>
          <view
            v-for="s in listForSheet"
            :key="s.id"
            class="sop-row sop-row--check"
            :class="{ 'sop-row--on': isChecked(s.id) }"
            @click="toggleRow(s.id)"
          >
            <view class="sop-row__check-box" :class="{ 'sop-row__check-box--on': isChecked(s.id) }">
              <text v-if="isChecked(s.id)" class="sop-row__check-mark">✓</text>
            </view>
            <text class="sop-row__title sop-row__title--solo">{{ s.name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
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

.sop-sheet {
  width: 100%;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.sop-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 12rpx;
}

.sop-sheet__title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink, #0f172a);
}

.sop-sheet__search-wrap {
  padding: 0 28rpx 20rpx;
}

.sop-sheet__search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 20rpx;
  min-height: 80rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
}

.sop-sheet__search-icon {
  font-size: 32rpx;
  color: #64748b;
}

.sop-sheet__search-input {
  flex: 1;
  font-size: 28rpx;
  min-height: 72rpx;
}

.sop-sheet__search-clear {
  font-size: 24rpx;
  color: var(--brand, #1a3a6c);
  padding: 8rpx;
}

.sop-sheet__status {
  padding: 40rpx;
  text-align: center;
}

.sop-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 0 20rpx 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}

.sop-row--on {
  background: rgba(26, 58, 108, 0.08);
  border-color: rgba(26, 58, 108, 0.2);
}

.sop-row__title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
}

.staff-multi-field__hint {
  display: block;
  margin-top: 8rpx;
}

.staff-multi-sheet .sop-sheet__head {
  padding-bottom: 12rpx;
}

.sop-sheet__actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.sop-sheet__link {
  font-size: 28rpx;
  color: var(--muted, #64748b);
  padding: 8rpx 4rpx;
}

.sop-sheet__link--ok {
  color: var(--brand, #1a3a6c);
  font-weight: 600;
}

.staff-multi-sheet__list {
  max-height: 58vh;
}

.sop-row--check {
  align-items: center;
}

.sop-row__check-box {
  width: 40rpx;
  height: 40rpx;
  border-radius: 12rpx;
  border: 3rpx solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.sop-row__check-box--on {
  border-color: var(--brand, #1a3a6c);
  background: var(--brand, #1a3a6c);
}

.sop-row__check-mark {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.sop-row__title--solo {
  flex: 1;
}
</style>
