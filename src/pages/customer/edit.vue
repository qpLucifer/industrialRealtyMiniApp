<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchCustomerDetail, updateCustomer } from '@/api/customer'
import type { CustomerDealStatus, CustomerGrade, CustomerScope } from '@/types/customer'

const topBarInsetStyle = useTopBarInsetStyle()
const id = ref('')
const saving = ref(false)

const form = reactive({
  company: '',
  contactName: '',
  titleLine: '',
  phone: '',
  grade: 'B 类' as CustomerGrade,
  dealStatus: '洽谈中' as CustomerDealStatus,
  demandSummary: '',
  addressHint: '',
  scope: '私有' as CustomerScope,
})

const grades: CustomerGrade[] = ['A 类', 'B 类', 'C 类']
const deals: CustomerDealStatus[] = ['洽谈中', '已成交', '搁置']
const scopes: CustomerScope[] = ['私有', '公有']

onLoad(async (q) => {
  if (q?.id) id.value = String(q.id)
  if (!id.value) return
  const d = await fetchCustomerDetail(id.value)
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
  form.addressHint = d.addressHint
  form.scope = d.scope
})

function onGradePick(e: { detail: { value: string | number } }) {
  form.grade = grades[Number(e.detail.value)] ?? 'B 类'
}

function onDealPick(e: { detail: { value: string | number } }) {
  form.dealStatus = deals[Number(e.detail.value)] ?? '洽谈中'
}

function onScopePick(e: { detail: { value: string | number } }) {
  form.scope = scopes[Number(e.detail.value)] ?? '私有'
}

async function submit() {
  if (!form.company.trim() || !form.contactName.trim() || !form.phone.trim()) {
    uni.showToast({ title: '请填写公司、联系人与手机', icon: 'none' })
    return
  }
  saving.value = true
  try {
    await updateCustomer(id.value, {
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      titleLine: form.titleLine.trim(),
      phone: form.phone.trim(),
      grade: form.grade,
      dealStatus: form.dealStatus,
      demandSummary: form.demandSummary.trim(),
      addressHint: form.addressHint.trim(),
      scope: form.scope,
    })
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
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">编辑客户</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="crm-card crm-form-grid">
            <view class="form-group">
              <text class="label">公司 / 主体<text class="req">*</text></text>
              <input v-model="form.company" placeholder="营业执照名称" />
            </view>
            <view class="form-group">
              <text class="label">主题（列表摘要）</text>
              <input v-model="form.titleLine" placeholder="例：张晨 · 某某公司" />
            </view>
            <view class="form-group">
              <text class="label">联系人<text class="req">*</text></text>
              <input v-model="form.contactName" placeholder="姓名" />
            </view>
            <view class="form-group">
              <text class="label">手机<text class="req">*</text></text>
              <input v-model="form.phone" type="number" maxlength="11" placeholder="11 位手机号" />
            </view>
            <view class="form-group">
              <text class="label">等级</text>
              <picker :range="grades" :value="grades.indexOf(form.grade)" @change="onGradePick">
                <view class="crm-picker-field">{{ form.grade }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">成交状态</text>
              <picker :range="deals" :value="deals.indexOf(form.dealStatus)" @change="onDealPick">
                <view class="crm-picker-field">{{ form.dealStatus }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">客户池</text>
              <picker :range="scopes" :value="scopes.indexOf(form.scope)" @change="onScopePick">
                <view class="crm-picker-field">{{ form.scope }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">地址 / 区域</text>
              <input v-model="form.addressHint" placeholder="意向区域、地址提示" />
            </view>
            <view class="form-group">
              <text class="label">需求摘要</text>
              <textarea v-model="form.demandSummary" placeholder="面积、预算、行业偏好…" />
            </view>
            <button class="btn-primary crm-follow-btn" :disabled="saving" @click="submit">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped src="@/styles/customer-crm.css"></style>
