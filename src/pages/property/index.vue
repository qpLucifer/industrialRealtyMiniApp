<template>
  <view class="page tab-page">
    <ic-top-bar>
      <template #left>
        <view>
          <text class="h1">房源库</text>
          <text class="sub">品类全 · 已按区域隔离</text>
        </view>
      </template>
      <template #right>
        <text class="ghost" @tap="openFilter">筛选</text>
      </template>
    </ic-top-bar>

    <scroll-view scroll-y class="tab-page__scroll">
      <view class="search">
        <input class="search__input" type="text" placeholder="关键词：区位 / 配电 / 行车 / 行业…" />
      </view>

      <view class="seg">
        <text
          v-for="(t, i) in seg"
          :key="t"
          class="seg__btn"
          :class="{ 'seg__btn--on': i === segIndex }"
          @tap="segIndex = i"
        >{{ t }}</text>
      </view>

      <view v-for="item in listItems" :key="item.id" class="li" @tap="openItem(item)">
        <view class="thumb" />
        <view class="li__body">
          <view class="row-between">
            <text class="li__title">{{ item.listTitle }}</text>
            <ic-chip :type="item.listChipType">{{ item.listChip }}</ic-chip>
          </view>
          <text class="muted">{{ item.listSub }}</text>
          <text v-if="item.id === 'P-DRAFT-001'" class="amber">{{ item.listPrice }}</text>
          <text v-else class="price">{{ item.listPrice }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="fab" @tap="newProp">＋</view>

    <view v-if="filterOpen" class="modal" @tap="filterOpen = false">
      <view class="sheet" @tap.stop>
        <text class="sheet__h">高级筛选</text>
        <text class="sec">行政区域</text>
        <picker mode="region" @change="onRegion">
          <view class="picker-line">省市区（演示）</view>
        </picker>
        <text class="sec">面积（㎡）</text>
        <view class="two">
          <input class="inp" type="number" placeholder="最小" value="2000" />
          <input class="inp" type="number" placeholder="最大" value="8000" />
        </view>
        <button class="btn-primary" type="primary" @tap="applyFilter">应用筛选</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PROPERTY_LIST_ORDER, PROPERTY_SEG_OPTIONS, getProperty } from '@/mock/index.js'
import { setPropertyDetailId } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const seg = PROPERTY_SEG_OPTIONS
const segIndex = ref(0)
const filterOpen = ref(false)
const regionText = ref('')

const listItems = computed(() => PROPERTY_LIST_ORDER.map((id) => getProperty(id)))

function openFilter() {
  filterOpen.value = true
}

function applyFilter() {
  filterOpen.value = false
  showToast(regionText.value ? '已应用筛选（演示）' : '筛选已关闭')
}

function onRegion(e) {
  regionText.value = (e.detail && e.detail.value && e.detail.value.join(' ')) || ''
}

function openItem(item) {
  setPropertyDetailId(item.id)
  if (item.id === 'P-DRAFT-001') {
    uni.navigateTo({ url: '/package-property/publish?mode=draft&id=P-DRAFT-001' })
    return
  }
  uni.navigateTo({ url: '/package-property/detail?id=' + encodeURIComponent(item.id) })
}

function newProp() {
  uni.navigateTo({ url: '/package-property/publish?mode=new' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.tab-page {
  min-height: 100vh;
  background: $ic-bg-deep;
}

.tab-page__scroll {
  height: calc(100vh - 120rpx);
  padding: 28rpx 28rpx 200rpx;
}

.h1 {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: $ic-text;
}
.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $ic-muted;
}
.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}

.search {
  margin-bottom: 24rpx;
}
.search__input {
  width: 100%;
  padding: 22rpx 26rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}

.seg {
  display: flex;
  background: #f1f5f9;
  border-radius: 24rpx;
  padding: 8rpx;
  border: 1rpx solid $ic-border;
  margin-bottom: 24rpx;
}
.seg__btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  border-radius: 20rpx;
  font-weight: 600;
}
.seg__btn--on {
  background: #fff;
  color: $ic-mint;
  box-shadow: $ic-shadow-md;
}

.li {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $ic-border;
}
.thumb {
  width: 148rpx;
  height: 148rpx;
  border-radius: 24rpx;
  background: linear-gradient(145deg, rgba(20, 184, 166, 0.15), transparent),
    linear-gradient(135deg, #e2e8f0, #f8fafc);
  border: 1rpx solid $ic-border;
  flex-shrink: 0;
}
.li__body {
  flex: 1;
  min-width: 0;
}
.li__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $ic-text;
}
.muted {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.price {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: $ic-cyan;
  font-weight: 600;
}
.amber {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $ic-amber;
}

.fab {
  position: fixed;
  right: 36rpx;
  bottom: 200rpx;
  width: 108rpx;
  height: 108rpx;
  border-radius: 36rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  font-weight: 300;
  z-index: 20;
  @include ic-gradient-primary;
  box-shadow: 0 10rpx 28rpx rgba(13, 148, 136, 0.35);
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  z-index: 900;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 32rpx;
}
.sheet {
  width: 100%;
  max-width: 860rpx;
  max-height: 78vh;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 40rpx 40rpx 0 0;
  padding: 32rpx;
  border: 1rpx solid $ic-border;
}
.sheet__h {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
}
.sec {
  display: block;
  margin: 16rpx 0 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
}
.picker-line {
  padding: 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  color: $ic-muted;
}
.two {
  display: flex;
  gap: 20rpx;
}
.inp {
  flex: 1;
  padding: 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
}
.btn-primary {
  margin-top: 24rpx;
  width: 100%;
  border-radius: 24rpx;
  color: #fff;
  border: none;
  @include ic-gradient-primary;
}
</style>
