<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { postAction } from '@/api/message'

const topBarInsetStyle = useTopBarInsetStyle()
const step = ref(0)
const title = ref('发布房源')
const showLeave = ref(false)

onLoad((q) => {
  if (q?.editId) title.value = '编辑房源'
  if (q?.clear === '1') title.value = '发布房源'
})

const isLast = computed(() => step.value >= 2)

function nextStep() {
  if (step.value < 2) step.value += 1
}

function prevStep() {
  if (step.value > 0) step.value -= 1
}

async function saveDraft() {
  await postAction('save-draft', { step: step.value })
  uni.showToast({ title: '草稿已保存（原型）', icon: 'none' })
}

async function submitFinal() {
  await postAction('submit-property', {})
  uni.showToast({ title: '已提交审核（原型）', icon: 'none' })
  uni.navigateBack()
}

function close() {
  showLeave.value = true
}

function leaveStay() {
  showLeave.value = false
}

function leaveGo() {
  showLeave.value = false
  uni.navigateBack()
}
</script>

<template>
  <view class="app-shell">
    <view class="screen active" style="display: flex; flex-direction: column; min-height: 100vh">
      <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
        <view class="top-bar__navrow">
          <view class="top-bar__nav-left">
            <button class="btn-ghost" @click="close">关闭</button>
          </view>
          <view class="top-bar__nav-mid">{{ title }}</view>
          <view class="top-bar__nav-right">
            <button class="btn-ghost" @click="saveDraft">存草稿</button>
          </view>
        </view>
      </view>
      <scroll-view scroll-y :show-scrollbar="false" :enable-flex="true" class="scroll" style="flex: 1; min-height: 0">
        <view class="steps">
          <view class="step-dot" :class="{ on: step >= 0 }" />
          <view class="step-dot" :class="{ on: step >= 1 }" />
          <view class="step-dot" :class="{ on: step >= 2 }" />
        </view>
        <text class="hint" style="display: block; margin-bottom: 28rpx; line-height: 1.55"
          >标 * 为必填 · 任意步骤可「存草稿」退出；最后一步再区分「保存草稿」与「提交审核 / 直接发布」。</text
        >

        <view v-show="step === 0" class="prop-step-panel active card">
          <view class="section-title">Step 1 · 分类 · 基础信息 · 媒体与现场照片</view>
          <view class="form-group">
            <text class="label">房源类型<text class="req">*</text></text>
            <view class="chip-row">
              <text class="chip on">标准厂房</text>
              <text class="chip">独门独院厂房</text>
              <text class="chip">仓库</text>
              <text class="chip">工业用地</text>
              <text class="chip">写字楼</text>
              <text class="chip">产业园商铺</text>
            </view>
            <text class="hint">支持多选；至少选择一项。</text>
          </view>
          <view class="section-title">1. 基础信息</view>
          <view class="form-group">
            <text class="label">公司名称<text class="req">*</text></text>
            <input placeholder="营业执照全称" />
          </view>
          <view class="form-group">
            <text class="label">详细地址<text class="req">*</text></text>
            <input placeholder="省市区街道门牌 / 园区楼栋" value="广东省广州市黄埔区科学城 XX 路 88 号" />
          </view>
          <view class="form-group">
            <text class="label">地图位置<text class="req">*</text></text>
            <button class="btn-primary" style="width: 100%; padding: 24rpx; font-size: 28rpx">地图选点 · 自动填入经纬度</button>
            <text class="hint" style="display: block; margin-top: 16rpx"
              >无需手写坐标：在地图上点选厂房大门或园区入口即可。正式版对接微信小程序 wx.chooseLocation。</text
            >
          </view>
          <view class="form-row-2">
            <view class="form-group">
              <text class="label">纬度 WGS84<text class="req">*</text></text>
              <input class="coords-readonly" disabled placeholder="请通过上方「地图选点」填入" />
            </view>
            <view class="form-group">
              <text class="label">经度 WGS84<text class="req">*</text></text>
              <input class="coords-readonly" disabled placeholder="请通过上方「地图选点」填入" />
            </view>
          </view>
          <view class="section-title">媒体与现场照片<text class="req">*</text></view>
          <view class="upload-grid">
            <view class="upload-tile"><text class="tile-title">上传图片</text>最多 20 张</view>
            <view class="upload-tile"><text class="tile-title">上传短视频</text>≤60s</view>
          </view>
        </view>

        <view v-show="step === 1" class="prop-step-panel active card">
          <view class="section-title">Step 2 · 验厂信息（2–5）</view>
          <view class="section-title">2. 土地与建筑规格</view>
          <view class="form-row-2">
            <view class="form-group">
              <text class="label">土地（亩）<text class="req">*</text></text>
              <input type="digit" placeholder="亩" />
            </view>
            <view class="form-group">
              <text class="label">建筑面积（㎡）</text>
              <input type="number" value="4200" />
            </view>
          </view>
          <view class="section-title">3. 电力与货运设施</view>
          <view class="form-row-2">
            <view class="form-group">
              <text class="label">电力总容量（kVA）<text class="req">*</text></text>
              <input type="number" value="800" />
            </view>
            <view class="form-group">
              <text class="label">货梯（台）</text>
              <input type="number" />
            </view>
          </view>
          <view class="section-title">4. 周边配套<text class="req">*</text></view>
          <view class="form-group">
            <text class="label">餐饮 / 便利店</text>
            <view class="chip-row">
              <text class="chip on">集中</text>
              <text class="chip">分散</text>
              <text class="chip">缺乏</text>
            </view>
          </view>
          <view class="section-title">5. 使用情况<text class="req">*</text></view>
          <view class="form-group">
            <text class="label">备注</text>
            <textarea placeholder="使用情况补充说明" />
          </view>
        </view>

        <view v-show="step === 2" class="prop-step-panel active card">
          <view class="section-title">Step 3 · 验厂信息（7–13）· 备注</view>
          <view class="section-title">7. 产权性质<text class="req">*</text></view>
          <view class="chip-row">
            <text class="chip on">国有土地</text>
            <text class="chip">出让</text>
            <text class="chip">划拨</text>
          </view>
          <view class="section-title">8. 交易条款<text class="req">*</text></view>
          <view class="form-group">
            <text class="label">厂房交易方式</text>
            <input placeholder="租售 / 股权转让等" />
          </view>
          <view class="section-title">内部跟进（小程序沿用）</view>
          <view class="form-row-2">
            <view class="form-group">
              <text class="label">联系人姓名<text class="req">*</text></text>
              <input value="李昭" />
            </view>
            <view class="form-group">
              <text class="label">联系人电话<text class="req">*</text></text>
              <input value="13800138001" />
            </view>
          </view>
        </view>

        <view v-if="!isLast" style="display: flex; gap: 20rpx; margin-top: 16rpx">
          <button class="btn-secondary" style="flex: 1" @click="prevStep">上一步</button>
          <button class="btn-primary" style="flex: 2" @click="nextStep">下一步</button>
        </view>
        <view v-else class="card" style="margin-top: 28rpx; padding: 28rpx 32rpx">
          <text class="hint" style="display: block; margin-bottom: 24rpx"
            >上架流程：<text style="font-weight: 700">草稿</text> → 提交后进入待审核队列，通过后对外可见</text
          >
          <view style="display: flex; gap: 20rpx; flex-wrap: wrap">
            <button class="btn-secondary" style="flex: 1; min-width: 240rpx" @click="saveDraft">保存草稿</button>
            <button class="btn-primary" style="flex: 2; min-width: 300rpx" @click="submitFinal">提交审核</button>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="showLeave" class="modal-overlay show" @click.self="leaveStay">
      <view class="modal-sheet" style="max-width: 720rpx; margin: 0 auto" @click.stop>
        <view style="font-weight: 700; margin-bottom: 16rpx">离开发布页？</view>
        <text class="hint" style="line-height: 1.55"
          >当前有未保存的修改（含已填坐标或已切换步骤）。离开将丢失本次编辑，建议先「存草稿」。</text
        >
        <view style="display: flex; gap: 20rpx; margin-top: 36rpx">
          <button class="btn-secondary" style="flex: 1" @click="leaveStay">留在此页</button>
          <button class="btn-primary" style="flex: 1" @click="leaveGo">仍要离开</button>
        </view>
      </view>
    </view>
  </view>
</template>
