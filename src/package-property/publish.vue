<template>
  <view class="page">
    <ic-top-bar>
      <template #left>
        <text class="ghost" @tap="onClose">关闭</text>
      </template>
      <template #center>
        <text class="center-title">{{ headerTitle }}</text>
      </template>
      <template #right>
        <text class="ghost" @tap="saveDraftHeader">存草稿</text>
      </template>
    </ic-top-bar>

    <scroll-view scroll-y class="scroll">
      <view class="steps">
        <view v-for="(d, i) in 3" :key="i" class="dot" :class="{ 'dot--on': i <= step }" />
      </view>

      <view v-if="modeHint" class="mode-hint">{{ modeHint }}</view>

      <text class="top-hint">
        标 * 为必填 · 任意步骤可「存草稿」退出；最后一步再区分「保存草稿」与「提交审核 / 直接发布」。
      </text>

      <ic-card v-show="step === 0">
        <text class="sec">Step 1 · 分类 · 基础信息 · 媒体与现场照片</text>
        <text class="lbl">房源类型<text class="req">*</text></text>
        <view class="chip-row">
          <ic-chip v-for="t in typeOptions" :key="t" :on="types.includes(t)" type="plain" @tap="toggle(types, t)">{{ t }}</ic-chip>
        </view>
        <text class="mini-hint">支持多选；至少选择一项。</text>

        <text class="sec small">1. 基础信息</text>
        <text class="lbl">公司名称<text class="req">*</text></text>
        <input v-model="form.company" class="inp" placeholder="营业执照全称" />

        <text class="lbl">详细地址<text class="req">*</text></text>
        <input v-model="form.address" class="inp" placeholder="省市区街道门牌 / 园区楼栋" />

        <text class="lbl">地图位置<text class="req">*</text></text>
        <button class="btn-primary" type="primary" @tap="openMap">地图选点 · 自动填入经纬度</button>
        <text class="mini-hint">无需手写坐标：在地图上点选厂房大门或园区入口即可。</text>

        <view class="two">
          <view class="col">
            <text class="lbl">纬度 WGS84<text class="req">*</text></text>
            <input v-model="form.lat" class="inp ro" disabled placeholder="请通过上方「地图选点」填入" />
          </view>
          <view class="col">
            <text class="lbl">经度 WGS84<text class="req">*</text></text>
            <input v-model="form.lng" class="inp ro" disabled placeholder="请通过上方「地图选点」填入" />
          </view>
        </view>

        <text class="lbl">地图显示名称</text>
        <input v-model="form.mapTitle" class="inp" placeholder="列表与地图气泡标题" />

        <text class="lbl">业主联系人</text>
        <input v-model="form.owner" class="inp" placeholder="姓名 / 职务" />

        <text class="sec small">媒体与现场照片<text class="req">*</text></text>
        <text class="lbl">必拍清单（多选）</text>
        <view class="chip-row">
          <ic-chip v-for="t in shotOptions" :key="t" :on="shots.includes(t)" type="plain" @tap="toggle(shots, t)">{{ t }}</ic-chip>
        </view>
        <view class="grid2">
          <view class="tile" @tap="toast('演示：打开相册/拍摄')"><text class="tb">上传图片</text><text class="td">最多 20 张</text></view>
          <view class="tile" @tap="toast('演示：上传短视频')"><text class="tb">上传短视频</text><text class="td">≤60s</text></view>
        </view>
      </ic-card>

      <ic-card v-show="step === 1">
        <text class="sec">Step 2 · 验厂信息（2–5）</text>
        <text class="sec small">2. 土地与建筑规格</text>
        <view class="two">
          <view class="col">
            <text class="lbl">土地（亩）<text class="req">*</text></text>
            <input v-model="form.landMu" class="inp" type="digit" placeholder="亩" />
          </view>
          <view class="col">
            <text class="lbl">实际土地（亩）</text>
            <input v-model="form.landMuAct" class="inp" type="digit" placeholder="亩" />
          </view>
        </view>
        <view class="two">
          <view class="col">
            <text class="lbl">建筑面积（㎡）</text>
            <input v-model="form.area" class="inp" type="number" placeholder="m²" />
          </view>
          <view class="col">
            <text class="lbl">承重（吨/m²）</text>
            <input v-model="form.load" class="inp" type="digit" placeholder="吨/m²" />
          </view>
        </view>
        <text class="lbl">车间长宽高（米）</text>
        <input v-model="form.lwh" class="inp" placeholder="例：80×40×9" />

        <text class="sec small">3. 电力与货运设施</text>
        <view class="two">
          <view class="col">
            <text class="lbl">电力总容量（kVA）<text class="req">*</text></text>
            <input v-model="form.kva" class="inp" type="number" placeholder="kVA" />
          </view>
          <view class="col">
            <text class="lbl">变压器（台）</text>
            <input v-model="form.trans" class="inp" type="number" placeholder="台" />
          </view>
        </view>

        <text class="sec small">4. 周边配套<text class="req">*</text></text>
        <text class="lbl">餐饮 / 便利店</text>
        <view class="chip-row">
          <ic-chip :on="food === '集中'" type="plain" @tap="food = '集中'">集中</ic-chip>
          <ic-chip :on="food === '分散'" type="plain" @tap="food = '分散'">分散</ic-chip>
          <ic-chip :on="food === '缺乏'" type="plain" @tap="food = '缺乏'">缺乏</ic-chip>
        </view>

        <text class="sec small">5. 使用情况<text class="req">*</text></text>
        <text class="lbl">备注</text>
        <textarea v-model="form.usageRemark" class="area" placeholder="使用情况补充说明" />
      </ic-card>

      <ic-card v-show="step === 2">
        <text class="sec">Step 3 · 验厂信息（7–13）· 备注</text>
        <text class="lbl">产权性质（多选）</text>
        <view class="chip-row">
          <ic-chip v-for="t in rightOpts" :key="t" :on="rights.includes(t)" type="plain" @tap="toggle(rights, t)">{{ t }}</ic-chip>
        </view>

        <text class="lbl">初始状态<text class="req">*</text></text>
        <picker :range="statusPick" @change="onPickStatus">
          <view class="inp picker">{{ statusPick[statusIndex] }}</view>
        </picker>

        <text class="lbl">租售类型<text class="req">*</text></text>
        <picker :range="leasePick" @change="onPickLease">
          <view class="inp picker">{{ leasePick[leaseIndex] }}</view>
        </picker>

        <text class="lbl">联系人姓名<text class="req">*</text></text>
        <input v-model="form.contactName" class="inp" />
        <text class="lbl">联系人电话<text class="req">*</text></text>
        <input v-model="form.contactPhone" class="inp" type="number" />

        <text class="lbl">看房预约备注</text>
        <textarea v-model="form.visitNote" class="area" />
        <text class="lbl">内部备注</text>
        <textarea v-model="form.internalNote" class="area" />
      </ic-card>

      <view v-show="step < 2" class="nav-row">
        <button class="btn2" @tap="prev">上一步</button>
        <button class="btn1" type="primary" @tap="next">下一步</button>
      </view>

      <ic-card v-show="step === 2" style="margin-top: 8rpx">
        <text class="mini-hint" style="margin-bottom: 16rpx">
          上架流程：<text class="b">{{ finalFlow }}</text>
        </text>
        <view class="nav-row">
          <button class="btn2" @tap="prev">上一步</button>
          <button class="btn2" @tap="saveDraftFinal">保存草稿</button>
          <button class="btn1" type="primary" @tap="submitFinal">{{ submitLabel }}</button>
        </view>
      </ic-card>
    </scroll-view>

    <view v-if="mapOpen" class="modal" @tap="closeMap">
      <view class="sheet" @tap.stop>
        <text class="sheet__h">选择房源位置</text>
        <text class="mini-hint">在下方区域点击选点（演示换算）。正式版可对接 wx.chooseLocation。</text>
        <view class="map-surf" @tap="onMapTap">
          <view v-if="pick.lat" class="mpin" :style="pinStyle" />
          <text v-if="!pick.lat" class="map-tip">点击地图选点</text>
        </view>
        <view class="readout">
          <text>纬度 <text class="strong">{{ pick.lat || '—' }}</text></text>
          <text>经度 <text class="strong">{{ pick.lng || '—' }}</text></text>
        </view>
        <view class="nav-row">
          <button class="btn2" @tap="closeMap">取消</button>
          <button class="btn1" type="primary" :disabled="!pick.lat" @tap="confirmMap">确认选用</button>
        </view>
      </view>
    </view>

    <view v-if="leaveOpen" class="modal modal--center" @tap="leaveOpen = false">
      <view class="sheet sheet--center" @tap.stop>
        <text class="sheet__h">离开发布页？</text>
        <text class="mini-hint">当前有未保存的修改（含已填坐标或已切换步骤）。离开将丢失本次编辑，建议先「存草稿」。</text>
        <view class="nav-row">
          <button class="btn2" @tap="leaveOpen = false">留在此页</button>
          <button class="btn1" type="primary" @tap="confirmLeave">仍要离开</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  PROPERTY_PUBLISH_DEFAULT_FOOD,
  PROPERTY_PUBLISH_DEFAULT_FORM,
  PROPERTY_PUBLISH_DEFAULT_RIGHTS,
  PROPERTY_PUBLISH_DEFAULT_SHOTS,
  PROPERTY_PUBLISH_DEFAULT_TYPES,
  PROPERTY_PUBLISH_LEASE_OPTIONS,
  PROPERTY_PUBLISH_RIGHT_OPTIONS,
  PROPERTY_PUBLISH_SHOT_OPTIONS,
  PROPERTY_PUBLISH_STATUS_OPTIONS,
  PROPERTY_PUBLISH_TYPE_OPTIONS,
  getProperty,
} from '@/mock/index.js'
import { getAuditPublishRequired } from '@/utils/storage.js'
import { showToast } from '@/utils/toast.js'

