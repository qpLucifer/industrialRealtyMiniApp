<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchDealFormDefaults } from '@/api/extra'
import { postAction } from '@/api/message'

const contractType = ref('')
const amountWan = ref('')
const commissionWan = ref('')
const invoice = ref('')

onMounted(async () => {
  const d = await fetchDealFormDefaults()
  contractType.value = d.contractType
  amountWan.value = d.amountWan
  commissionWan.value = d.commissionWan
  invoice.value = d.invoice
})

async function submit() {
  await postAction('deal-create', {
    contractType: contractType.value,
    amountWan: amountWan.value,
    commissionWan: commissionWan.value,
    invoice: invoice.value,
  })
  uni.showToast({ title: '成交单已保存', icon: 'none' })
  uni.navigateBack()
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="新建成交" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="card">
          <view class="form-group">
            <text class="label">合同类型</text>
            <input v-model="contractType" />
          </view>
          <view class="form-group">
            <text class="label">合同金额（万元）</text>
            <input v-model="amountWan" type="digit" />
          </view>
          <view class="form-group">
            <text class="label">佣金（万元）</text>
            <input v-model="commissionWan" type="digit" />
          </view>
          <view class="form-group">
            <text class="label">发票类型</text>
            <input v-model="invoice" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 24rpx" @click="submit">提交</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
