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
            以下为全站安全策略（只读）。如需修改，请联系管理员在后台「系统设置」中调整。
          </text>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0">
            <view style="flex: 1">
              <text style="font-weight: 700">房源联系人脱敏</text>
              <text class="hint" style="display: block; margin-top: 8rpx">对外展示掩码号码</text>
            </view>
            <switch :checked="s.maskPropertyContact" disabled />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">客户电话脱敏</text>
              <text class="hint" style="display: block; margin-top: 8rpx">列表与详情默认掩码</text>
            </view>
            <switch :checked="s.maskCustomerPhone" disabled />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">禁止长按复制</text>
              <text class="hint" style="display: block; margin-top: 8rpx">降低截图外流风险</text>
            </view>
            <switch :checked="s.forbidLongPressCopy" disabled />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">发布默认走审核</text>
              <text class="hint" style="display: block; margin-top: 8rpx">关闭则部分角色可直接上架</text>
            </view>
            <switch :checked="s.auditPublish" disabled />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
