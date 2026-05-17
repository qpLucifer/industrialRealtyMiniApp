<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchWorkbench } from '@/api/home'
import { fetchAnnouncementList, markAnnouncementReadApi } from '@/api/message'
import type { AnnouncementItem } from '@/types/message'
import type { WorkbenchStat, WorkbenchSummary, WorkbenchTodo } from '@/types/workbench'
import {
  pickActivePopupAnnouncements,
} from '@/utils/announcement'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v).trim() || fallback
}

function normalizeTodo(raw: unknown): WorkbenchTodo | null {
  const o = asRecord(raw)
  if (!o) return null
  const id = str(o.id)
  if (!id) return null
  const tone = o.tone === 'mint' || o.tone === 'slate' ? o.tone : 'slate'
  return {
    id,
    title: str(o.title, '待跟进'),
    hint: str(o.hint, '—'),
    tone,
  }
}

function normalizeStat(raw: unknown): WorkbenchStat | null {
  const o = asRecord(raw)
  if (!o) return null
  const label = str(o.label)
  if (!label) return null
  return { value: str(o.value, '0'), label }
}

/** Coerce API / partial JSON into a safe WorkbenchSummary for the home UI. */
function normalizeWorkbenchSummary(raw: unknown): WorkbenchSummary {
  const o = asRecord(raw) ?? {}
  const todosIn = Array.isArray(o.todos) ? o.todos : []
  const todos: WorkbenchTodo[] = todosIn.map(normalizeTodo).filter(Boolean) as WorkbenchTodo[]

  const statsIn = Array.isArray(o.stats) ? o.stats : []
  const statsParsed = statsIn.map(normalizeStat).filter(Boolean) as WorkbenchStat[]
  const defaultStats: WorkbenchStat[] = [
    { value: '0', label: '可租房源' },
    { value: '0', label: '意向客户' },
    { value: '0', label: '本周带看' },
  ]
  const stats =
    statsParsed.length >= 3
      ? statsParsed.slice(0, 3)
      : defaultStats.map((d, i) => statsParsed[i] ?? d)

  return {
    regionLine: str(o.regionLine, '工作台'),
    followCount: num(o.followCount, 0),
    pendingAudit: num(o.pendingAudit, 0),
    remindHtml: str(o.remindHtml, ''),
    todos,
    stats,
  }
}

const topBarInsetStyle = useTopBarInsetStyle()

const data = ref<WorkbenchSummary | null>(null)
const loadError = ref('')
const announceCount = ref(0)
const lastAnnounceList = ref<AnnouncementItem[]>([])
const popupVisible = ref(false)
const popupItem = ref<AnnouncementItem | null>(null)
const popupQueue = ref<AnnouncementItem[]>([])

onMounted(async () => {
  try {
    const raw = await fetchWorkbench()
    data.value = normalizeWorkbenchSummary(raw)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: '工作台数据加载失败', icon: 'none' })
  }
  await refreshAnnouncements()
})

onShow(() => {
  void refreshAnnouncements()
})

/** Match prototype: amber lead "系统提醒" + body */
const remindParts = computed(() => {
  const raw = data.value?.remindHtml || ''
  const m = raw.match(/^系统提醒\s*·\s*(.*)$/)
  if (m) return { lead: '系统提醒', body: m[1] || '' }
  return { lead: '', body: raw }
})

const announceBadgeText = computed(() => {
  const n = announceCount.value
  if (n <= 0) return ''
  return n > 99 ? '99+' : String(n)
})

async function refreshAnnouncements() {
  try {
    const r = await fetchAnnouncementList()
    const list = Array.isArray(r.list) ? r.list : []
    lastAnnounceList.value = list
    announceCount.value = typeof r.unreadCount === 'number' ? r.unreadCount : list.filter((a) => !a.read).length
    const active = pickActivePopupAnnouncements(list)
    if (!active.length) {
      popupQueue.value = []
      if (!popupVisible.value) popupItem.value = null
      return
    }
    popupQueue.value = active
    if (!popupVisible.value) showNextPopup()
  } catch {
    /* keep badge / popup state on transient errors */
  }
}

function showNextPopup() {
  const next = popupQueue.value[0]
  if (!next) {
    popupVisible.value = false
    popupItem.value = null
    return
  }
  popupItem.value = next
  popupVisible.value = true
}

async function onPopupDismiss() {
  const cur = popupItem.value
  if (cur?.id) {
    try {
      await markAnnouncementReadApi(String(cur.id))
      const id = String(cur.id)
      lastAnnounceList.value = lastAnnounceList.value.map((a) => (a.id === id ? { ...a, read: true } : a))
      announceCount.value = Math.max(0, announceCount.value - 1)
    } catch {
      /* badge refreshes on next onShow */
    }
  }
  popupQueue.value = popupQueue.value.slice(1)
  popupVisible.value = false
  popupItem.value = null
  if (popupQueue.value.length) {
    setTimeout(() => showNextPopup(), 80)
  }
}

function goAnnounce() {
  uni.navigateTo({ url: '/pages/announcements/list' })
}

function goCustomer(id: string) {
  uni.navigateTo({ url: `/pages/customer/detail?id=${id}` })
}

function goPublish(clear?: boolean) {
  const q = clear ? '?clear=1' : ''
  uni.navigateTo({ url: `/pages/property/publish${q}` })
}

