<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import SearchableOptionPicker from '@/components/SearchableOptionPicker.vue'
import PropertyMultiPickField, { type PropertyPickOption } from '@/components/PropertyMultiPickField.vue'
import StaffMultiPickField from '@/components/StaffMultiPickField.vue'
import { joinYmdHm, splitYmdHm } from '@/utils/nativeDateTimePick'
import { fetchCustomerDetail, searchCustomerPicker } from '@/api/customer'
import {
  fetchPropertyDetail,
  fetchPropertyEditForm,
  parsePropertyRouteKey,
  propertyNavKey,
  searchPropertyPicker,
} from '@/api/property'
import {
  propertyDisplayName,
  propertyPickerNavKey,
} from '@/utils/propertyNav'
import { fetchStaffPeers, searchStaffPeers, type StaffPeerOption } from '@/api/staff'
import { postAction } from '@/api/message'
import { fetchViewingDetail, updateViewing } from '@/api/extra'
import { markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import { markViewingDetailStale } from '@/utils/viewingNav'
import { prepareWorkTaskSubscribe } from '@/utils/wechatSubscribe'
import type { CustomerListItem } from '@/types/customer'
import type { PropertyListItem } from '@/types/property'
import { defaultViewingSlotBeijing } from '@/utils/beijingTime'
import { assertEndAfterStart } from '@/utils/datetimeRange'

const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')
const propertyIds = ref<string[]>([])
const propertyId = ref('')
const propLocked = ref(false)
const propertyInitialOptions = ref<PropertyPickOption[]>([])
const propertyMultiFieldRef = ref<InstanceType<typeof PropertyMultiPickField> | null>(null)
const customerSlug = ref('')
const customerSelectedLabel = ref('')
const grade = ref('B')
const viewingId = ref<number | null>(null)
const pageTitle = ref('新建带看')

const staffOptions = ref<StaffPeerOption[]>([])
const selectedStaffIds = ref<string[]>([])
const optionsLoading = ref(true)
const optionsError = ref('')
function customerPickLabel(c: CustomerListItem) {
  const name = String(c.contactName || '').trim() || '—'
  const company = String(c.company || '').trim() || '—'
  return `${name} · ${company}`
}

function customerSubline(c: CustomerListItem) {
  const parts = [c.grade, c.district, c.ownerName].filter(Boolean)
  return parts.join(' · ') || c.id
}

function propertySubline(p: PropertyListItem) {
  return [p.metaLine, p.status].filter(Boolean).join(' · ')
}

function customerRowKey(c: CustomerListItem) {
  return c.id
}

function applyStartEndStrings(startStr: string, endStr: string) {
  const s = splitYmdHm(startStr, '14:00')
  const e = splitYmdHm(endStr, '15:30')
  startDate.value = s.date
  startTime.value = s.time
  endDate.value = e.date
  endTime.value = e.time
}

function defaultSlot() {
  try {
    const { start: s, end: e } = defaultViewingSlotBeijing()
    applyStartEndStrings(s, e)
  } catch {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate() + 1).padStart(2, '0')
    startDate.value = `${y}-${m}-${d}`
    startTime.value = '14:00'
    endDate.value = startDate.value
    endTime.value = '15:30'
  }
}

function startPayload() {
  return joinYmdHm(startDate.value, startTime.value)
}

function endPayload() {
  return joinYmdHm(endDate.value, endTime.value)
}

function onStartDateChange(ev: { detail: { value: string } }) {
  startDate.value = ev.detail.value
}

function onStartTimeChange(ev: { detail: { value: string } }) {
  startTime.value = ev.detail.value
}

function onEndDateChange(ev: { detail: { value: string } }) {
  endDate.value = ev.detail.value
}

function onEndTimeChange(ev: { detail: { value: string } }) {
  endTime.value = ev.detail.value
}

function initStaffSelection(list: StaffPeerOption[], selfId: string) {
  staffOptions.value = list
  selectedStaffIds.value = selfId && list.some((s) => s.id === selfId) ? [selfId] : list[0] ? [list[0].id] : []
}

