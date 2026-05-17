<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'
import { fetchPropertyEditForm } from '@/api/property'
import { postAction } from '@/api/message'
import {
  applyPropertyApiForm,
  buildPropertySubmitPayload,
  emptyPropertyForm,
  fetchCodeMasterLabels,
  fetchRegionDefs,
  joinMediaLines,
  onVideoComponentError,
  parseMediaLines,
  previewNetworkVideo,
  resolveMediaUrl,
  uploadOssFile,
} from '@/utils/request'
import type { PropertyEditForm } from '@/types/property'

/** Inlined for WeChat MP — separate modules are dropped by dependency analysis. */
const PHOTO_OPTIONS = ['门口形象照', '路口进出照', '车间照片', '货梯', '厂房屋顶'] as const
const STRUCTURE_OPTIONS = ['钢构', '框架', '其他'] as const
const RIGHTS_OPTIONS = ['国有土地', '出让', '划拨', '集体土地', '其他'] as const
const LAND_USE_OPTIONS = ['工业', '仓储', '其他'] as const
const CERT_OPTIONS = ['房产证', '土地证', '消防验收证', '环保批文'] as const
const FIRE_OPTIONS = ['喷淋', '烟感', '消防栓', '其他'] as const
const DINING_OPTIONS = ['集中', '分散', '缺乏'] as const
const YES_NO = ['无', '有'] as const
const FIRE_PASS = ['是', '否'] as const
const DISCHARGE = ['有', '无'] as const
const SOLAR = ['可接入', '不可接入'] as const
const RENT_SALE = ['出租', '出售', '租售皆可'] as const
const MONITOR = ['全厂区', '部分区域'] as const
const RUSH_HOUR = ['无', '轻度', '严重'] as const
const FALLBACK_PROPERTY_TYPES = ['标准厂房', '独门独院厂房', '仓库', '工业用地', '写字楼', '产业园商铺']

function toggleFormArr(arr: string[], v: string, min = 0) {
  const i = arr.indexOf(v)
  if (i >= 0) {
    if (arr.length > min) arr.splice(i, 1)
  } else {
    arr.push(v)
  }
}

function pickerIdx(range: readonly string[], val: string) {
  const i = range.indexOf(val)
  return i >= 0 ? i : 0
}

const topBarInsetStyle = useTopBarInsetStyle()
const step = ref(0)
const title = ref('发布房源')
const showLeave = ref(false)
const saving = ref(false)
const uploading = ref(false)

const form = reactive<PropertyEditForm>(emptyPropertyForm())
const propertyTypes = ref<string[]>([...FALLBACK_PROPERTY_TYPES])
const regionNames = ref<string[]>([])

async function loadMeta() {
  try {
    const [regions, types] = await Promise.all([
      fetchRegionDefs(),
      fetchCodeMasterLabels('property_type').catch(() => ({ list: [] as string[] })),
    ])
    regionNames.value = (regions.list ?? [])
      .map((r) => String((r as { name?: string; label?: string }).name || (r as { label?: string }).label || ''))
      .filter(Boolean)
    if (types.list?.length) propertyTypes.value = types.list
  } catch {
    /* keep fallbacks */
  }
}

const structureOtherOff = computed(() => !form.structureTypes?.includes('其他'))
const rightsOtherOff = computed(() => !form.propertyRights?.includes('其他'))
const landUseOtherOff = computed(() => !form.landUse?.includes('其他'))
const fireOtherOff = computed(() => !form.fireSystems?.includes('其他'))
const subsidyDetailOff = computed(() => form.subsidy !== '有')
const mortgageNoteOff = computed(() => form.mortgageDispute === '无')
const fireFailOff = computed(() => form.firePass !== '否')
const showRentFields = computed(() => form.rentSaleType === '出租' || form.rentSaleType === '租售皆可')