const step = ref(0)
const mapOpen = ref(false)
const leaveOpen = ref(false)
const mode = ref('new')
const editId = ref('')

const form = reactive({ ...PROPERTY_PUBLISH_DEFAULT_FORM })

const types = ref([...PROPERTY_PUBLISH_DEFAULT_TYPES])
const shots = ref([...PROPERTY_PUBLISH_DEFAULT_SHOTS])
const rights = ref([...PROPERTY_PUBLISH_DEFAULT_RIGHTS])

const typeOptions = PROPERTY_PUBLISH_TYPE_OPTIONS
const shotOptions = PROPERTY_PUBLISH_SHOT_OPTIONS
const rightOpts = PROPERTY_PUBLISH_RIGHT_OPTIONS

const food = ref(PROPERTY_PUBLISH_DEFAULT_FOOD)

const statusPick = PROPERTY_PUBLISH_STATUS_OPTIONS
const statusIndex = ref(0)
const leasePick = PROPERTY_PUBLISH_LEASE_OPTIONS
const leaseIndex = ref(0)

const pick = reactive({ lat: '', lng: '', rx: 0.52, ry: 0.48 })

const snap = ref('')

function toast(msg) {
  showToast(msg)
}

function toggle(arrRef, v) {
  const a = arrRef.value
  const i = a.indexOf(v)
  if (i >= 0) a.splice(i, 1)
  else a.push(v)
}

