<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import DateTimeField from '@/components/DateTimeField.vue'
import { fetchCustomerList } from '@/api/customer'
import { fetchPropertyList, parsePropertyRouteKey, propertyNavKey } from '@/api/property'
import { fetchStaffPeers, type StaffPeerOption } from '@/api/staff'
import { postAction } from '@/api/message'
import { markListStale } from '@/utils/listStale'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { CustomerListItem } from '@/types/customer'
import type { PropertyListItem } from '@/types/property'

const start = ref('')
const end = ref('')
const propertyId = ref('')
const propLocked = ref(false)
const propertyTitle = ref('')
const customerSlug = ref('')
const grade = ref('B')

const customers = ref<CustomerListItem[]>([])
const properties = ref<PropertyListItem[]>([])
const customerIdx = ref(0)
const propertyIdx = ref(0)

const staffOptions = ref<StaffPeerOption[]>([])
const selectedStaffIds = ref<string[]>([])

const customerLabel = computed(() => {
  const c = customers.value[customerIdx.value]
  return c ? `${c.titleLine} · ${c.company}` : '请选择客户'
})

const propertyLabel = computed(() => {
  if (propLocked.value && propertyTitle.value) return propertyTitle.value
  const p = properties.value[propertyIdx.value]
  return p ? `${p.code || p.id} · ${p.title}` : '请选择房源'
})

const companionsDisplay = computed(() => {
  const names = selectedStaffIds.value
    .map((id) => staffOptions.value.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[]
  return names.length ? names.join('、') : '请选择陪同员工'
})

function defaultSlot() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(14, 0, 0, 0)
  const endD = new Date(d.getTime() + 90 * 60 * 1000)
  const fmt = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
  start.value = fmt(d)
  end.value = fmt(endD)
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

function toggleStaff(id: string) {
  const i = selectedStaffIds.value.indexOf(id)
  if (i >= 0) {
    if (selectedStaffIds.value.length <= 1) return
    selectedStaffIds.value = selectedStaffIds.value.filter((x) => x !== id)
  } else {
    selectedStaffIds.value = [...selectedStaffIds.value, id]
  }
}

onLoad(async (q) => {
  defaultSlot()
  const routeKey = parsePropertyRouteKey(q)
  if (routeKey) {
    propertyId.value = routeKey
    propLocked.value = true
  }
  if (q?.customerId) customerSlug.value = String(q.customerId)
  try {
    const [cr, pr, staff] = await Promise.all([
      fetchCustomerList(),
      fetchPropertyList(),
      fetchStaffPeers(),
    ])
    customers.value = cr.list
    properties.value = pr.list
    initStaffSelection(staff.list, staff.selfId)
    syncPickersFromCode()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载选项失败', icon: 'none' })
  }
})

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
    await postAction('viewing-create', {
      start: start.value,
      end: end.value,
      propertyId: propertyId.value,
      propertyRef: properties.value.find((p) => p.id === propertyId.value)?.code,
      prop: properties.value.find((p) => p.id === propertyId.value)?.code,
      customerSlug: customerSlug.value,
      customerId: customerSlug.value,
      companionStaffIds: selectedStaffIds.value,
      grade: grade.value,
    })
    uni.showToast({ title: '带看已登记', icon: 'none' })
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
      <NavIconBar title="新建带看" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="card">
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
                <view class="picker-value">{{ propertyLabel }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">客户</text>
              <picker
                mode="selector"
                :range="customers"
                range-key="titleLine"
                :value="customerIdx"
                @change="onCustomerPick"
              >
                <view class="picker-value">{{ customerLabel }}</view>
              </picker>
            </view>
            <DateTimeField v-model="start" label="开始时间" placeholder="选择带看开始时间" />
            <DateTimeField v-model="end" label="结束时间" placeholder="选择带看结束时间" />
            <view class="form-group">
              <text class="label">陪同员工</text>
              <view class="chip-row" style="flex-wrap: wrap">
                <text
                  v-for="s in staffOptions"
                  :key="s.id"
                  class="chip"
                  :class="{ on: selectedStaffIds.includes(s.id) }"
                  @click="toggleStaff(s.id)"
                >
                  {{ s.name }}
                </text>
              </view>
              <text class="hint" style="display: block; margin-top: 8rpx">{{ companionsDisplay }} · 默认含本人，可多选</text>
            </view>
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
        <button class="btn-primary" style="width: 100%" @click="submit">提交带看</button>
      </view>
    </view>
  </view>
</template>
