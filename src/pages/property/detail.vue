<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchPropertyDetail } from '@/api/property'
import type { PropertyDetailPayload } from '@/mock/data/properties'

const topBarInsetStyle = useTopBarInsetStyle()
const pid = ref('P-8821')
const detail = ref<PropertyDetailPayload | null>(null)
const tab = ref(0)

const auditClass = computed(() => {
  const k = detail.value?.auditKey || 'live'
  if (k === 'live') return 'audit-live'
  if (k === 'pending') return 'audit-pending'
  if (k === 'rejected') return 'audit-rejected'
  return 'audit-draft'
})

const codeChipClass = computed(() => {
  const k = detail.value?.auditKey
  if (k === 'live') return 'ok'
  if (k === 'pending') return 'warn'
  return ''
})

const codeChipStyle = computed(() => {
  const k = detail.value?.auditKey
  if (k === 'rejected')
    return 'background:rgba(254,226,226,0.9);color:#b91c1c;border-color:rgba(244,63,94,0.35)'
  if (k === 'draft') return 'background:#e2e8f0;color:#475569'
  return ''
})

onLoad((q) => {
  if (q?.id) pid.value = String(q.id)
})

async function load() {
  detail.value = await fetchPropertyDetail(pid.value)
}

onShow(() => {
  load()
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/property/list' }) })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/property/publish?editId=${encodeURIComponent(pid.value)}` })
}

function goLog() {
  uni.navigateTo({ url: `/pages/property/log?id=${encodeURIComponent(pid.value)}` })
}

function goViewing() {
  uni.navigateTo({ url: '/pages/viewing/new' })
}

function shareDemo() {
  uni.showToast({ title: '已生成内部转发卡片（原型）', icon: 'none' })
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
          <view class="top-bar__nav-mid">房源详情</view>
          <view class="top-bar__nav-right">
            <button class="btn-ghost sm" @click="goEdit">编辑</button>
            <button class="btn-ghost sm" @click="goLog">日志</button>
          </view>
        </view>
      </view>
      <view class="detail-hero"><view class="orb" /></view>
      <view class="detail-tabs">
        <button class="tab-btn" :class="{ active: tab === 0 }" @click="tab = 0">基础与媒体</button>
        <button class="tab-btn" :class="{ active: tab === 1 }" @click="tab = 1">土地·配套·使用</button>
        <button class="tab-btn" :class="{ active: tab === 2 }" @click="tab = 2">产权·合规·备注</button>
        <button class="tab-btn" :class="{ active: tab === 3 }" @click="tab = 3">联系</button>
      </view>
      <scroll-view v-if="detail" scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0; padding-top: 24rpx">
        <view class="prop-detail-audit-strip" :class="auditClass">
          <view style="flex: 1; min-width: 0">
            <text style="font-size: 28rpx; font-weight: 700; display: block">{{ detail.auditBadge }}</text>
            <text class="hint" style="display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 1.5">{{
              detail.auditHint
            }}</text>
          </view>
          <text class="chip" :class="codeChipClass" :style="codeChipStyle">{{ detail.id }}</text>
        </view>
        <view class="card card-glow">
          <view class="badge-row">
            <text
              v-for="s in ['待租', '已租', '待售', '已售', '意向中', '下架封存']"
              :key="s"
              class="chip"
              :class="{ on: detail.leaseChip === s, ok: s === '待租' || s === '已租', danger: s === '下架封存' }"
              >{{ s }}</text
            >
          </view>
          <text class="hint" style="display: block; margin-top: 20rpx"
            >有权限时可一键切换状态 · 全量写入操作日志 · 字段与发布房源同源</text
          >
          <view style="font-size: 36rpx; margin-top: 28rpx; font-family: var(--display); font-weight: 700">{{
            detail.detailTitle
          }}</view>
          <text class="hint" style="display: block; margin-top: 16rpx; font-size: 26rpx; line-height: 1.5">{{
            detail.specLine
          }}</text>
          <text style="display: block; margin-top: 12rpx; font-size: 30rpx; font-weight: 600; color: var(--cyan)">{{
            detail.priceLine
          }}</text>
        </view>
        <view v-show="tab === 0" class="detail-tab-panel card">
          <view class="section-title">分类 · 基础信息 · 媒体（对应发布 Step 1）</view>
          <view class="kv">
            <view v-for="(row, i) in detail.kv.s1" :key="'s1' + i" class="kv-row">
              <text class="kv-dt">{{ row.dt }}</text>
              <text class="kv-dd">{{ row.dd }}</text>
            </view>
          </view>
        </view>
        <view v-show="tab === 1" class="detail-tab-panel card">
          <view class="section-title">验厂表 2–5 · 土地 · 电力 · 配套 · 使用</view>
          <view class="kv">
            <view v-for="(row, i) in detail.kv.s2" :key="'s2' + i" class="kv-row">
              <text class="kv-dt">{{ row.dt }}</text>
              <text class="kv-dd">{{ row.dd }}</text>
            </view>
          </view>
        </view>
        <view v-show="tab === 2" class="detail-tab-panel card">
          <view class="section-title">验厂表 7–13 · 产权 · 交易 · 政策 · 环保</view>
          <view class="kv">
            <view v-for="(row, i) in detail.kv.s3" :key="'s3' + i" class="kv-row">
              <text class="kv-dt">{{ row.dt }}</text>
              <text class="kv-dd">{{ row.dd }}</text>
            </view>
          </view>
        </view>
        <view v-show="tab === 3" class="detail-tab-panel card">
          <view class="section-title">联系人 · 预约 · 内部跟进</view>
          <view class="kv">
            <view v-for="(row, i) in detail.kv.s4" :key="'s4' + i" class="kv-row">
              <text class="kv-dt">{{ row.dt }}</text>
              <text class="kv-dd">{{ row.dd }}</text>
            </view>
          </view>
          <view style="display: flex; gap: 20rpx; margin-top: 32rpx">
            <button class="btn-primary" style="flex: 1; padding: 24rpx" @click="goViewing">预约带看</button>
            <button class="btn-secondary" style="flex: 1; padding: 24rpx" @click="shareDemo">内部转发</button>
          </view>
        </view>
        <view class="card">
          <view class="section-title">媒体资产</view>
          <view class="upload-grid">
            <view class="upload-tile"><text class="tile-title">现场相册</text>12 张 · 含必拍项</view>
            <view class="upload-tile"><text class="tile-title">短视频</text>30s×2</view>
          </view>
        </view>
        <view class="card map-location-card">
          <view class="section-title">实地位置 · 地图导航</view>
          <text class="hint" style="display: block; margin-bottom: 20rpx"
            >每套厂房介绍页底部展示真实 GPS，与后台录入经纬度一致；用户可一键跳转系统地图导航。</text
          >
          <view class="map-placeholder">
            <view class="map-pin" />
            <text class="map-coord">{{ detail.mapCoordLabel }}</text>
          </view>
          <view class="kv" style="margin-top: 24rpx">
            <view class="kv-row">
              <text class="kv-dt">导航地址</text>
              <text class="kv-dd">{{ detail.navAddr }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-dt">定位来源</text>
              <text class="kv-dd">发布人现场采集 · WGS84</text>
            </view>
          </view>
          <view style="display: flex; gap: 20rpx; margin-top: 28rpx">
            <button class="btn-primary" style="flex: 1; padding: 24rpx">打开地图导航</button>
            <button class="btn-secondary" style="flex: 1; padding: 24rpx">复制坐标</button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.tb-center {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
}
.btn-ghost.sm {
  padding: 16rpx 20rpx;
  font-size: 26rpx;
}
.kv-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16rpx;
}
.kv-dt {
  font-size: 22rpx;
  color: var(--muted);
}
.kv-dd {
  font-size: 26rpx;
  margin-top: 6rpx;
}
</style>