const headerTitle = computed(() => (mode.value === 'new' ? '发布房源' : '编辑房源'))

const modeHint = computed(() => {
  if (mode.value === 'published') {
    const p = getProperty(editId.value || 'P-8821')
    return `正在编辑 #${p.code} · 与列表/详情同源预填（演示）。`
  }
  if (mode.value === 'draft') {
    const p = getProperty(editId.value || 'P-DRAFT-001')
    return `正在编辑草稿 #${p.code}：可随时「存草稿」；坐标未填也可暂存。`
  }
  return ''
})

const auditOn = computed(() => getAuditPublishRequired())
const submitLabel = computed(() => (auditOn.value ? '提交审核' : '发布上架'))
const finalFlow = computed(() =>
  auditOn.value ? '提交后进入待审核队列，通过后对外可见' : '当前策略为「免审发布」，提交后同事立即可见',
)

const pinStyle = computed(() => ({
  left: pick.rx * 100 + '%',
  top: pick.ry * 100 + '%',
}))

function captureSnap() {
  snap.value = JSON.stringify({
    step: step.value,
    address: form.address,
    lat: form.lat,
    lng: form.lng,
    mapTitle: form.mapTitle,
  })
}

function isDirty() {
  return snap.value !== JSON.stringify({
    step: step.value,
    address: form.address,
    lat: form.lat,
    lng: form.lng,
    mapTitle: form.mapTitle,
  })
}

