<script setup lang="ts">
import { reactive, ref } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import { createCustomer } from '@/api/customer'
import { markCustomerListStale } from '@/utils/customerNav'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
import type { CustomerDealStatus, CustomerGrade, CustomerScope } from '@/types/customer'

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
    const r = await createCustomer({
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
    markCustomerListStale()
    markWorkbenchStale()
    uni.showToast({ title: '客户已创建', icon: 'none' })
    const slug = r.slug || r.id
    if (slug) {
      uni.redirectTo({ url: `/pages/customer/detail?id=${encodeURIComponent(slug)}` })
      return
    }
    uni.navigateBack()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '创建失败', icon: 'none' })
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
      <NavIconBar title="新建客户" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="card">
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
            <view class="form-group">
              <text class="label">地址 / 区域</text>
              <input v-model="form.addressHint" placeholder="意向区域" />
            </view>
            <view class="form-group">
              <text class="label">需求摘要</text>
              <textarea v-model="form.demandSummary" placeholder="面积 / 区域 / 行业…" />
            </view>
            <button class="btn-primary" style="width: 100%; margin-top: 24rpx" :disabled="saving" @click="submit">
              {{ saving ? '提交中…' : '创建客户' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
