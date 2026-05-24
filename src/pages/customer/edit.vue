<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import StaffMultiPickField from '@/components/StaffMultiPickField.vue'
import { fetchCustomerDetail, updateCustomer } from '@/api/customer'
import { markCustomerDetailStale, markCustomerListStale } from '@/utils/customerNav'
import type { CustomerDealStatus, CustomerGrade, CustomerScope } from '@/types/customer'
import { fetchRegionDefs } from '@/utils/request'
import {
  customerRegionPickerIndex,
  customerRegionPickerLabels,
  useCustomerStaffPeers,
} from '@/utils/customerStaffPeers'
import { isPhone11Cn, type PickerChange } from '@/utils/propertyPublish'

const id = ref('')
const saving = ref(false)
const { staffOptions, selfId, selfName, reloadStaffPeers, staffSearchFn, prunePublicOwners } =
  useCustomerStaffPeers()
const publicOwnerStaffIds = ref<string[]>([])

const form = reactive({
  company: '',
  contactName: '',
  titleLine: '',
  phone: '',
  grade: 'B 类' as CustomerGrade,
  dealStatus: '洽谈中' as CustomerDealStatus,
  demandSummary: '',
  district: '',
  districtRegionId: undefined as number | undefined,
  addressHint: '',
  scope: '私有' as CustomerScope,
})

const regionDefs = ref<{ id: number; name: string }[]>([])
const regionNames = computed(() => regionDefs.value.map((r) => r.name))
const regionPickerLabels = computed(() => customerRegionPickerLabels(regionNames.value))

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']
const deals: CustomerDealStatus[] = ['洽谈中', '已成交', '搁置']
const scopes: CustomerScope[] = ['私有', '公有']

