<script setup lang="ts">
import { computed, provide } from 'vue'
import NavIconBar from '@/components/NavIconBar.vue'
import { useKeyboardScrollPad } from '@/composables/useKeyboardScrollPad'
import {
  PROPERTY_PUBLISH_KEY,
  usePropertyPublishPage,
} from '@/composables/usePropertyPublishForm'
import {
  CERT_OPTIONS,
  DINING_OPTIONS,
  DISCHARGE,
  FIRE_OPTIONS,
  FIRE_PASS,
  LAND_USE_OPTIONS,
  MONITOR,
  PHOTO_OPTIONS,
  RENT_SALE,
  RIGHTS_OPTIONS,
  RUSH_HOUR,
  SOLAR,
  STRUCTURE_OPTIONS,
  YES_NO,
} from '@/utils/propertyPublish'

const ctx = usePropertyPublishPage()
provide(PROPERTY_PUBLISH_KEY, ctx)

const { keyboardPadPx } = useKeyboardScrollPad()
const keyboardPadStyle = computed(() =>
  keyboardPadPx.value > 0 ? { paddingBottom: `${keyboardPadPx.value + 16}px` } : {},
)

const {
  step,
  title,
  showLeave,
  saving,
  uploading,
  form,
  propertyTypes,
  regionNames,
  structureOtherOff,
  rightsOtherOff,
  landUseOtherOff,
  fireOtherOff,
  subsidyDetailOff,
  mortgageNoteOff,
  fireFailOff,
  coTenantAnnualOff,
  showRentFields,
  auditState,
  auditStatusClass,
  formReadonly,
  canPublishForAudit,
  canSaveDraft,
  showStatusAuditHint,
  toggleTypes,
  togglePhoto,
  toggleStructure,
  toggleRights,
  toggleLandUse,
  toggleCert,
  toggleFire,
  stepNames,
  editorImages,
  editorVideos,
  hasMapCoords,
  mapLatitude,
  mapLongitude,
  mapMarkers,
  pickDistrict,
  onPickDining,
  onPickMortgage,
  onPickFirePass,
  onPickSubsidy,
  onPickDischarge,
  onPickSolar,
  onPickRentSale,
  onPickMonitor,
  onPickRushHour,
  chooseMap,
  onMapTap,
  removeEditorImage,
  removeEditorVideo,
  previewEditorImage,
  pickImages,
  pickVideos,
  isLast,
  nextStep,
  prevStep,
  saveDraft,
  submitFinal,
  close,
  leaveStay,
  leaveGo,
  pickerIdx,
  onVideoComponentError,
  previewNetworkVideo,
  statusDisplay,
  formLocked,
} = ctx
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar :title="title" back-icon="close" @back="close" />

      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll" :enable-flex="true">
        <view
          class="page-scroll__inner page-scroll__inner--keyboard-pad"
          :class="{ 'pf-publish--locked': formLocked }"
          :style="keyboardPadStyle"
        >
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
            <view class="pf-section-h">状态</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-status-readonly">
                <text>{{ statusDisplay }}</text>
              </view>
            </view>
            <view v-if="auditState === 'rejected' && form.auditHint" class="pf-reject-box">
              <text class="pf-reject-box__title">驳回原因</text>
              <text class="pf-reject-box__body">{{ form.auditHint }}</text>
            </view>
            <view v-else-if="showStatusAuditHint" class="pf-detail-audit-wrap">
              <view class="prop-detail-audit-strip" :class="auditStatusClass">
                <text>{{ form.auditHint }}</text>
              </view>
            </view>

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
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.listTitle" class="pf-input" placeholder="对外展示标题" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">公司名称<text class="req">*</text></text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.companyName" class="pf-input" placeholder="营业执照全称" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">业主联系人</text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.ownerContact" class="pf-input" placeholder="姓名 · 电话" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">风险标签</text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.riskTag" class="pf-input" placeholder="如：资料待核、无" />
            </view>
          </view>

          <!-- Step 1 -->
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
              <view class="form-field-readonly">暂无负责区域，请联系管理员在后台配置</view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">详细地址<text class="req">*</text></text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.address" class="pf-input" placeholder="选点后自动回填，也可手填" />
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
                <input :adjust-position="false" :cursor-spacing="80" v-model="form.lat" class="pf-input" type="digit" placeholder="23.xxx" />
              </view>
              <view class="pf-field">
                <text class="pf-field__label">经度<text class="req">*</text></text>
                <input :adjust-position="false" :cursor-spacing="80" v-model="form.lng" class="pf-input" type="digit" placeholder="113.xxx" />
              </view>
            </view>
            <view v-if="hasMapCoords" class="pf-cell pf-cell--col">
              <text class="hint">当前坐标：{{ form.lat }}, {{ form.lng }}</text>
            </view>
          </view>

          <!-- Step 2 -->
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
                <view class="upload-tile" :class="{ 'upload-tile--busy': uploading }" @click="pickImages">
                  <text class="tile-title">{{ uploading ? '上传中…' : '上传图片' }}</text>
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
                <view class="upload-tile" :class="{ 'upload-tile--busy': uploading }" @click="pickVideos">
                  <text class="tile-title">上传视频</text>
                  <text class="hint">已 {{ editorVideos.length }} 个</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Steps 3–7: kept in page template; logic lives in composable + propertyPublish.ts -->
          <view v-show="step === 3" class="pf-card">
            <view class="pf-section-h">土地 · 建筑规格</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">土地（亩）<text class="req">*</text></text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.landMu" class="pf-input" type="digit" placeholder="亩" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">实际土地（亩）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.actualLandMu" class="pf-input" type="digit" placeholder="亩" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">建筑面积（㎡）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.buildingArea" class="pf-input" type="number" placeholder="㎡" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">使用面积（㎡）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.actualUseArea" class="pf-input" type="number" placeholder="㎡" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">总层数</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.floors" class="pf-input" type="number" placeholder="层" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">承重（吨/m²）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.loadPerSqm" class="pf-input" type="digit" placeholder="吨/m²" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">车间长宽高（米）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.workshopSize" class="pf-input" placeholder="长×宽×高" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">承重注明区域</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.loadNote" class="pf-input" placeholder="承重特殊说明" />
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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.structureOther"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': structureOtherOff }"
                :disabled="structureOtherOff"
                placeholder="选「其他」时填写"
              />
            </view>
          </view>

          <view v-show="step === 4" class="pf-card">
            <view class="pf-section-h">电力 · 货梯 · 货运</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">电力总容量（kVA）<text class="req">*</text></text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.powerKva" class="pf-input" type="number" placeholder="kVA" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">变压器（台）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.transformers" class="pf-input" type="number" placeholder="台" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">货梯（台）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.freightLifts" class="pf-input" type="number" placeholder="台" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">货梯载重（吨）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.liftLoadT" class="pf-input" type="digit" placeholder="吨" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">货梯尺寸（米）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.liftDims" class="pf-input" placeholder="长×宽×高（米）" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">装卸平台高度（cm）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.platformHeightCm" class="pf-input" type="number" placeholder="可选" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">货车转弯半径（米）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.turnRadiusM" class="pf-input" type="digit" placeholder="可选" />
                </view>
              </view>
            </view>
            <view class="pf-section-h">周边配套</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">宿舍 · 园区内租金（元/房）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.dormRent" class="pf-input" type="number" placeholder="可选" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">宿舍 · 周边距离（公里）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.dormDistanceKm" class="pf-input" type="digit" placeholder="可选" />
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
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.transitStation" class="pf-input" placeholder="站点名称" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">站点距离（米）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.stationDistanceM" class="pf-input" type="number" placeholder="米" />
                </view>
              </view>
            </view>
            <view class="pf-section-h">使用情况</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">自用（㎡）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.selfUseSqm" class="pf-input" type="number" placeholder="㎡" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">租金估算（元/年）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.rentEstimateYear" class="pf-input" type="number" placeholder="元/年" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">共租（家）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.coTenantCount" class="pf-input" type="number" placeholder="0 表示非共租" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">年租金（元/年）</text>
                  <input :adjust-position="false" :cursor-spacing="80"
                    v-model="form.annualRent"
                    class="pf-input"
                    :class="{ 'pf-input--disabled': coTenantAnnualOff }"
                    type="number"
                    placeholder="共租时填写"
                    :disabled="coTenantAnnualOff"
                  />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">租客公司</text>
                  <input :adjust-position="false" :cursor-spacing="80"
                    v-model="form.tenantCompanies"
                    class="pf-input"
                    :class="{ 'pf-input--disabled': coTenantAnnualOff }"
                    placeholder="多家用顿号分隔"
                    :disabled="coTenantAnnualOff"
                  />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">合同还有（年）</text>
                  <input :adjust-position="false" :cursor-spacing="80"
                    v-model="form.contractYearsLeft"
                    class="pf-input"
                    :class="{ 'pf-input--disabled': coTenantAnnualOff }"
                    type="digit"
                    placeholder="共租时填写"
                    :disabled="coTenantAnnualOff"
                  />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">腾空周期（月）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.vacantMonths" class="pf-input" type="number" placeholder="月" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">使用情况备注</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.usageRemark" class="pf-textarea" placeholder="使用情况说明" />
            </view>
          </view>

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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.propertyRightsOther"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': rightsOtherOff }"
                :disabled="rightsOtherOff"
                placeholder="选「其他」时填写"
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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.landUseOther"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': landUseOtherOff }"
                :disabled="landUseOtherOff"
                placeholder="选「其他」时填写"
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
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false"
                v-model="form.mortgageNote"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': mortgageNoteOff }"
                placeholder="选「有」时填写"
                :disabled="mortgageNoteOff"
              />
            </view>
            <view class="pf-section-h">交易 · 行业限制</view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">房东心里价位（万）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.landlordPriceWan" class="pf-input" type="digit" placeholder="可选" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">交易方式</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.tradeMode" class="pf-input" placeholder="如：股权转让" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">交易税费说明</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.taxFeeNote" class="pf-input" placeholder="金额或区间" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">允许产业类型</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.allowedIndustries" class="pf-input" placeholder="允许入驻产业" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">特殊限制</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.specialLimits" class="pf-textarea" placeholder="特殊限制说明" />
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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.fireOther"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': fireOtherOff }"
                :disabled="fireOtherOff"
                placeholder="选「其他」时填写"
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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.fireFailReason"
                class="pf-input"
                :class="{ 'pf-input--disabled': fireFailOff }"
                placeholder="选「否」时填写"
                :disabled="fireFailOff"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">最近高速口（km）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.highwayKm" class="pf-input" type="digit" placeholder="km" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">港口/机场（km）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.portAirportKm" class="pf-input" type="digit" placeholder="km" />
                </view>
                <view class="pf-field pf-field--full">
                  <text class="pf-field__label">道路限高/限重</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.roadLimits" class="pf-input" placeholder="限高/限重说明" />
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
              <input :adjust-position="false" :cursor-spacing="80"
                v-model="form.subsidyDetail"
                class="pf-textarea"
                :class="{ 'pf-textarea--disabled': subsidyDetailOff }"
                :disabled="subsidyDetailOff"
                placeholder="选「有」时填写补贴说明"
              />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">税收优惠</text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.taxBenefit" class="pf-input" placeholder="税收优惠说明" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">环评等级</text>
              <input :adjust-position="false" :cursor-spacing="80" v-model="form.envLevel" class="pf-input" placeholder="如：二类工业用地" />
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
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.highlights" class="pf-textarea" placeholder="厂房亮点" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">潜在风险</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.risks" class="pf-textarea" placeholder="潜在风险" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">评估建议</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.assessment" class="pf-textarea" placeholder="评估建议" />
            </view>
          </view>

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
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.rentListSqm" class="pf-input" type="digit" placeholder="元/㎡·月" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">物业费（元/㎡·月）</text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.propertyFee" class="pf-input" type="digit" placeholder="元/㎡·月" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <view class="pf-field-grid">
                <view class="pf-field">
                  <text class="pf-field__label">联系人姓名<text class="req">*</text></text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.contactName" class="pf-input" placeholder="姓名" />
                </view>
                <view class="pf-field">
                  <text class="pf-field__label">联系人电话<text class="req">*</text></text>
                  <input :adjust-position="false" :cursor-spacing="80" v-model="form.contactPhone" class="pf-input" type="number" maxlength="11" placeholder="11位手机" />
                </view>
              </view>
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">看房预约备注</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.viewingNote" class="pf-textarea" placeholder="看房预约备注" />
            </view>
            <view class="pf-cell pf-cell--col">
              <text class="pf-cell__label">内部备注</text>
              <textarea :adjust-position="false" :cursor-spacing="80" :auto-height="false" v-model="form.internalNote" class="pf-textarea" placeholder="不对客户展示" />
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="page-footer">
        <view v-if="form.code" class="hint" style="text-align: center; margin-bottom: 12rpx">编号 {{ form.code }}</view>
        <view v-if="formReadonly" class="pf-detail-audit-wrap" style="margin-bottom: 12rpx">
          <view class="prop-detail-audit-strip audit-pending">
            <text>{{ form.auditHint || '待审核中，暂不可编辑' }}</text>
          </view>
        </view>
        <view v-else-if="auditState === 'live'" class="pf-detail-audit-wrap" style="margin-bottom: 12rpx">
          <view class="prop-detail-audit-strip audit-live">
            <text>已上线，租售状态请在后台管理系统调整</text>
          </view>
        </view>
        <view class="page-footer__row">
          <button v-if="step > 0" class="btn-secondary" @click="prevStep">上一步</button>
          <button v-if="canSaveDraft" class="btn-secondary" :disabled="saving" @click="saveDraft">保存草稿</button>
          <button v-if="!isLast" class="btn-primary" @click="nextStep">下一步</button>
          <button v-else-if="canPublishForAudit" class="btn-primary" :disabled="saving" @click="submitFinal">提交审核</button>
        </view>
      </view>
    </view>

    <view v-if="uploading" class="pf-upload-mask" @touchmove.stop.prevent>
      <view class="pf-upload-mask__box">
        <view class="pf-upload-mask__spinner" />
        <text class="pf-upload-mask__txt">媒体上传中…</text>
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
