<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="back">返回</text>
      </template>
      <template #center>
        <text class="center-title">房源详情</text>
      </template>
      <template #right>
        <view class="right-pair">
          <text class="ghost" @tap="edit">编辑</text>
          <text class="ghost" @tap="log">日志</text>
        </view>
      </template>
    </ic-top-bar>

    <view class="hero"><view class="orb" /></view>

    <view class="tabs">
      <text
        v-for="(t, i) in tabLabels"
        :key="t"
        class="tab"
        :class="{ 'tab--on': i === tabIndex }"
        @tap="tabIndex = i"
      >{{ t }}</text>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="audit" :class="'audit--' + p.auditKey">
        <view class="audit__mid">
          <text class="audit__badge">{{ p.auditBadge }}</text>
          <text class="audit__hint">{{ p.auditHint }}</text>
        </view>
        <ic-chip :type="codeChipType">{{ p.code }}</ic-chip>
      </view>

      <ic-card glow>
        <view class="chips">
          <ic-chip
            v-for="s in statusList"
            :key="s"
            type="plain"
            :on="leaseChip === s"
            @tap="pickStatus(s)"
          >{{ s }}</ic-chip>
        </view>
        <text class="hint">有权限时可一键切换状态 · 全量写入操作日志 · 字段与发布房源同源</text>
        <text class="title">{{ p.title }}</text>
        <text class="spec">{{ p.specLine }}</text>
        <text class="price">{{ p.priceLine }}</text>
      </ic-card>

      <ic-card v-show="tabIndex === 0">
        <text class="sec">分类 · 基础信息 · 媒体（对应发布 Step 1）</text>
        <block v-for="row in panel1" :key="row.k">
          <view class="kv">
            <text class="k">{{ row.k }}</text>
            <text class="v">{{ row.v }}</text>
          </view>
        </block>
      </ic-card>

      <ic-card v-show="tabIndex === 1">
        <text class="sec">验厂表 2–5 · 土地 · 电力 · 配套 · 使用</text>
        <block v-for="row in panel2" :key="row.k">
          <view class="kv">
            <text class="k">{{ row.k }}</text>
            <text class="v">{{ row.v }}</text>
          </view>
        </block>
      </ic-card>

      <ic-card v-show="tabIndex === 2">
        <text class="sec">验厂表 7–13 · 产权 · 交易 · 政策 · 环保</text>
        <block v-for="row in panel3" :key="row.k">
          <view class="kv">
            <text class="k">{{ row.k }}</text>
            <text class="v">{{ row.v }}</text>
          </view>
        </block>
      </ic-card>

      <ic-card v-show="tabIndex === 3">
        <text class="sec">联系人 · 预约 · 内部跟进</text>
        <block v-for="row in panel4" :key="row.k">
          <view class="kv">
            <text class="k">{{ row.k }}</text>
            <text class="v">{{ row.v }}</text>
          </view>
        </block>
        <view class="row2">
          <button class="btn p" type="primary" @tap="goVisit">预约带看</button>
          <button class="btn s" @tap="toast('内部转发（演示）')">内部转发</button>
        </view>
      </ic-card>

      <ic-card>
        <text class="sec">媒体资产</text>
        <view class="grid2">
          <view class="tile"><text class="tb">现场相册</text><text class="td">12 张 · 含必拍项</text></view>
          <view class="tile"><text class="tb">短视频</text><text class="td">30s×2</text></view>
        </view>
      </ic-card>

      <ic-card>
        <text class="sec">实地位置 · 地图导航</text>
        <text class="hint">每套厂房介绍页底部展示真实 GPS，与后台录入经纬度一致；用户可一键跳转系统地图导航。</text>
        <view class="map">
          <view class="pin" />
          <text class="coord">{{ p.mapCoordLabel }}</text>
        </view>
        <view class="kv"><text class="k">导航地址</text><text class="v">{{ p.navAddr }}</text></view>
        <view class="kv"><text class="k">定位来源</text><text class="v">发布人现场采集 · WGS84</text></view>
        <view class="row2">
          <button class="btn p" type="primary" @tap="toast('打开地图导航（演示）')">打开地图导航</button>
          <button class="btn s" @tap="toast('坐标已复制（演示）')">复制坐标</button>
        </view>
      </ic-card>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  PROPERTY_DETAIL_PANEL1,
  PROPERTY_DETAIL_PANEL2,
  PROPERTY_DETAIL_PANEL3,
  PROPERTY_DETAIL_PANEL4,
  PROPERTY_DETAIL_STATUS_LIST,
  PROPERTY_DETAIL_TAB_LABELS,
  getProperty,
} from '@/mock/index.js'
import { getPropertyDetailId, setPropertyDetailId } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const tabLabels = PROPERTY_DETAIL_TAB_LABELS
const tabIndex = ref(0)
const pid = ref('P-8821')
const leaseChip = ref('待租')

const p = computed(() => getProperty(pid.value))

const statusList = PROPERTY_DETAIL_STATUS_LIST

const codeChipType = computed(() => {
  const k = p.value.auditKey
  if (k === 'live') return 'ok'
  if (k === 'pending') return 'warn'
  if (k === 'rejected') return 'danger'
  return 'neutral'
})