function applyPropertyPick(navKey: string, label: string) {
  const key = String(navKey || '').trim()
  const name = String(label || '').trim()
  if (!key) return
  propertyId.value = key
  propertyIds.value = [key]
  propertyInitialOptions.value = [{ key, label: name || '—' }]
  propertyMultiFieldRef.value?.setPickedOptions(propertyInitialOptions.value)
}

async function resolvePropertyLabel(key: string) {
  const k = String(key || '').trim()
  if (!k) return
  try {
    const detail = await fetchPropertyDetail(k)
    const form = await fetchPropertyEditForm(k).catch(() => null)
    const code = String(form?.code || detail.id || k).trim()
    const navKey = propertyPickerNavKey({ id: detail.id, code: form?.code ?? detail.id })
    const label = propertyDisplayName({
      title: detail.detailTitle,
      listTitle: form?.listTitle,
      code,
      fallbackKey: k,
    })
    applyPropertyPick(navKey || code || k, label)
  } catch {
    try {
      const r = await searchPropertyPicker(k, 1)
      const hit = r.list.find((p) => propertyNavKey(p) === k || p.code === k || p.id === k)
      if (hit) {
        const navKey = propertyPickerNavKey({ id: hit.id, code: hit.code })
        const label = propertyDisplayName({ title: hit.title, code: hit.code, fallbackKey: k })
        applyPropertyPick(navKey, label)
      } else {
        applyPropertyPick(k, propertyDisplayName({ fallbackKey: k }))
      }
    } catch {
      applyPropertyPick(k, propertyDisplayName({ fallbackKey: k }))
    }
  }
}

async function resolveCustomerLabel(slug: string) {
  const id = String(slug || '').trim()
  if (!id) return
  try {
    const d = await fetchCustomerDetail(id)
    customerSelectedLabel.value = `${String(d.contactName || '—').trim()} · ${String(d.company || '—').trim()}`
  } catch {
    customerSelectedLabel.value = id
  }
}

onLoad((q) => {
  const editId = q?.id != null ? Number(q.id) : NaN
  if (Number.isFinite(editId)) viewingId.value = editId

  if (!viewingId.value) {
    defaultSlot()
    const routeKey = parsePropertyRouteKey(q)
    const presetTitle = q?.propertyTitle != null ? decodeURIComponent(String(q.propertyTitle)) : ''
    if (routeKey) {
      const navKey = routeKey
      propertyIds.value = [navKey]
      propertyId.value = navKey
      propLocked.value = true
      if (presetTitle) {
        propertyInitialOptions.value = [{ key: navKey, label: presetTitle }]
      }
    }
    if (q?.customerId) customerSlug.value = String(q.customerId)
    optionsLoading.value = false
  }

  void bootstrapPage(q)
})

async function bootstrapPage(q: Record<string, string | undefined> | undefined) {
  if (viewingId.value) optionsLoading.value = true
  optionsError.value = ''
  try {
    const staff = await fetchStaffPeers()
    initStaffSelection(staff.list ?? [], staff.selfId)

    if (viewingId.value) {
      pageTitle.value = '编辑带看'
      const v = await fetchViewingDetail(viewingId.value)
      applyStartEndStrings(v.start, v.end)
      grade.value = v.score || 'B'
      customerSlug.value = v.customerSlug || ''
      const pkey = String(v.propertyId || v.propertyRef || v.miniPropCode || '').trim()
      propertyId.value = pkey
      if (pkey) propertyIds.value = [pkey]
      selectedStaffIds.value =
        v.companionStaffIds?.length ? [...v.companionStaffIds] : staff.selfId ? [staff.selfId] : []
      void Promise.all([
        pkey ? resolvePropertyLabel(pkey) : Promise.resolve(),
        customerSlug.value ? resolveCustomerLabel(customerSlug.value) : Promise.resolve(),
      ])
    } else {
      const routeKey = parsePropertyRouteKey(q)
      if (routeKey) void resolvePropertyLabel(routeKey)
      if (customerSlug.value) void resolveCustomerLabel(customerSlug.value)
    }
  } catch (e) {
    optionsError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: optionsError.value, icon: 'none' })
    if (viewingId.value) setTimeout(() => uni.navigateBack(), 400)
  } finally {
    optionsLoading.value = false
  }
}

