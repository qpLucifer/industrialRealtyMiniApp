<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import {
  destroyMultiPickerSession,
  getMultiPickerSession,
  type MultiPickerOption,
  type MultiPickerSession,
} from '@/utils/pickerSession'

const sessionId = ref('')
const session = ref<MultiPickerSession | null>(null)
const keyword = ref('')
const draft = ref<string[]>([])
const sheetOptions = ref<MultiPickerOption[]>([])
const loading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0
let openerChannel: UniApp.EventChannel | null = null

const title = computed(() => session.value?.title ?? '请选择')
const searchPlaceholder = computed(() => session.value?.searchPlaceholder ?? '搜索…')

const listForSheet = computed(() => {
  const cfg = session.value
  if (!cfg) return []
  if (cfg.searchFn) return sheetOptions.value
  const q = keyword.value.trim().toLowerCase()
  const opts = cfg.options ?? []
  if (!q) return opts
  return opts.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

watch(keyword, () => {
  if (!session.value?.searchFn) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void loadOptions()
  }, 320)
})

onLoad((query) => {
  const id = String(query?.id ?? '').trim()
  if (!id) {
    uni.showToast({ title: '选择器参数无效', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  sessionId.value = id
  const cfg = getMultiPickerSession(id)
  if (!cfg) {
    uni.showToast({ title: '选择器已过期，请重试', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  session.value = cfg
  draft.value = [...(cfg.initialIds ?? [])]
  const ec = getOpenerEventChannel()
  openerChannel = ec ?? null
  void loadOptions()
})

onUnload(() => {
  if (sessionId.value) destroyMultiPickerSession(sessionId.value)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

function getOpenerEventChannel(): UniApp.EventChannel | null {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { getOpenerEventChannel?: () => UniApp.EventChannel }
    return typeof cur?.getOpenerEventChannel === 'function' ? cur.getOpenerEventChannel() : null
  } catch {
    return null
  }
}

async function loadOptions() {
  const cfg = session.value
  if (!cfg) return
  if (!cfg.searchFn) {
    sheetOptions.value = [...(cfg.options ?? [])]
    return
  }
  const seq = ++searchSeq
  loading.value = true
  try {
    const list = await cfg.searchFn(keyword.value.trim())
    if (seq !== searchSeq) return
    sheetOptions.value = list
    for (const id of draft.value) {
      if (!list.some((s) => s.id === id)) {
        const fromOpts = (cfg.options ?? []).find((s) => s.id === id)
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

function onSearchConfirm() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  void loadOptions()
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

function cancel() {
  uni.navigateBack()
}

function resolveOption(id: string): MultiPickerOption {
  const cfg = session.value
  const fromList =
    listForSheet.value.find((s) => s.id === id) ??
    sheetOptions.value.find((s) => s.id === id) ??
    (cfg?.options ?? []).find((s) => s.id === id)
  return fromList ?? { id, name: id }
}

function confirm() {
  const cfg = session.value
  if (!cfg) return
  if (cfg.minCount > 0 && draft.value.length < cfg.minCount) {
    uni.showToast({
      title: cfg.minCount > 1 ? `至少选择 ${cfg.minCount} 人` : '请至少选择一人',
      icon: 'none',
    })
    return
  }
  const selections = draft.value.map((id) => resolveOption(id))
  openerChannel?.emit('picked', { ids: [...draft.value], selections })
  uni.navigateBack()
}
</script>

<template>
  <view class="picker-page app-shell">
    <view class="page-frame screen active screen--sub picker-page__frame">
      <NavIconBar :title="title" @back="cancel" />
      <view class="picker-page__body">
        <view class="picker-page__search">
          <text class="picker-page__search-icon">⌕</text>
          <input
            v-model="keyword"
            class="picker-page__search-input"
            type="text"
            :placeholder="searchPlaceholder"
            confirm-type="search"
            :focus="true"
            :adjust-position="true"
            :cursor-spacing="80"
            @confirm="onSearchConfirm"
          />
          <text v-if="keyword" class="picker-page__search-clear" @tap="keyword = ''">清除</text>
        </view>

        <scroll-view scroll-y class="picker-page__list" :show-scrollbar="true" :enhanced="true">
          <view class="picker-page__list-inner">
            <view v-if="loading && !listForSheet.length" class="picker-page__status">
              <text class="hint">搜索中…</text>
            </view>
            <view v-else-if="!listForSheet.length" class="picker-page__status">
              <text class="hint">暂无匹配</text>
            </view>
            <view
              v-for="s in listForSheet"
              :key="s.id"
              class="picker-row picker-row--check"
              :class="{ 'picker-row--on': isChecked(s.id) }"
              @tap="toggleRow(s.id)"
            >
              <view class="picker-row__check" :class="{ 'picker-row__check--on': isChecked(s.id) }">
                <text v-if="isChecked(s.id)" class="picker-row__check-mark">✓</text>
              </view>
              <text class="picker-row__title picker-row__title--solo">{{ s.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="page-footer">
        <view class="page-footer__row">
          <button class="btn-secondary" @click="cancel">取消</button>
          <button class="btn-primary" @click="confirm">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.picker-page__frame {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.picker-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.picker-page__search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
  min-height: 88rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
}

.picker-page__search-icon {
  font-size: 32rpx;
  color: #64748b;
}

.picker-page__search-input {
  flex: 1;
  font-size: 28rpx;
  min-height: 72rpx;
}

.picker-page__search-clear {
  font-size: 24rpx;
  color: var(--brand, #1a3a6c);
  padding: 8rpx;
}

.picker-page__list {
  flex: 1;
  height: 0;
  width: 100%;
}

.picker-page__list-inner {
  padding-bottom: 32rpx;
}

.picker-page__status {
  padding: 48rpx 24rpx;
  text-align: center;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}

.picker-row--on {
  background: rgba(26, 58, 108, 0.08);
  border-color: rgba(26, 58, 108, 0.2);
}

.picker-row__check {
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

.picker-row__check--on {
  border-color: var(--brand, #1a3a6c);
  background: var(--brand, #1a3a6c);
}

.picker-row__check-mark {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
}

.picker-row__title--solo {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink, #0f172a);
}
</style>
