<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import { createLandAuction } from '@/api/landAuction'
import { LAND_STATUS_OPTIONS, useLandAuctionForm } from '@/composables/useLandAuctionForm'
import {
  markLandAuctionDetailStale,
  markLandAuctionFocusStatus,
  markLandAuctionListStale,
} from '@/utils/landAuctionNav'

const saving = ref(false)
const {
  form,
  regionNames,
  statusLabels,
  loadRegions,
  onRegionPick,
  onStatusPick,
  buildPayload,
  validate,
} = useLandAuctionForm()

const regionPickerIndex = computed(() => {
  const i = regionNames.value.findIndex((n) => n === form.district)
  return i >= 0 ? i : 0
})

const statusPickerIndex = computed(() =>
  LAND_STATUS_OPTIONS.findIndex((s) => s.value === form.auctionStatus),
)

onLoad(() => {
  void loadRegions()
})

async function submit() {
  const err = validate()
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }
  saving.value = true
  try {
    const r = await createLandAuction(buildPayload())
    markLandAuctionListStale()
    markLandAuctionFocusStatus(form.auctionStatus)
    uni.showToast({ title: '已创建', icon: 'none' })
    if (r.id) {
      markLandAuctionDetailStale(r.id)
      uni.redirectTo({ url: `/pages/land-auction/detail?id=${r.id}` })
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
      <NavIconBar title="新增工业土地" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll land-form-scroll">
        <view class="page-scroll__inner">
          <view class="card customer-form">
            <view class="form-group">
              <text class="label">地块/项目<text class="req">*</text></text>
              <input
                v-model="form.title"
                type="text"
                class="field-input"
                placeholder="项目名称"
                :cursor-spacing="120"
              />
            </view>
            <view v-if="regionNames.length" class="form-group">
              <text class="label">所属区域<text class="req">*</text></text>
              <picker mode="selector" :range="regionNames" :value="regionPickerIndex" @change="onRegionPick">
                <view class="picker-like">{{ form.district || '请选择' }}</view>
              </picker>
            </view>
            <view v-else class="form-group">
              <text class="label">所属区域</text>
              <view class="form-field-readonly">暂无负责区域，请联系管理员配置</view>
            </view>
            <view class="form-group">
              <text class="label">拍卖状态</text>
              <picker mode="selector" :range="statusLabels" :value="statusPickerIndex" @change="onStatusPick">
                <view class="picker-like">{{ statusLabels[statusPickerIndex] || '即将挂拍' }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">面积（亩）</text>
              <input v-model="form.areaMu" type="digit" class="field-input" placeholder="亩" />
            </view>
            <view class="form-group">
              <text class="label">出让年限</text>
              <input v-model="form.transferTerm" type="text" class="field-input" placeholder="如：50年" />
            </view>
            <view class="form-row-2">
              <view class="form-group">
                <text class="label">亩产税</text>
                <input v-model="form.taxPerMu" type="digit" class="field-input" />
              </view>
              <view class="form-group">
                <text class="label">亩产投资</text>
                <input v-model="form.investmentPerMu" type="digit" class="field-input" />
              </view>
            </view>
            <template v-if="form.auctionStatus === 'upcoming' || form.auctionStatus === 'auctioning'">
              <view class="form-row-2">
                <view class="form-group">
                  <text class="label">保证金（万）</text>
                  <input v-model="form.depositWan" type="digit" class="field-input" placeholder="万元" />
                </view>
                <view class="form-group">
                  <text class="label">起始价（万）</text>
                  <input v-model="form.startPriceWan" type="digit" class="field-input" placeholder="万元" />
                </view>
              </view>
            </template>
            <template v-if="form.auctionStatus === 'completed'">
              <view class="form-row-2">
                <view class="form-group">
                  <text class="label">成交价（万）</text>
                  <input v-model="form.dealPriceWan" type="digit" class="field-input" placeholder="万元" />
                </view>
                <view class="form-group">
                  <text class="label">均价（万/亩）</text>
                  <input v-model="form.avgPricePerMu" type="digit" class="field-input" placeholder="万元/亩" />
                </view>
              </view>
              <view class="form-group">
                <text class="label">买方信息</text>
                <input v-model="form.buyerInfo" type="text" class="field-input" placeholder="企业名称、联系人等" />
              </view>
            </template>
            <view v-if="form.auctionStatus === 'upcoming'" class="form-group">
              <text class="label">预计挂拍日期</text>
              <picker mode="date" :value="form.listingDate" @change="(e) => (form.listingDate = e.detail.value)">
                <view class="picker-like">{{ form.listingDate || '选择日期' }}</view>
              </picker>
            </view>
            <template v-if="form.auctionStatus === 'auctioning'">
              <view class="form-group">
                <text class="label">拍卖开始</text>
                <view class="form-row-2">
                  <picker mode="date" :value="form.auctionStartDate" @change="(e) => (form.auctionStartDate = e.detail.value)">
                    <view class="picker-like">{{ form.auctionStartDate || '日期' }}</view>
                  </picker>
                  <picker mode="time" :value="form.auctionStartTime" @change="(e) => (form.auctionStartTime = e.detail.value)">
                    <view class="picker-like">{{ form.auctionStartTime || '时刻' }}</view>
                  </picker>
                </view>
              </view>
              <view class="form-group">
                <text class="label">拍卖结束</text>
                <view class="form-row-2">
                  <picker mode="date" :value="form.auctionEndDate" @change="(e) => (form.auctionEndDate = e.detail.value)">
                    <view class="picker-like">{{ form.auctionEndDate || '日期' }}</view>
                  </picker>
                  <picker mode="time" :value="form.auctionEndTime" @change="(e) => (form.auctionEndTime = e.detail.value)">
                    <view class="picker-like">{{ form.auctionEndTime || '时刻' }}</view>
                  </picker>
                </view>
              </view>
            </template>
            <view v-if="form.auctionStatus === 'completed'" class="form-group">
              <text class="label">成交时间</text>
              <view class="form-row-2">
                <picker mode="date" :value="form.completedDate" @change="(e) => (form.completedDate = e.detail.value)">
                  <view class="picker-like">{{ form.completedDate || '日期' }}</view>
                </picker>
                <picker mode="time" :value="form.completedTime" @change="(e) => (form.completedTime = e.detail.value)">
                  <view class="picker-like">{{ form.completedTime || '时刻' }}</view>
                </picker>
              </view>
            </view>
            <view class="form-group">
              <text class="label">备注</text>
              <textarea
                v-model="form.remark"
                class="field-textarea"
                placeholder="规划用途、区位说明等"
                :cursor-spacing="160"
                :show-confirm-bar="true"
              />
            </view>
            <button class="btn-primary" style="width: 100%; margin-top: 24rpx" :disabled="saving" @click="submit">
              {{ saving ? '提交中…' : '创建' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.land-form-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.picker-like {
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 1px solid var(--border);
}

.page-scroll__inner {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