watch(
  () => [step.value, form.address, form.lat, form.lng, form.mapTitle],
  () => captureSnap(),
  { flush: 'post' },
)

onLoad((q) => {
  mode.value = (q && q.mode) || 'new'
  editId.value = (q && q.id) || ''
  const p = editId.value ? getProperty(editId.value) : null
  if (mode.value === 'published' && p) {
    form.address = p.addrInput
    form.lat = p.lat || ''
    form.lng = p.lng || ''
    form.mapTitle = p.mapTitle
  } else if (mode.value === 'draft' && p) {
    form.address = p.addrInput
    form.lat = p.lat || ''
    form.lng = p.lng || ''
    form.mapTitle = p.mapTitle
  } else {
    form.address = PROPERTY_PUBLISH_DEFAULT_FORM.address
    form.lat = PROPERTY_PUBLISH_DEFAULT_FORM.lat
    form.lng = PROPERTY_PUBLISH_DEFAULT_FORM.lng
    form.mapTitle = PROPERTY_PUBLISH_DEFAULT_FORM.mapTitle
  }
  step.value = 0
  setTimeout(captureSnap, 0)
})

function ratioToCoords(rx, ry) {
  const minLng = 113.38
  const maxLng = 113.48
  const minLat = 23.13
  const maxLat = 23.24
  const lng = minLng + rx * (maxLng - minLng)
  const lat = maxLat - ry * (maxLat - minLat)
  return { lat: lat.toFixed(6), lng: lng.toFixed(6) }
}

function openMap() {
  mapOpen.value = true
  applyPick(pick.rx, pick.ry)
}

function closeMap() {
  mapOpen.value = false
}

function onMapTap(e) {
  const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0])
  const d = e.detail || {}
  const x = t ? t.pageX : typeof d.x === 'number' ? d.x : 0
  const y = t ? t.pageY : typeof d.y === 'number' ? d.y : 0
  if (!x && !y) return
  const inst = getCurrentInstance && getCurrentInstance()
  uni
    .createSelectorQuery()
    .in(inst?.proxy)
    .select('.map-surf')
    .boundingClientRect((rect) => {
      if (!rect || !rect.width) return
      const rx = Math.max(0, Math.min(1, (x - rect.left) / rect.width))
      const ry = Math.max(0, Math.min(1, (y - rect.top) / rect.height))
      applyPick(rx, ry)
    })
    .exec()
}

function applyPick(rx, ry) {
  pick.rx = rx
  pick.ry = ry
  const c = ratioToCoords(rx, ry)
  pick.lat = c.lat
  pick.lng = c.lng
}

function confirmMap() {
  form.lat = pick.lat
  form.lng = pick.lng
  mapOpen.value = false
  toast('已根据选点填入经纬度（演示）')
  captureSnap()
}

function next() {
  if (step.value === 0) {
    if (!String(form.lat).trim() || !String(form.lng).trim()) {
      toast('请先通过「地图选点」填写经纬度')
      return
    }
  }
  if (step.value < 2) step.value += 1
}

function prev() {
  step.value = Math.max(0, step.value - 1)
}

function onPickStatus(e) {
  statusIndex.value = Number(e.detail.value)
}
function onPickLease(e) {
  leaseIndex.value = Number(e.detail.value)
}

function saveDraftHeader() {
  toast('草稿已保存（未校验坐标）· 可在房源列表「草稿」继续编辑')
  uni.switchTab({ url: '/pages/property/index' })
}

function saveDraftFinal() {
  toast('草稿已保存 · 未校验坐标；可随时返回继续完善')
  captureSnap()
}

function submitFinal() {
  if (!String(form.lat).trim() || !String(form.lng).trim()) {
    toast('请先通过「地图选点」填写经纬度')
    step.value = 0
    return
  }
  toast(submitLabel.value + '（演示）')
  uni.switchTab({ url: '/pages/property/index' })
}

function onClose() {
  if (isDirty()) leaveOpen.value = true
  else uni.navigateBack({ delta: 1 })
}