onLoad((q) => {
  const id = (q && q.id) || getPropertyDetailId()
  pid.value = id || 'P-8821'
  setPropertyDetailId(pid.value)
  leaseChip.value = p.value.leaseChip || '待租'
})

const panel1 = PROPERTY_DETAIL_PANEL1
const panel2 = PROPERTY_DETAIL_PANEL2
const panel3 = PROPERTY_DETAIL_PANEL3
const panel4 = PROPERTY_DETAIL_PANEL4

function toast(msg) {
  showToast(msg)
}

function pickStatus(s) {
  leaseChip.value = s
  showToast('状态已切换为：' + s + '（演示）')
}

function back() {
  uni.navigateBack({ delta: 1 })
}

function edit() {
  setPropertyDetailId(pid.value)
  uni.navigateTo({ url: '/package-property/publish?mode=published&id=' + encodeURIComponent(pid.value) })
}

function log() {
  uni.navigateTo({ url: '/package-property/log' })
}

function goVisit() {
  uni.navigateTo({ url: '/package-me/viewing-form' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.page {
  min-height: 100vh;
  background: $ic-bg-deep;
}

.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}
.center-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: $ic-text;
}
.right-pair {
  display: flex;
  gap: 8rpx;
  flex-shrink: 0;
}

.hero {
  height: 400rpx;
  background: linear-gradient(180deg, transparent 32%, rgba(255, 255, 255, 0.92)),
    linear-gradient(135deg, #bae6fd 0%, #99f6e4 45%, #e0f2fe 100%);
  border-bottom: 1rpx solid $ic-border;
  position: relative;
}
.orb {
  position: absolute;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  right: 48rpx;
  top: 40rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.85), transparent 68%);
  filter: blur(10px);
}

.tabs {
  display: flex;
  gap: 8rpx;
  margin: -40rpx 28rpx 0;
  position: relative;
  z-index: 2;
}
.tab {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 14rpx 8rpx;
  border: 1rpx solid $ic-border;
  border-radius: 24rpx 24rpx 0 0;
  background: #f1f5f9;
  color: $ic-muted;
  font-size: 22rpx;
  font-weight: 600;
}
.tab--on {
  color: $ic-mint;
  border-bottom-color: transparent;
  background: $ic-surface;
  font-weight: 700;
}

.scroll {
  height: calc(100vh - 520rpx);
  padding: 24rpx 28rpx 40rpx;
}

.audit {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 24rpx;
  border-radius: 28rpx;
  border: 1rpx solid $ic-border;
  margin-bottom: 22rpx;
  background: rgba(248, 250, 252, 0.95);
}
.audit--live {
  border-color: rgba(52, 211, 153, 0.45);
  background: rgba(52, 211, 153, 0.12);
}
.audit--pending {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.12);
}
.audit--rejected {
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(254, 226, 226, 0.35);
}
.audit--draft {
  border-color: rgba(100, 116, 139, 0.35);
  background: rgba(241, 245, 249, 0.9);
}
.audit__badge {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $ic-text;
}
.audit__hint {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.5;
}
.audit__mid {
  flex: 1;
  min-width: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
}
.hint {
  display: block;
  margin-top: 18rpx;
  font-size: 22rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.title {
  display: block;
  margin-top: 22rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: $ic-text;
}
.spec {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  color: $ic-muted;
  line-height: 1.5;
}
.price {
  display: block;
  margin-top: 10rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: $ic-cyan;
}

.sec {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.08em;
}
.kv {
  display: flex;
  gap: 16rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
}
.k {
  width: 200rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: $ic-muted;
}
.v {
  flex: 1;
  font-size: 26rpx;
  color: $ic-text;
  line-height: 1.45;
}

.grid2 {
  display: flex;
  gap: 20rpx;
}
.tile {
  flex: 1;
  border: 1rpx dashed rgba(13, 148, 136, 0.35);
  border-radius: 24rpx;
  padding: 28rpx 20rpx;
  background: $ic-surface2;
  text-align: center;
}
.tb {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: $ic-mint;
}
.td {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ic-muted;
}

.map {
  position: relative;
  height: 320rpx;
  border-radius: 28rpx;
  border: 1rpx solid $ic-border;
  margin: 16rpx 0 20rpx;
  background: linear-gradient(145deg, rgba(186, 230, 253, 0.55), rgba(204, 251, 241, 0.45)),
    linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: hidden;
}
.pin {
  position: absolute;
  left: 55%;
  top: 42%;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50% 50% 50% 0;
  transform: translate(-50%, -100%) rotate(-45deg);
  background: linear-gradient(135deg, #f43f5e, #fb7185);
}
.coord {
  position: absolute;
  left: 24rpx;
  bottom: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: $ic-text;
}

.row2 {
  display: flex;
  gap: 20rpx;
  margin-top: 22rpx;
}
.btn {
  flex: 1;
  border-radius: 24rpx;
  font-size: 28rpx;
  padding: 20rpx 12rpx;
}
.btn.p {
  color: #fff;
  border: none;
  @include ic-gradient-primary;
}
.btn.s {
  background: $ic-surface2;
  border: 1rpx solid $ic-border;
  color: $ic-text;
  font-weight: 600;
}
</style>
