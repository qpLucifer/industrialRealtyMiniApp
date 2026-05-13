<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchSecuritySettings, saveSecuritySettings } from '@/api/user'
import type { SecuritySettings } from '@/mock/data/user'

const topBarInsetStyle = useTopBarInsetStyle()
const s = ref<SecuritySettings | null>(null)

onMounted(async () => {
  s.value = await fetchSecuritySettings()
})

async function save() {
  if (!s.value) return
  await saveSecuritySettings(s.value)
  uni.showToast({ title: '已保存', icon: 'none' })
}

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/me/me' }) })
}

function patch<K extends keyof SecuritySettings>(key: K, e: unknown) {
  const v = (e as { detail?: { value?: SecuritySettings[K] } }).detail?.value
  if (!s.value || v === undefined) return
  s.value[key] = v
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
          <view class="top-bar__nav-mid">安全与隐私</view>
          <view class="top-bar__nav-right top-bar__nav-right--spacer"></view>
        </view>
      </view>
      <scroll-view v-if="s" scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="card">
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0">
            <view style="flex: 1">
              <text style="font-weight: 700">房源联系人脱敏</text>
              <text class="hint" style="display: block; margin-top: 8rpx">对外展示掩码号码</text>
            </view>
            <switch :checked="s.maskPropertyContact" @change="patch('maskPropertyContact', $event)" />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">客户电话脱敏</text>
              <text class="hint" style="display: block; margin-top: 8rpx">列表与详情默认掩码</text>
            </view>
            <switch :checked="s.maskCustomerPhone" @change="patch('maskCustomerPhone', $event)" />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">禁止长按复制</text>
              <text class="hint" style="display: block; margin-top: 8rpx">降低截图外流风险</text>
            </view>
            <switch :checked="s.forbidLongPressCopy" @change="patch('forbidLongPressCopy', $event)" />
          </view>
          <view class="list-item" style="border: 0; padding-left: 0; padding-right: 0; margin-top: 24rpx">
            <view style="flex: 1">
              <text style="font-weight: 700">发布默认走审核</text>
              <text class="hint" style="display: block; margin-top: 8rpx">关闭则部分角色可直接上架</text>
            </view>
            <switch :checked="s.auditPublish" @change="patch('auditPublish', $event)" />
          </view>
          <button class="btn-primary" style="width: 100%; margin-top: 36rpx" @click="save">保存到服务端（原型）</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
