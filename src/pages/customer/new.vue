<script setup lang="ts">
import { ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { postAction } from '@/api/message'

const topBarInsetStyle = useTopBarInsetStyle()
const company = ref('')
const name = ref('')
const phone = ref('')
const need = ref('')

async function submit() {
  await postAction('customer-create', {
    company: company.value,
    name: name.value,
    phone: phone.value,
    need: need.value,
  })
  uni.showToast({ title: '已创建（原型）', icon: 'none' })
  uni.navigateBack()
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="back">返回</button>
          </view>
          <view class="top-bar__nav-mid">新建客户</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <view class="form-group">
            <text class="label">公司全称<text class="req">*</text></text>
            <input v-model="company" placeholder="营业执照名称" />
          </view>
          <view class="form-group">
            <text class="label">联系人<text class="req">*</text></text>
            <input v-model="name" placeholder="姓名" />
          </view>
          <view class="form-group">
            <text class="label">电话<text class="req">*</text></text>
            <input v-model="phone" type="number" placeholder="手机" />
          </view>
          <view class="form-group">
            <text class="label">需求摘要</text>
            <textarea v-model="need" placeholder="面积 / 区域 / 行业…" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 24rpx" @click="submit">保存</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