async function submit() {
  if (!customerSlug.value) {
    uni.showToast({ title: '请选择客户', icon: 'none' })
    return
  }
  if (!viewingId.value && !propertyIds.value.length) {
    uni.showToast({ title: '请选择房源', icon: 'none' })
    return
  }
  if (!selectedStaffIds.value.length) {
    uni.showToast({ title: '请选择陪同员工', icon: 'none' })
    return
  }
  const rangeErr = assertEndAfterStart(startPayload(), endPayload())
  if (rangeErr) {
    uni.showToast({ title: rangeErr, icon: 'none' })
    return
  }
  try {
    await prepareWorkTaskSubscribe()
    markListStale('viewing-list')
    markWorkbenchStale()
    const timeFields = {
      start: startPayload(),
      end: endPayload(),
      customerSlug: customerSlug.value,
      customerId: customerSlug.value,
      companionStaffIds: selectedStaffIds.value,
      grade: grade.value,
    }
    if (viewingId.value) {
      const propKey = String(propertyIds.value[0] || propertyId.value || '').trim()
      await updateViewing({
        ...timeFields,
        id: viewingId.value,
        propertyId: propKey || undefined,
        propertyRef: propKey || undefined,
        prop: propKey || undefined,
      })
      markViewingDetailStale(viewingId.value)
      uni.showToast({ title: '已保存', icon: 'none' })
    } else {
      const r = await postAction<{ ok: boolean; count?: number }>('viewing-create', {
        ...timeFields,
        propertyIds: propertyIds.value,
      })
      const n = r.count && r.count > 1 ? r.count : propertyIds.value.length
      uni.showToast({ title: n > 1 ? `已登记 ${n} 条带看` : '带看已登记', icon: 'none' })
    }
    uni.navigateBack()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '提交失败', icon: 'none' })
  }
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar :title="pageTitle" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view v-if="optionsLoading && viewingId" class="card">
            <text class="hint">加载中…</text>
          </view>
          <view v-else class="card customer-form">
            <PropertyMultiPickField
              ref="propertyMultiFieldRef"
              v-model="propertyIds"
              :initial-options="propertyInitialOptions"
              :disabled="propLocked"
              label="房源"
              :hint="
                propLocked
                  ? undefined
                  : viewingId
                    ? '可更换关联房源（单条带看对应一套）'
                    : '同一时段带看多套房源将分别登记；可搜索编号 / 标题 / 区位'
              "
            />
            <SearchableOptionPicker
              v-model="customerSlug"
              v-model:selected-label="customerSelectedLabel"
              label="客户"
              :search="searchCustomerPicker"
              :get-key="customerRowKey"
              :get-label="customerPickLabel"
              :get-subline="customerSubline"
              placeholder="请选择客户"
              sheet-title="选择客户"
              search-placeholder="搜索姓名 / 公司 / 手机…"
            />
            <view v-if="optionsError" class="hint viewing-options-hint">{{ optionsError }}</view>
            <view class="form-group">
              <text class="label">开始日期</text>
              <picker mode="date" :value="startDate" @change="onStartDateChange">
                <view class="picker-like">{{ startDate }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">开始时刻</text>
              <picker mode="time" :value="startTime" @change="onStartTimeChange">
                <view class="picker-like">{{ startTime }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">结束日期</text>
              <picker mode="date" :value="endDate" @change="onEndDateChange">
                <view class="picker-like">{{ endDate }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">结束时刻</text>
              <picker mode="time" :value="endTime" @change="onEndTimeChange">
                <view class="picker-like">{{ endTime }}</view>
              </picker>
            </view>
            <StaffMultiPickField
              v-model="selectedStaffIds"
              :options="staffOptions"
              :search-fn="searchStaffPeers"
              label="陪同员工"
              hint="可搜索姓名；勾选后点确定，默认含本人"
            />
            <view class="form-group">
              <text class="label">意向等级</text>
              <view class="chip-row">
                <text v-for="g in ['A', 'B', 'C']" :key="g" class="chip" :class="{ on: grade === g }" @click="grade = g">{{ g }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="page-footer">
        <button class="btn-primary" style="width: 100%" @click="submit">{{ viewingId ? '保存修改' : '提交带看' }}</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.viewing-options-hint {
  display: block;
  margin: 0 0 20rpx;
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: #b45309;
  background: #fffbeb;
  border-radius: 12rpx;
}
</style>