function toggleTypes(t: string) {
  if (!Array.isArray(form.types)) form.types = []
  toggleFormArr(form.types, t, 1)
}
function togglePhoto(p: string) {
  if (!Array.isArray(form.photoChecklist)) form.photoChecklist = []
  toggleFormArr(form.photoChecklist, p, 0)
}
function toggleStructure(s: string) {
  if (!Array.isArray(form.structureTypes)) form.structureTypes = []
  toggleFormArr(form.structureTypes, s, 0)
}
function toggleRights(r: string) {
  if (!Array.isArray(form.propertyRights)) form.propertyRights = []
  toggleFormArr(form.propertyRights, r, 0)
}
function toggleLandUse(u: string) {
  if (!Array.isArray(form.landUse)) form.landUse = []
  toggleFormArr(form.landUse, u, 0)
}
function toggleCert(c: string) {
  if (!Array.isArray(form.certificates)) form.certificates = []
  toggleFormArr(form.certificates, c, 0)
}
function toggleFire(f: string) {
  if (!Array.isArray(form.fireSystems)) form.fireSystems = []
  toggleFormArr(form.fireSystems, f, 0)
}

const stepNames = ['基础分类', '地图定位', '图片视频', '土地建筑', '电力配套', '产权合规', '政策亮点', '挂牌联系']

const editorImages = computed(() => parseMediaLines(form.mediaImageUrls).map((u) => resolveMediaUrl(u)))
const editorVideos = computed(() => parseMediaLines(form.mediaVideoUrls).map((u) => resolveMediaUrl(u)))