function confirmLeave() {
  leaveOpen.value = false
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.page {
  min-height: 100vh;
  background: $ic-bg-deep;
}
.scroll {
  height: calc(100vh - 120rpx);
  padding: 24rpx 28rpx 40rpx;
}
.ghost {
  color: $ic-mint;
  font-size: 28rpx;
  font-weight: 600;
}
.center-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
}
.steps {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.dot {
  flex: 1;
  height: 8rpx;
  border-radius: 999rpx;
  background: #e2e8f0;
}
.dot--on {
  background: linear-gradient(90deg, $ic-mint, #38bdf8);
}
.mode-hint {
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(14, 165, 233, 0.08);
  border: 1rpx solid rgba(14, 165, 233, 0.22);
  color: $ic-text;
  font-size: 24rpx;
  line-height: 1.45;
  margin-bottom: 16rpx;
}
.top-hint {
  display: block;
  margin-bottom: 18rpx;
  font-size: 24rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.sec {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $ic-mint;
  letter-spacing: 0.08em;
}
.sec.small {
  margin-top: 18rpx;
}
.lbl {
  display: block;
  margin: 12rpx 0 10rpx;
  font-size: 24rpx;
  color: $ic-muted;
}
.req {
  color: $ic-rose;
  margin-left: 4rpx;
}
.inp {
  width: 100%;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.inp.ro {
  background: #f1f5f9;
}
.picker {
  line-height: 1.2;
}
.area {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 28rpx;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
}
.mini-hint {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $ic-muted;
  line-height: 1.45;
}
.b {
  font-weight: 700;
  color: $ic-text;
}
.two {
  display: flex;
  gap: 20rpx;
}
.col {
  flex: 1;
  min-width: 0;
}
.btn-primary {
  width: 100%;
  margin: 10rpx 0 8rpx;
  border-radius: 24rpx;
  color: #fff;
  border: none;
  @include ic-gradient-primary;
  font-weight: 700;
  padding: 22rpx 12rpx;
}
.grid2 {
  display: flex;
  gap: 20rpx;
  margin-top: 12rpx;
}
.tile {
  flex: 1;
  border: 1rpx dashed rgba(13, 148, 136, 0.35);
  border-radius: 24rpx;
  padding: 26rpx 16rpx;
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
  font-size: 22rpx;
  color: $ic-muted;
}

.nav-row {
  display: flex;
  gap: 16rpx;
  margin-top: 12rpx;
}
.btn1 {
  flex: 2;
  border-radius: 24rpx;
  color: #fff;
  border: none;
  @include ic-gradient-primary;
  font-weight: 700;
}
.btn2 {
  flex: 1;
  border-radius: 24rpx;
  background: $ic-surface2;
  border: 1rpx solid $ic-border;
  font-weight: 600;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 32rpx;
}
.modal--center {
  align-items: center;
}
.sheet {
  width: 100%;
  max-width: 860rpx;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 40rpx 40rpx 0 0;
  padding: 28rpx;
  border: 1rpx solid $ic-border;
}
.sheet--center {
  border-radius: 40rpx;
  margin: 0 24rpx;
}
.sheet__h {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}
.map-surf {
  position: relative;
  height: 440rpx;
  border-radius: 28rpx;
  border: 1rpx solid $ic-border;
  margin-top: 16rpx;
  background: linear-gradient(180deg, rgba(186, 230, 253, 0.55), rgba(204, 251, 241, 0.35)),
    repeating-linear-gradient(90deg, transparent, transparent 62rpx, rgba(15, 23, 42, 0.04) 62rpx, rgba(15, 23, 42, 0.04) 64rpx),
    repeating-linear-gradient(0deg, transparent, transparent 62rpx, rgba(15, 23, 42, 0.04) 62rpx, rgba(15, 23, 42, 0.04) 64rpx);
}
.map-tip {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid $ic-border;
  color: $ic-muted;
  font-size: 24rpx;
  font-weight: 600;
}
.mpin {
  position: absolute;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50% 50% 50% 0;
  transform: translate(-50%, -100%) rotate(-45deg);
  background: linear-gradient(135deg, #f43f5e, #fb7185);
}
.readout {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid $ic-border;
  background: $ic-surface2;
  font-size: 26rpx;
  color: $ic-muted;
}
.strong {
  color: $ic-text;
  font-weight: 700;
}
</style>