onLoad(async (q) => {
  if (q?.id) id.value = String(q.id)
  if (!id.value) return
  try {
    const [d, regions] = await Promise.all([
      fetchCustomerDetail(id.value),
      fetchRegionDefs().catch(() => ({ list: [] as { id: number; name: string }[] })),
    ])
    regionDefs.value = regions.list ?? []
    if (!d.canEdit) {
      uni.showToast({ title: '无权编辑', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }
    form.company = d.company
    form.contactName = d.contactName
    form.titleLine = d.titleLine
    form.phone = d.phone
    form.grade = (d.grade as CustomerGrade) || 'B 类'
    form.dealStatus = (d.dealStatus as CustomerDealStatus) || '洽谈中'
    form.demandSummary = d.demandSummary
    form.district = d.district || ''
    form.districtRegionId = d.districtRegionId ?? undefined
    if (form.districtRegionId && !regionDefs.value.some((r) => r.id === form.districtRegionId)) {
      regionDefs.value = [...regionDefs.value, { id: form.districtRegionId, name: form.district }]
    }
    form.addressHint = d.addressHint
    form.scope = d.scope
    publicOwnerStaffIds.value = d.scope === '公有' && d.ownerStaffIds?.length ? [...d.ownerStaffIds] : []
    await reloadStaffPeers(form.districtRegionId)
    if (form.scope === '公有' && publicOwnerStaffIds.value.length) {
      publicOwnerStaffIds.value = prunePublicOwners(publicOwnerStaffIds.value)
    }
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
  }
})

function onGradePick(e: { detail: { value: string | number } }) {
  form.grade = grades[Number(e.detail.value)] ?? 'B 类'
}

function onDealPick(e: { detail: { value: string | number } }) {
  form.dealStatus = deals[Number(e.detail.value)] ?? '洽谈中'
}

function onScopePick(e: { detail: { value: string | number } }) {
  form.scope = scopes[Number(e.detail.value)] ?? '私有'
  if (form.scope === '私有') publicOwnerStaffIds.value = []
}

async function pickDistrict(e: PickerChange) {
  const i = Number(e.detail.value)
  if (i === 0) {
    form.district = ''
    form.districtRegionId = undefined
    await reloadStaffPeers()
    publicOwnerStaffIds.value = prunePublicOwners(publicOwnerStaffIds.value)
    return
  }
  const row = regionDefs.value[i - 1]
  if (row) {
    form.district = row.name
    form.districtRegionId = row.id
    await reloadStaffPeers(row.id)
    publicOwnerStaffIds.value = prunePublicOwners(publicOwnerStaffIds.value)
  }
}

function ownerPayload(): { ownerStaffIds?: string[] } {
  if (form.scope === '私有') {
    return selfId.value ? { ownerStaffIds: [selfId.value] } : {}
  }
  return { ownerStaffIds: [...publicOwnerStaffIds.value] }
}

async function submit() {
  if (!form.company.trim() || !form.contactName.trim() || !form.phone.trim()) {
    uni.showToast({ title: '请填写公司、联系人与手机', icon: 'none' })
    return
  }
  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!isPhone11Cn(phoneDigits)) {
    uni.showToast({ title: '请输入 11 位大陆手机号（1 开头）', icon: 'none' })
    return
  }
  if (form.scope === '私有' && !selfId.value) {
    uni.showToast({ title: '无法识别当前员工，请重新登录', icon: 'none' })
    return
  }
  saving.value = true
  try {
    await updateCustomer(id.value, {
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      titleLine: form.titleLine.trim(),
      phone: phoneDigits,
      grade: form.grade,
      dealStatus: form.dealStatus,
      demandSummary: form.demandSummary.trim(),
      district: form.district.trim(),
      districtRegionId: form.districtRegionId,
      addressHint: form.addressHint.trim(),
      scope: form.scope,
      ...ownerPayload(),
    })
    markCustomerDetailStale(id.value)
    markCustomerListStale()
    uni.showToast({ title: '已保存', icon: 'none' })
    uni.navigateBack()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="编辑客户" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll customer-form-scroll">
        <view class="page-scroll__inner">
          <view class="card customer-form">
            <view class="form-group">
              <text class="label">公司 / 主体<text class="req">*</text></text>
              <input
                v-model="form.company"
                type="text"
                class="field-input"
                placeholder="营业执照名称"
                :cursor-spacing="120"
              />
            </view>
            <view class="form-group">
              <text class="label">主题（列表摘要）</text>
              <input
                v-model="form.titleLine"
                type="text"
                class="field-input"
                placeholder="例：张晨 · 某某公司"
                :cursor-spacing="120"
              />
            </view>
            <view class="form-group">
              <text class="label">联系人<text class="req">*</text></text>
              <input
                v-model="form.contactName"
                type="text"
                class="field-input"
                placeholder="姓名"
                :cursor-spacing="120"
              />
            </view>
            <view class="form-group">
              <text class="label">手机<text class="req">*</text></text>
              <input
                v-model="form.phone"
                type="number"
                maxlength="11"
                class="field-input"
                placeholder="11 位手机号"
                :cursor-spacing="120"
              />
            </view>
            <view class="form-group">
              <text class="label">等级</text>
              <picker :range="grades" :value="grades.indexOf(form.grade)" @change="onGradePick">
                <view class="picker-like">{{ form.grade }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">成交状态</text>
              <picker :range="deals" :value="deals.indexOf(form.dealStatus)" @change="onDealPick">
                <view class="picker-like">{{ form.dealStatus }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">客户池</text>
              <picker :range="scopes" :value="scopes.indexOf(form.scope)" @change="onScopePick">
                <view class="picker-like">{{ form.scope }}</view>
              </picker>
            </view>
            <view v-if="form.scope === '私有'" class="form-group">
              <text class="label">负责人</text>
              <view class="form-field-readonly">{{ selfName || '当前登录员工' }}</view>
              <text class="hint" style="display: block; margin-top: 8rpx">私有客户负责人为本人</text>
            </view>
            <StaffMultiPickField
              v-else
              v-model="publicOwnerStaffIds"
              :options="staffOptions"
              :search-fn="staffSearchFn(form.districtRegionId)"
              label="负责人（可选）"
              placeholder="不指定"
              sheet-title="选择负责人"
              search-placeholder="搜索员工姓名…"
              hint="已选区域时仅显示该区域员工；可搜索姓名"
              :min-count="0"
            />
            <picker
              v-if="regionNames.length"
              mode="selector"
              :range="regionPickerLabels"
              :value="
                customerRegionPickerIndex(
                  regionPickerLabels,
                  form.district,
                  form.districtRegionId != null,
                )
              "
              @change="pickDistrict"
            >
              <view class="form-group">
                <text class="label">所属区域</text>
                <view class="picker-like">{{ form.district || '不指定' }}</view>
              </view>
            </picker>
            <view v-else class="form-group">
              <text class="label">所属区域</text>
              <view class="form-field-readonly">暂无负责区域</view>
            </view>
            <view class="form-group">
              <text class="label">地址提示</text>
              <input
                v-model="form.addressHint"
                type="text"
                class="field-input"
                placeholder="意向地段、路口等补充"
                :cursor-spacing="120"
              />
            </view>
            <view class="form-group">
              <text class="label">需求摘要</text>
              <textarea
                v-model="form.demandSummary"
                class="field-textarea"
                placeholder="面积、预算、行业偏好…"
                :cursor-spacing="160"
                :show-confirm-bar="true"
                :adjust-position="true"
                :hold-keyboard="true"
              />
            </view>
            <button class="btn-primary" style="width: 100%; margin-top: 24rpx" :disabled="saving" @click="submit">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.customer-form-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.page-scroll__inner {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