function parseCoord(v: unknown) {
  const n = Number.parseFloat(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

const hasMapCoords = computed(() => {
  const lat = parseCoord(form.lat)
  const lng = parseCoord(form.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
})

const mapLatitude = computed(() => (hasMapCoords.value ? parseCoord(form.lat) : 23.129112))
const mapLongitude = computed(() => (hasMapCoords.value ? parseCoord(form.lng) : 113.264385))

const mapMarkers = computed(() => {
  if (!hasMapCoords.value) return []
  return [
    {
      id: 1,
      latitude: parseCoord(form.lat),
      longitude: parseCoord(form.lng),
      width: 28,
      height: 36,
    },
  ]
})

function guessDistrictFromAddress(address: string) {
  const text = String(address || '').trim()
  if (!text) return ''
  const hit = regionNames.value.find((name) => name && text.includes(name))
  return hit || ''
}

function applyLocationPick(res: UniApp.ChooseLocationSuccess) {
  const parts = [res.address, res.name].map((s) => String(s || '').trim()).filter(Boolean)
  const addr = parts.join(' ').trim()
  if (addr) form.address = addr
  form.lat = String(res.latitude)
  form.lng = String(res.longitude)
  const guessed = guessDistrictFromAddress(addr || form.address || '')
  if (guessed) form.district = guessed
}

function removeEditorImage(i: number) {
  const lines = parseMediaLines(form.mediaImageUrls)
  lines.splice(i, 1)
  form.mediaImageUrls = joinMediaLines(lines)
}

function removeEditorVideo(i: number) {
  const lines = parseMediaLines(form.mediaVideoUrls)
  lines.splice(i, 1)
  form.mediaVideoUrls = joinMediaLines(lines)
}

function previewEditorImage(i: number) {
  const urls = editorImages.value
  if (!urls.length) return
  uni.previewImage({ urls, current: urls[i] })
}

type PickerChange = { detail: { value: string | number } }

function pickFromRange(range: readonly string[], e: PickerChange, set: (v: string) => void) {
  const i = Number(e.detail.value)
  if (range[i] != null) set(range[i])
}

function pickDistrict(e: PickerChange) {
  pickFromRange(regionNames.value, e, (v) => {
    form.district = v
  })
}

function onPickDining(e: PickerChange) {
  pickFromRange(DINING_OPTIONS, e, (v) => {
    form.dining = v
  })
}
function onPickMortgage(e: PickerChange) {
  pickFromRange(YES_NO, e, (v) => {
    form.mortgageDispute = v
  })
}
function onPickFirePass(e: PickerChange) {
  pickFromRange(FIRE_PASS, e, (v) => {
    form.firePass = v
  })
}
function onPickSubsidy(e: PickerChange) {
  pickFromRange(YES_NO, e, (v) => {
    form.subsidy = v
  })
}
function onPickDischarge(e: PickerChange) {
  pickFromRange(DISCHARGE, e, (v) => {
    form.dischargePermit = v
  })
}
function onPickSolar(e: PickerChange) {
  pickFromRange(SOLAR, e, (v) => {
    form.solar = v
  })
}
function onPickRentSale(e: PickerChange) {
  pickFromRange(RENT_SALE, e, (v) => {
    form.rentSaleType = v
  })
}
function onPickMonitor(e: PickerChange) {
  pickFromRange(MONITOR, e, (v) => {
    form.monitorCoverage = v
  })
}
function onPickRushHour(e: PickerChange) {
  pickFromRange(RUSH_HOUR, e, (v) => {
    form.rushHour = v
  })
}

function chooseMap() {
  const lat = parseCoord(form.lat)
  const lng = parseCoord(form.lng)
  const opts: UniApp.ChooseLocationOptions = {
    success(res) {
      applyLocationPick(res)
    },
    fail(err) {
      const msg = String((err as { errMsg?: string })?.errMsg || '')
      if (msg.includes('cancel')) return
      uni.showToast({ title: '未选择位置', icon: 'none' })
    },
  }
  if (hasMapCoords.value) {
    opts.latitude = lat
    opts.longitude = lng
  }
  uni.chooseLocation(opts)
}

function onMapTap(e: { detail: { latitude: number; longitude: number } }) {
  const lat = e?.detail?.latitude
  const lng = e?.detail?.longitude
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
  form.lat = String(lat)
  form.lng = String(lng)
}

function uploadFolder() {
  return `miniapp/properties/${form.code || 'draft'}`
}

function appendUrl(field: 'mediaImageUrls' | 'mediaVideoUrls', url: string) {
  const cur = field === 'mediaImageUrls' ? form.mediaImageUrls : form.mediaVideoUrls
  const lines = parseMediaLines(cur)
  lines.push(url)
  if (field === 'mediaImageUrls') form.mediaImageUrls = joinMediaLines(lines)
  else form.mediaVideoUrls = joinMediaLines(lines)
}

async function pickImages() {
  uni.chooseMedia({
    count: 9,
    mediaType: ['image'],
    success: async (res) => {
      uploading.value = true
      try {
        for (const f of res.tempFiles) {
          const { url } = await uploadOssFile(f.tempFilePath, uploadFolder())
          appendUrl('mediaImageUrls', url)
        }
        uni.showToast({ title: '图片已上传', icon: 'none' })
      } catch (e) {
        uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
      } finally {
        uploading.value = false
      }
    },
  })
}

async function pickVideos() {
  uni.chooseMedia({
    count: 1,
    mediaType: ['video'],
    success: async (res) => {
      uploading.value = true
      try {
        for (const f of res.tempFiles) {
          const { url } = await uploadOssFile(f.tempFilePath, uploadFolder())
          appendUrl('mediaVideoUrls', url)
        }
        uni.showToast({ title: '视频已上传', icon: 'none' })
      } catch (e) {
        uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
      } finally {
        uploading.value = false
      }
    },
  })
}

onLoad(async (q) => {
  await loadMeta()
  if (q?.editId) {
    title.value = '编辑房源'
    try {
      const api = await fetchPropertyEditForm(String(q.editId))
      applyPropertyApiForm(form, api)
    } catch {
      uni.showToast({ title: '加载房源失败', icon: 'none' })
    }
  }
  if (q?.clear === '1') {
    title.value = '发布房源'
    applyPropertyApiForm(form, emptyPropertyForm())
  }
})

const isLast = computed(() => step.value >= stepNames.length - 1)

function nextStep() {
  if (step.value < stepNames.length - 1) step.value += 1
}

function prevStep() {
  if (step.value > 0) step.value -= 1
}

async function saveDraft() {
  if (!String(form.companyName || '').trim() || !String(form.address || '').trim()) {
    uni.showToast({ title: '请填写公司与地址', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const payload = buildPropertySubmitPayload(form)
    const r = await postAction<{ ok: boolean; code?: string }>('save-draft', payload)
    if (r?.code) form.code = r.code
    uni.showToast({ title: '草稿已保存', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

async function submitFinal() {
  if (!String(form.companyName || '').trim() || !String(form.address || '').trim()) {
    uni.showToast({ title: '请填写公司与地址', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const payload = buildPropertySubmitPayload(form)
    if (!form.code) {
      const draft = await postAction<{ ok: boolean; code?: string }>('save-draft', payload)
      if (draft?.code) form.code = draft.code
    }
    await postAction('submit-property', { ...payload, code: form.code } as Record<string, unknown>)
    uni.showToast({ title: '已提交审核', icon: 'none' })
    uni.navigateBack()
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '提交失败', icon: 'none' })
  } finally {
    saving.value = false
  }
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
    <view class="page-frame screen active screen--sub">
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

      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="page-scroll__inner">
          <view class="pf-page-head">
            <text class="wizard-head__title">{{ stepNames[step] }}</text>
            <text class="wizard-head__sub">第 {{ step + 1 }} / {{ stepNames.length }} 步 · 与后台验厂表字段一致</text>
            <view class="pf-progress">
              <view v-for="(_, i) in stepNames" :key="i" class="pf-progress__seg" :class="{ on: step >= i }" />
            </view>
            <view class="pf-step-tabs">
              <text
                v-for="(name, i) in stepNames"
                :key="name"
                class="pf-step-tab"
                :class="{ on: step === i }"
                @click="step = i"
                >{{ name }}</text
              >
            </view>
          </view>

          <!-- Step 0 -->
          <view v-show="step === 0" class="pf-card">
            <view class="pf-section-h">分类 · 主体</view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">房源类型<text class="req">*</text></text>
              <view class="pf-chip-grid">
                <text
                  v-for="t in propertyTypes"
                  :key="t"
                  class="pf-chip"
                  :class="{ on: form.types?.includes(t) }"
                  @click="toggleTypes(t)"
                  >{{ t }}</text
                >
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">挂牌标题</text>
              <input v-model="form.listTitle" class="pf-input" placeholder="对外展示标题" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">公司名称<text class="req">*</text></text>
              <input v-model="form.companyName" class="pf-input" placeholder="营业执照全称" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">业主联系人</text>
              <input v-model="form.ownerContact" class="pf-input" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">风险标签</text>
              <input v-model="form.riskTag" class="pf-input" placeholder="如：资料待核、无" />
            </view>
          </view>

          <!-- Step 1: region · address · map (linked) -->
          <view v-show="step === 1" class="pf-card">
            <view class="pf-section-h">位置 · 地图（GCJ-02）</view>
            <picker
              v-if="regionNames.length"
              mode="selector"
              :range="regionNames"
              :value="pickerIdx(regionNames, form.district || '')"
              @change="pickDistrict"
            >
              <view class="pf-cell">
                <text class="pf-cell__label">所属区域<text class="req">*</text></text>
                <view class="pf-select">
                  <text class="pf-select__value" :class="{ placeholder: !form.district }">{{ form.district || '请选择区县' }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view v-else class="pf-cell pf-cell--col">
              <text class="pf-cell__label">所属区域<text class="req">*</text></text>
              <input v-model="form.district" class="pf-input" placeholder="如：黄埔区" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">详细地址<text class="req">*</text></text>
              <input v-model="form.address" class="pf-input" placeholder="选点后自动回填，也可手填" />
            </view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-map-btn" @tap="chooseMap">{{ hasMapCoords ? '重新选点 / 调整位置' : '微信地图选点' }}</view>
              <text class="hint">选点后将同步详细地址与经纬度；编辑时会打开已保存的位置</text>
            </view>
            <view class="pf-map-preview-wrap">
              <map
                class="pf-map-preview"
                :latitude="mapLatitude"
                :longitude="mapLongitude"
                :scale="16"
                :markers="mapMarkers"
                show-location
                enable-scroll
                enable-zoom
                @tap="onMapTap"
              />
              <view v-if="!hasMapCoords" class="pf-map-preview__empty">
                <text>请先地图选点，或填写下方经纬度</text>
              </view>
            </view>
            <view class="pf-field-grid" style="padding: 0 28rpx 20rpx">
              <view class="pf-field">
                <text class="pf-field__label">纬度<text class="req">*</text></text>
                <input v-model="form.lat" class="pf-input" type="digit" placeholder="23.xxx" />
              </view>
              <view class="pf-field">
                <text class="pf-field__label">经度<text class="req">*</text></text>
                <input v-model="form.lng" class="pf-input" type="digit" placeholder="113.xxx" />
              </view>
            </view>
            <view v-if="hasMapCoords" class="pf-cell pf-cell--col">
              <text class="hint">当前坐标：{{ form.lat }}, {{ form.lng }}</text>
            </view>
          </view>

          <!-- Step 2: images & video (aligned with admin tabs 2–3) -->
          <view v-show="step === 2" class="pf-card pf-card--media">
            <view class="pf-section-h">现场必拍清单</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-chip-grid">
                <text
                  v-for="p in PHOTO_OPTIONS"
                  :key="p"
                  class="pf-chip"
                  :class="{ on: form.photoChecklist?.includes(p) }"
                  @click="togglePhoto(p)"
                  >{{ p }}</text
                >
              </view>
            </view>
            <view class="pf-section-h">图片上传</view>
            <view class="prop-media-editor">
              <view v-if="editorImages.length" class="prop-media-editor__grid">
                <view v-for="(url, i) in editorImages" :key="'img' + i" class="prop-media-editor__cell">
                  <image class="prop-media-editor__img" :src="url" mode="aspectFill" @click="previewEditorImage(i)" />
                  <text class="prop-media-editor__del" @tap.stop="removeEditorImage(i)">×</text>
                </view>
              </view>
              <view class="upload-grid">
                <view class="upload-tile" @click="pickImages">
                  <text class="tile-title">上传图片</text>
                  <text class="hint">已 {{ editorImages.length }} 张</text>
                </view>
              </view>
            </view>
            <view class="pf-section-h">视频上传</view>
            <view class="prop-media-editor">
              <view v-if="editorVideos.length" class="prop-media-editor__hero-wrap">
                <video
                  class="prop-media-editor__hero-video"
                  :src="editorVideos[0]"
                  controls
                  show-center-play-btn
                  object-fit="cover"
                  @error="onVideoComponentError"
                />
                <view class="prop-media-editor__hero-actions">
                  <text class="prop-media-editor__link" @tap="previewNetworkVideo(editorVideos[0])">全屏播放</text>
                </view>
              </view>
              <view class="upload-grid">
                <view class="upload-tile" @click="pickVideos">
                  <text class="tile-title">上传视频</text>
                  <text class="hint">已 {{ editorVideos.length }} 个</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Step 3: land & building -->
          <view v-show="step === 3" class="pf-card">
            <view class="pf-section-h">土地 · 建筑规格</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">土地（亩）<text class="req">*</text></text>
                  <input v-model="form.landMu" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">实际土地（亩）</text>
                  <input v-model="form.actualLandMu" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">建筑面积（㎡）</text>
                  <input v-model="form.buildingArea" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">使用面积（㎡）</text>
                  <input v-model="form.actualUseArea" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">总层数</text>
                  <input v-model="form.floors" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">承重（吨/m²）</text>
                  <input v-model="form.loadPerSqm" class="pf-input" type="digit" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">车间长宽高（米）</text>
                  <input v-model="form.workshopSize" class="pf-input" placeholder="长×宽×高" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">承重注明区域</text>
                  <input v-model="form.loadNote" class="pf-input" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">结构类型</text>
              <view class="pf-chip-grid">
                <text
                  v-for="s in STRUCTURE_OPTIONS"
                  :key="s"
                  class="pf-chip"
                  :class="{ on: form.structureTypes?.includes(s) }"
                  @click="toggleStructure(s)"
                  >{{ s }}</text
                >
              </view>
              <input
                v-model="form.structureOther"
                class="pf-input"
                :class="{ 'pf-input--disabled': structureOtherOff }"
                :disabled="structureOtherOff"
                placeholder="选「其他」时填写"
              />
            </view>
          </view>

          <!-- Step 4: power & usage -->
          <view v-show="step === 4" class="pf-card">
            <view class="pf-section-h">电力 · 货梯 · 货运</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">电力总容量（kVA）<text class="req">*</text></text>
                  <input v-model="form.powerKva" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">变压器（台）</text>
                  <input v-model="form.transformers" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">货梯（台）</text>
                  <input v-model="form.freightLifts" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">货梯载重（吨）</text>
                  <input v-model="form.liftLoadT" class="pf-input" type="digit" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">货梯尺寸（米）</text>
                  <input v-model="form.liftDims" class="pf-input" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">装卸平台高度（cm）</text>
                  <input v-model="form.platformHeightCm" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">转弯半径（米）</text>
                  <input v-model="form.turnRadiusM" class="pf-input" type="digit" />
                </view>
              </view>
            </view>
            <view class="pf-section-h">周边配套</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">宿舍租金（元/房）</text>
                  <input v-model="form.dormRent" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">宿舍距离（km）</text>
                  <input v-model="form.dormDistanceKm" class="pf-input" type="digit" />
                </view>
              </view>
            </view>
            <picker mode="selector" :range="DINING_OPTIONS" :value="pickerIdx(DINING_OPTIONS, form.dining || '')" @change="onPickDining">
              <view class="pf-cell">
                <text class="pf-cell__label">餐饮 / 便利店</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.dining || '请选择' }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">公交 / 地铁站点</text>
                  <input v-model="form.transitStation" class="pf-input" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">站点距离（米）</text>
                  <input v-model="form.stationDistanceM" class="pf-input" type="number" />
                </view>
              </view>
            </view>
            <view class="pf-section-h">使用情况</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">自用（㎡）</text>
                  <input v-model="form.selfUseSqm" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">租金估算（元/年）</text>
                  <input v-model="form.rentEstimateYear" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">共租（家）</text>
                  <input v-model="form.coTenantCount" class="pf-input" type="number" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">年租金（元/年）</text>
                  <input v-model="form.annualRent" class="pf-input" type="number" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">租客公司</text>
                  <input v-model="form.tenantCompanies" class="pf-input" placeholder="多家用顿号分隔" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">合同剩余（年）</text>
                  <input v-model="form.contractYearsLeft" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">腾空周期（月）</text>
                  <input v-model="form.vacantMonths" class="pf-input" type="number" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">使用情况备注</text>
              <textarea v-model="form.usageRemark" class="pf-textarea" />
            </view>
          </view>

          <!-- Step 5: rights & compliance -->
          <view v-show="step === 5" class="pf-card">
            <view class="pf-section-h">产权 · 证件</view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">产权性质</text>
              <view class="pf-chip-grid">
                <text
                  v-for="r in RIGHTS_OPTIONS"
                  :key="r"
                  class="pf-chip"
                  :class="{ on: form.propertyRights?.includes(r) }"
                  @click="toggleRights(r)"
                  >{{ r }}</text
                >
              </view>
              <input
                v-model="form.propertyRightsOther"
                class="pf-input"
                :class="{ 'pf-input--disabled': rightsOtherOff }"
                :disabled="rightsOtherOff"
                placeholder="产权 · 其他说明"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">土地用途</text>
              <view class="pf-chip-grid">
                <text
                  v-for="u in LAND_USE_OPTIONS"
                  :key="u"
                  class="pf-chip"
                  :class="{ on: form.landUse?.includes(u) }"
                  @click="toggleLandUse(u)"
                  >{{ u }}</text
                >
              </view>
              <input
                v-model="form.landUseOther"
                class="pf-input"
                :class="{ 'pf-input--disabled': landUseOtherOff }"
                :disabled="landUseOtherOff"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">证件齐全</text>
              <view class="pf-chip-grid">
                <text
                  v-for="c in CERT_OPTIONS"
                  :key="c"
                  class="pf-chip"
                  :class="{ on: form.certificates?.includes(c) }"
                  @click="toggleCert(c)"
                  >{{ c }}</text
                >
              </view>
            </view>
            <picker mode="selector" :range="YES_NO" :value="pickerIdx(YES_NO, form.mortgageDispute || '无')" @change="onPickMortgage">
              <view class="pf-cell">
                <text class="pf-cell__label">抵押 / 纠纷</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.mortgageDispute }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">抵押 / 纠纷说明</text>
              <textarea
                v-model="form.mortgageNote"
                class="pf-textarea"
                :class="{ 'pf-input--disabled': mortgageNoteOff }"
                :disabled="mortgageNoteOff"
              />
            </view>
            <view class="pf-section-h">交易 · 行业限制</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">房东心理价位（万）</text>
                  <input v-model="form.landlordPriceWan" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">交易方式</text>
                  <input v-model="form.tradeMode" class="pf-input" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">交易税费说明</text>
                  <input v-model="form.taxFeeNote" class="pf-input" placeholder="金额或区间" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">允许产业类型</text>
                  <input v-model="form.allowedIndustries" class="pf-input" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">特殊限制</text>
              <textarea v-model="form.specialLimits" class="pf-textarea" />
            </view>
            <view class="pf-section-h">消防 · 物流</view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">消防系统</text>
              <view class="pf-chip-grid">
                <text
                  v-for="f in FIRE_OPTIONS"
                  :key="f"
                  class="pf-chip"
                  :class="{ on: form.fireSystems?.includes(f) }"
                  @click="toggleFire(f)"
                  >{{ f }}</text
                >
              </view>
              <input
                v-model="form.fireOther"
                class="pf-input"
                :class="{ 'pf-input--disabled': fireOtherOff }"
                :disabled="fireOtherOff"
              />
            </view>
            <picker mode="selector" :range="FIRE_PASS" :value="pickerIdx(FIRE_PASS, form.firePass || '是')" @change="onPickFirePass">
              <view class="pf-cell">
                <text class="pf-cell__label">消防验收</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.firePass }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <picker mode="selector" :range="MONITOR" :value="pickerIdx(MONITOR, String(form.monitorCoverage || '全厂区'))" @change="onPickMonitor">
              <view class="pf-cell">
                <text class="pf-cell__label">监控覆盖</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.monitorCoverage }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">未通过原因</text>
              <input
                v-model="form.fireFailReason"
                class="pf-input"
                :class="{ 'pf-input--disabled': fireFailOff }"
                :disabled="fireFailOff"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">最近高速口（km）</text>
                  <input v-model="form.highwayKm" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">港口/机场（km）</text>
                  <input v-model="form.portAirportKm" class="pf-input" type="digit" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">道路限高/限重</text>
                  <input v-model="form.roadLimits" class="pf-input" />
                </view>
              </view>
            </view>
            <picker mode="selector" :range="RUSH_HOUR" :value="pickerIdx(RUSH_HOUR, String(form.rushHour || '无'))" @change="onPickRushHour">
              <view class="pf-cell">
                <text class="pf-cell__label">高峰期拥堵</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.rushHour }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
          </view>

          <!-- Step 6: policy & highlights -->
          <view v-show="step === 6" class="pf-card">
            <view class="pf-section-h">政策 · 环保 · 能源</view>
            <picker mode="selector" :range="YES_NO" :value="pickerIdx(YES_NO, form.subsidy || '无')" @change="onPickSubsidy">
              <view class="pf-cell">
                <text class="pf-cell__label">产业补贴</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.subsidy }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view class="pf-cell pf-cell--col">
              <input
                v-model="form.subsidyDetail"
                class="pf-input"
                :class="{ 'pf-input--disabled': subsidyDetailOff }"
                :disabled="subsidyDetailOff"
                placeholder="补贴具体说明"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">税收优惠</text>
              <input v-model="form.taxBenefit" class="pf-input" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">环评等级</text>
              <input v-model="form.envLevel" class="pf-input" />
            </view>
            <picker mode="selector" :range="DISCHARGE" :value="pickerIdx(DISCHARGE, form.dischargePermit || '有')" @change="onPickDischarge">
              <view class="pf-cell">
                <text class="pf-cell__label">排污许可</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.dischargePermit }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <picker mode="selector" :range="SOLAR" :value="pickerIdx(SOLAR, form.solar || '可接入')" @change="onPickSolar">
              <view class="pf-cell">
                <text class="pf-cell__label">光伏接入</text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.solar }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view class="pf-section-h">亮点 · 风险 · 评估</view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">厂房亮点</text>
              <textarea v-model="form.highlights" class="pf-textarea" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">潜在风险</text>
              <textarea v-model="form.risks" class="pf-textarea" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">评估建议</text>
              <textarea v-model="form.assessment" class="pf-textarea" />
            </view>
          </view>

          <!-- Step 7: listing & contact -->
          <view v-show="step === 7" class="pf-card">
            <picker mode="selector" :range="RENT_SALE" :value="pickerIdx(RENT_SALE, form.rentSaleType || '出租')" @change="onPickRentSale">
              <view class="pf-cell">
                <text class="pf-cell__label">租售类型<text class="req">*</text></text>
                <view class="pf-select">
                  <text class="pf-select__value">{{ form.rentSaleType }}</text>
                  <text class="pf-select__arrow">›</text>
                </view>
              </view>
            </picker>
            <view v-if="showRentFields" class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">租金挂牌（元/㎡·月）</text>
                  <input v-model="form.rentListSqm" class="pf-input" type="digit" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">物业费（元/㎡·月）</text>
                  <input v-model="form.propertyFee" class="pf-input" type="digit" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">联系人姓名<text class="req">*</text></text>
                  <input v-model="form.contactName" class="pf-input" placeholder="姓名" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">联系人电话<text class="req">*</text></text>
                  <input v-model="form.contactPhone" class="pf-input" type="number" maxlength="11" placeholder="11位手机" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">看房预约备注</text>
              <textarea v-model="form.viewingNote" class="pf-textarea" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">内部备注</text>
              <textarea v-model="form.internalNote" class="pf-textarea" placeholder="不对客户展示" />
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="page-footer">
        <view v-if="form.code" class="hint" style="text-align: center; margin-bottom: 12rpx">编号 {{ form.code }}</view>
        <view class="page-footer__row">
          <button v-if="step > 0" class="btn-secondary" @click="prevStep">上一步</button>
          <button v-if="!isLast" class="btn-primary" :style="step > 0 ? '' : 'flex: 1'" @click="nextStep">下一步</button>
          <template v-else>
            <button class="btn-secondary" :disabled="saving" @click="saveDraft">保存草稿</button>
            <button class="btn-primary" :disabled="saving" @click="submitFinal">提交审核</button>
          </template>
        </view>
      </view>
    </view>

    <view v-if="showLeave" class="modal-overlay show" @click.self="leaveStay">
      <view class="modal-sheet" @click.stop>
        <view style="font-weight: 700; margin-bottom: 16rpx">离开发布页？</view>
        <text class="hint">建议先存草稿，避免丢失已填内容与媒体。</text>
        <view class="page-footer__row" style="margin-top: 36rpx">
          <button class="btn-secondary" @click="leaveStay">留下</button>
          <button class="btn-primary" @click="leaveGo">离开</button>
        </view>
      </view>
    </view>
  </view>
</template>