function goCustomerNew() {
  uni.navigateTo({ url: '/pages/customer/new' })
}

function todoCardStyle(i: number) {
  return i === 0 ? 'margin-top:12px' : 'margin-top:8px'
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--tab">
      <view class="top-bar" :style="topBarInsetStyle">
        <view class="top-bar__home-row">
          <view class="top-bar__titles">
            <view class="h1-title">工作台</view>
            <view class="sub">{{ data?.regionLine }}</view>
          </view>
          <view class="top-bar__home-icon" @click="goAnnounce">
            <view class="ic-announce" />
            <view v-if="announceBadgeText" class="announce-badge">{{ announceBadgeText }}</view>
          </view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
        <view v-if="loadError" class="card" style="margin-bottom: 12px">
          <view style="font-weight: 700; margin-bottom: 8px">数据加载失败</view>
          <view class="hint">{{ loadError }}</view>
          <view class="hint" style="margin-top: 8px">请检查网络、登录状态与 VITE_API_BASE；或查看开发者工具控制台。</view>
        </view>
        <view v-if="data" class="card card-glow">
          <view style="display: flex; justify-content: space-between; align-items: flex-start">
            <view>
              <view style="font-size: 11px; color: var(--cyan); letter-spacing: 0.12em">TODAY</view>
              <view style="font-size: 24px; font-weight: 700; margin-top: 6px; font-family: var(--display)">
                待跟进 <text style="color: var(--mint)">{{ data.followCount }}</text>
              </view>
            </view>
            <view class="chip warn">待审核 {{ data.pendingAudit }}</view>
          </view>
          <view class="remind-strip-home">
            <template v-if="remindParts.lead">
              <text class="remind-k">{{ remindParts.lead }}</text>
              <text> · {{ remindParts.body }}</text>
            </template>
            <text v-else>{{ remindParts.body }}</text>
          </view>
          <view v-if="data.todos.length === 0" class="hint" style="margin-top: 12px">
            暂无待跟进客户（数据库中无带下次提醒的客户，或客户未在小程序列表展示）
          </view>
          <view
            v-for="(t, i) in data.todos"
            :key="t.id"
            class="card list-item"
            :style="todoCardStyle(i)"
            @click="goCustomer(t.id)"
          >
            <view
              :style="{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                flexShrink: 0,
                background: t.tone === 'mint' ? 'linear-gradient(135deg,#0d9488,#14b8a6)' : 'linear-gradient(135deg,#64748b,#94a3b8)',
              }"
            />
            <view style="flex: 1; min-width: 0">
              <view class="home-todo-title">{{ t.title }}</view>
              <view class="hint" style="margin: 4px 0 0">{{ t.hint }}</view>
            </view>
            <view style="color: var(--muted); flex-shrink: 0">›</view>
          </view>
          <view style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; text-align: center">
            <view v-for="s in data.stats" :key="s.label">
              <view style="font-size: 20px; font-weight: 700">{{ s.value }}</view>
              <view style="font-size: 11px; color: var(--muted)">{{ s.label }}</view>
            </view>
          </view>
        </view>
        <view style="display: flex; gap: 10px; margin-bottom: 12px">
          <button class="btn-primary" style="flex: 1; padding: 12px; font-size: 14px" @click="goPublish(true)">
            ＋ 发布房源
          </button>
          <button
            class="btn-secondary"
            style="flex: 1; padding: 12px; font-size: 14px; border-color: rgba(52, 211, 153, 0.35); color: var(--mint)"
            @click="goCustomerNew"
          >
            ＋ 新建客户
          </button>
        </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="popupVisible && popupItem" class="modal-overlay show" @click.self="onPopupDismiss">
      <view class="modal-sheet announce-popup-sheet" @click.stop>
        <view class="announce-popup-tag">公告通知</view>
        <view class="announce-popup-title">{{ popupItem.title }}</view>
        <scroll-view scroll-y class="announce-popup-body" :show-scrollbar="false">
          <text class="announce-popup-text">{{ popupItem.body }}</text>
        </scroll-view>
        <button class="btn-primary announce-popup-btn" @click="onPopupDismiss">知道了</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.h1-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.top-bar__home-icon {
  position: relative;
  flex-shrink: 0;
}

.ic-announce {
  width: 44rpx;
  height: 44rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'/%3E%3Cpath d='M10.3 21a1.94 1.94 0 0 0 3.4 0'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.announce-badge {
  position: absolute;
  top: -6rpx;
  right: -10rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  background: #f43f5e;
  color: #fff;
  font-size: 20rpx;
  line-height: 32rpx;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
}

.announce-popup-sheet {
  max-width: 640rpx;
  margin: 0 auto;
  padding: 32rpx 28rpx 28rpx;
}

.announce-popup-tag {
  font-size: 22rpx;
  color: var(--cyan);
  letter-spacing: 0.08em;
}

.announce-popup-title {
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  font-family: var(--display);
  line-height: 1.35;
}

.announce-popup-body {
  margin-top: 20rpx;
  max-height: 48vh;
}

.announce-popup-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
}

.announce-popup-btn {
  margin-top: 28rpx;
  width: 100%;
  padding: 24rpx;
  font-size: 30rpx;
}
</style>
