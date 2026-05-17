<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchCustomerList } from '@/api/customer'
import { fetchPropertyList } from '@/api/property'
import { postAction } from '@/api/message'
import type { CustomerListItem } from '@/types/customer'
import type { PropertyListItem } from '@/types/property'

const topBarInsetStyle = useTopBarInsetStyle()
const start = ref('')
const end = ref('')
const propCode = ref('')
const customerSlug = ref('')
const companions = ref('')
const grade = ref('B')

const customers = ref<CustomerListItem[]>([])
const properties = ref<PropertyListItem[]>([])
const customerIdx = ref(0)
const propertyIdx = ref(0)

const customerLabel = computed(() => {
  const c = customers.value[customerIdx.value]
  return c ? `${c.titleLine} · ${c.company}` : '请选择客户'
})

const propertyLabel = computed(() => {
  const p = properties.value[propertyIdx.value]
  return p ? `${p.id} · ${p.title}` : '请选择房源'
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
  if (propCode.value) {
    const i = properties.value.findIndex((p) => p.id === propCode.value)
    if (i >= 0) propertyIdx.value = i
  }
  if (customerSlug.value) {
    const i = customers.value.findIndex((c) => c.id === customerSlug.value)
    if (i >= 0) customerIdx.value = i
  }
}

onLoad(async (q) => {
  defaultSlot()
  if (q?.propId) propCode.value = String(q.propId)
  if (q?.customerId) customerSlug.value = String(q.customerId)
  try {
    const [cr, pr] = await Promise.all([fetchCustomerList(), fetchPropertyList()])
    customers.value = cr.list
    properties.value = pr.list
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
  propCode.value = properties.value[propertyIdx.value]?.id || ''
}

async function submit() {
  if (!propCode.value || !customerSlug.value) {
    uni.showToast({ title: '请选择房源与客户', icon: 'none' })
    return
  }
  try {
    await postAction('viewing-create', {
      start: start.value,
      end: end.value,
      propertyRef: propCode.value,
      prop: propCode.value,
      customerSlug: customerSlug.value,
      customerId: customerSlug.value,
      companions: companions.value,
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
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">新建带看</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
        <view class="card">
          <view class="form-group">
            <text class="label">房源</text>
            <picker mode="selector" :range="properties" range-key="title" :value="propertyIdx" @change="onPropertyPick">
              <view class="picker-value">{{ propertyLabel }}</view>
            </picker>
          </view>
          <view class="form-group">
            <text class="label">客户</text>
            <picker mode="selector" :range="customers" range-key="titleLine" :value="customerIdx" @change="onCustomerPick">
              <view class="picker-value">{{ customerLabel }}</view>
            </picker>
          </view>
          <view class="form-group">
            <text class="label">开始时间</text>
            <input v-model="start" />
          </view>
          <view class="form-group">
            <text class="label">结束时间</text>
            <input v-model="end" />
          </view>
          <view class="form-group">
            <text class="label">陪同同事</text>
            <input v-model="companions" placeholder="可选" />
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

<style scoped>
.picker-value {
  padding: 20rpx 24rpx;
  background: #f1f5f9;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
}
</style>
