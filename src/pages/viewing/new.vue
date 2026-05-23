<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import StaffMultiPickField from '@/components/StaffMultiPickField.vue'
import { joinYmdHm, splitYmdHm } from '@/utils/nativeDateTimePick'
import { fetchCustomerList } from '@/api/customer'
import { fetchPropertyList, parsePropertyRouteKey, propertyNavKey } from '@/api/property'
import { fetchStaffPeers, type StaffPeerOption } from '@/api/staff'
import { postAction } from '@/api/message'
import { fetchViewingDetail, updateViewing } from '@/api/extra'
import { markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { CustomerListItem } from '@/types/customer'
import type { PropertyListItem } from '@/types/property'
import { defaultViewingSlotBeijing, formatBeijingDisplay } from '@/utils/beijingTime'

const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')
const propertyId = ref('')
const propLocked = ref(false)
const propertyTitle = ref('')
const customerSlug = ref('')
const grade = ref('B')
const viewingId = ref<number | null>(null)
const pageTitle = ref('新建带看')

const customers = ref<CustomerListItem[]>([])
const properties = ref<PropertyListItem[]>([])
const customerIdx = ref(0)
const propertyIdx = ref(0)

const staffOptions = ref<StaffPeerOption[]>([])
const selectedStaffIds = ref<string[]>([])

function customerPickLabel(c: CustomerListItem) {
  const name = String(c.contactName || '').trim() || '—'
  const company = String(c.company || '').trim() || '—'
  return `${name} · ${company}`
}

const customerPickerLabels = computed(() => customers.value.map(customerPickLabel))

const customerLabel = computed(() => {
  const c = customers.value[customerIdx.value]
  return c ? customerPickLabel(c) : '请选择客户'
})

const propertyLabel = computed(() => {
  if (propLocked.value && propertyTitle.value) return propertyTitle.value
  const p = properties.value[propertyIdx.value]
  return p ? `${p.code || p.id} · ${p.title}` : '请选择房源'
})

function applyStartEndStrings(startStr: string, endStr: string) {
  const s = splitYmdHm(startStr, '14:00')
  const e = splitYmdHm(endStr, '15:30')
  startDate.value = s.date
  startTime.value = s.time
  endDate.value = e.date
  endTime.value = e.time
}

function defaultSlot() {
  const { start: s, end: e } = defaultViewingSlotBeijing()
  applyStartEndStrings(s, e)
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

function syncPickersFromCode() {
  if (propertyId.value) {
    const p = properties.value.find((x) => x.id === propertyId.value || x.code === propertyId.value)
    if (p) {
      propertyId.value = propertyNavKey(p)
      propertyTitle.value = `${p.code || p.id} · ${p.title}`
      const i = properties.value.findIndex((x) => x.id === p.id)
      if (i >= 0) propertyIdx.value = i
    }
  }
  if (customerSlug.value) {
    const i = customers.value.findIndex((c) => c.id === customerSlug.value)
    if (i >= 0) customerIdx.value = i
  }
}

function initStaffSelection(list: StaffPeerOption[], selfId: string) {
  staffOptions.value = list
  selectedStaffIds.value = selfId && list.some((s) => s.id === selfId) ? [selfId] : list[0] ? [list[0].id] : []
}

onLoad(async (q) => {
  const editId = q?.id != null ? Number(q.id) : NaN
  if (Number.isFinite(editId)) viewingId.value = editId

  if (!viewingId.value) {
    defaultSlot()
    const routeKey = parsePropertyRouteKey(q)
    if (routeKey) {
      propertyId.value = routeKey
      propLocked.value = true
    }
    if (q?.customerId) customerSlug.value = String(q.customerId)
  }

  try {
    const [cr, pr, staff] = await Promise.all([
      fetchCustomerList(),
      fetchPropertyList(),
      fetchStaffPeers(),
    ])
    customers.value = cr.list
    properties.value = pr.list
    initStaffSelection(staff.list, staff.selfId)

    if (viewingId.value) {
      pageTitle.value = '编辑带看'
      const v = await fetchViewingDetail(viewingId.value)
      applyStartEndStrings(v.start, v.end)
      grade.value = v.score || 'B'
      customerSlug.value = v.customerSlug || ''
      propertyId.value = v.propertyId || v.propertyRef || v.miniPropCode || ''
      propLocked.value = true
      propertyTitle.value = propLabelFromViewing(v)
      selectedStaffIds.value =
        v.companionStaffIds?.length ? [...v.companionStaffIds] : staff.selfId ? [staff.selfId] : []
      syncPickersFromCode()
    } else {
      syncPickersFromCode()
    }
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载选项失败', icon: 'none' })
    if (viewingId.value) setTimeout(() => uni.navigateBack(), 400)
  }
})

function propLabelFromViewing(v: { propertyRef?: string | null; miniPropCode?: string | null; propertyId?: string | null }) {
  const code = String(v.propertyRef || v.miniPropCode || v.propertyId || '').trim()
  const p = properties.value.find((x) => x.id === code || x.code === code)
  return p ? `${p.code || p.id} · ${p.title}` : code || '—'
}

function onCustomerPick(e: { detail: { value: string } }) {
  customerIdx.value = Number(e.detail.value)
  customerSlug.value = customers.value[customerIdx.value]?.id || ''
}

function onPropertyPick(e: { detail: { value: string } }) {
  propertyIdx.value = Number(e.detail.value)
  const p = properties.value[propertyIdx.value]
  propertyId.value = p ? propertyNavKey(p) : ''
  propertyTitle.value = p ? `${p.code || p.id} · ${p.title}` : ''
}

async function submit() {
  if (!propertyId.value || !customerSlug.value) {
    uni.showToast({ title: '请选择房源与客户', icon: 'none' })
    return
  }
  if (!selectedStaffIds.value.length) {
    uni.showToast({ title: '请选择陪同员工', icon: 'none' })
    return
  }
  try {
    markListStale('viewing-list')
    markWorkbenchStale()
    const payload = {
      start: startPayload(),
      end: endPayload(),
      propertyId: propertyId.value,
      propertyRef: properties.value.find((p) => p.id === propertyId.value)?.code,
      prop: properties.value.find((p) => p.id === propertyId.value)?.code,
      customerSlug: customerSlug.value,
      customerId: customerSlug.value,
      companionStaffIds: selectedStaffIds.value,
      grade: grade.value,
    }
    if (viewingId.value) {
      await updateViewing({ ...payload, id: viewingId.value })
      uni.showToast({ title: '已保存', icon: 'none' })
    } else {
      await postAction('viewing-create', payload)
      uni.showToast({ title: '带看已登记', icon: 'none' })
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
          <view class="card customer-form">
            <view class="form-group">
              <text class="label">房源</text>
              <view v-if="propLocked" class="form-field-readonly">{{ propertyLabel }}</view>
              <picker
                v-else
                mode="selector"
                :range="properties"
                range-key="title"
                :value="propertyIdx"
                @change="onPropertyPick"
              >
                <view class="picker-like">{{ propertyLabel }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">客户</text>
              <picker
                mode="selector"
                :range="customerPickerLabels"
                :value="customerIdx"
                @change="onCustomerPick"
              >
                <view class="picker-like">{{ customerLabel }}</view>
              </picker>
            </view>
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
              label="陪同员工"
              hint="点击展开列表，勾选多名员工后点确定；默认含本人"
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
