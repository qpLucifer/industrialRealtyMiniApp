<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import { fetchSecuritySettings } from '@/api/user'
import type { SecuritySettings } from '@/types/user'

const s = ref<SecuritySettings | null>(null)
const loading = ref(false)
const loadError = ref('')

onMounted(() => {
  void load()
})

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    s.value = await fetchSecuritySettings()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}

const policyLabels: { key: keyof SecuritySettings; title: string; hint: string }[] = [
  { key: 'maskPropertyContact', title: '房源联系人脱敏', hint: '对外展示掩码号码' },
  { key: 'maskCustomerPhone', title: '客户电话脱敏', hint: '列表与详情默认掩码' },
  { key: 'forbidLongPressCopy', title: '禁止长按复制', hint: '降低截图外流风险' },
  { key: 'auditPublish', title: '发布默认走审核', hint: '关闭则提交后直接上架' },
]
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="安全与隐私" @back="back" />
      <scroll-view v-if="loading" scroll-y class="scroll" style="flex: 1; min-height: 0">
        <view class="card"><text class="hint">加载中…</text></view>
      </scroll-view>
      <scroll-view v-else-if="loadError" scroll-y class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <text class="hint">{{ loadError }}</text>
          <button class="btn-primary" style="margin-top: 24rpx" @click="load">重试</button>
        </view>
      </scroll-view>
      <scroll-view v-else-if="s" scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <text class="hint" style="display: block; margin-bottom: 24rpx">
            以下为全站生效策略，仅管理员可在管理后台「系统设置」中修改。
          </text>
          <view
            v-for="(item, idx) in policyLabels"
            :key="item.key"
            class="list-item"
            :style="{
              border: 0,
              paddingLeft: 0,
              paddingRight: 0,
              marginTop: idx > 0 ? '24rpx' : 0,
            }"
          >
            <view style="flex: 1">
              <text style="font-weight: 700">{{ item.title }}</text>
              <text class="hint" style="display: block; margin-top: 8rpx">{{ item.hint }}</text>
            </view>
            <switch :checked="s[item.key]" disabled />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
