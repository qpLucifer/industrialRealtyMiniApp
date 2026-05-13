<template>
  <view class="ic-tab">
    <view
      v-for="(item, index) in items"
      :key="item.pagePath"
      class="ic-tab__item"
      :class="{ 'ic-tab__item--on': index === selected }"
      @tap="onTap(item, index)"
    >
      <view class="ic-tab__icon" :class="'ic-tab__icon--' + item.icon" />
      <text class="ic-tab__text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { TAB_BAR_ITEMS } from '@/mock/index.js'

const selected = ref(0)

const items = TAB_BAR_ITEMS

function syncSelected() {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1]
  const route = cur && cur.route ? cur.route : ''
  const idx = items.findIndex((it) => route === it.pagePath)
  if (idx >= 0) selected.value = idx
}

onShow(() => {
  syncSelected()
})

function onTap(item, index) {
  if (index === selected.value) return
  selected.value = index
  uni.switchTab({ url: '/' + item.pagePath })
}
</script>

<style lang="scss">
@import '@/styles/theme.scss';

.ic-tab {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  justify-content: space-around;
  padding: 12rpx 8rpx calc(12rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid $ic-border;
  box-shadow: 0 -8rpx 32rpx rgba(15, 23, 42, 0.06);
}

.ic-tab__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
}

.ic-tab__text {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: $ic-muted;
}

.ic-tab__item--on .ic-tab__text {
  color: $ic-mint;
  font-weight: 600;
}

.ic-tab__icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  background: #e2e8f0;
}

.ic-tab__item--on .ic-tab__icon {
  background: rgba(13, 148, 136, 0.18);
}

.ic-tab__icon--home {
  /* simple house shape via mask color */
  background: linear-gradient(180deg, #cbd5e1, #e2e8f0);
}
.ic-tab__item--on .ic-tab__icon--home {
  background: linear-gradient(180deg, #5eead4, #0d9488);
}

.ic-tab__icon--prop {
  background: linear-gradient(180deg, #cbd5e1, #e2e8f0);
}
.ic-tab__item--on .ic-tab__icon--prop {
  background: linear-gradient(180deg, #7dd3fc, #0e7490);
}

.ic-tab__icon--cust {
  background: linear-gradient(180deg, #cbd5e1, #e2e8f0);
}
.ic-tab__item--on .ic-tab__icon--cust {
  background: linear-gradient(180deg, #5eead4, #0d9488);
}

.ic-tab__icon--msg {
  background: linear-gradient(180deg, #cbd5e1, #e2e8f0);
}
.ic-tab__item--on .ic-tab__icon--msg {
  background: linear-gradient(180deg, #7dd3fc, #0e7490);
}

.ic-tab__icon--me {
  background: linear-gradient(180deg, #cbd5e1, #e2e8f0);
}
.ic-tab__item--on .ic-tab__icon--me {
  background: linear-gradient(180deg, #5eead4, #0d9488);
}
</style>
