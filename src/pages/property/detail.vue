<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import {
  consumePropertyDetailRefresh,
  fetchPropertyDetail,
  fetchPropertyEditForm,
  markPropertyDetailStale,
  navigateToPropertyLog,
  navigateToPropertyPublish,
  navigateToViewingNew,
  parsePropertyRouteKey,
  updatePropertyListingStatus,
} from '@/api/property'
import type { PropertyDetailPayload } from '@/types/property'
import { buildPropertyDetailKvFromForm, isLegacyPropertyDetailKv } from '@/utils/propertyDetailKv'
import { useSecuritySettings } from '@/composables/useSecuritySettings'
import {
  LIVE_LISTING_STATUSES,
  rentSaleStatusHint,
  type LiveListingStatus,
} from '@/utils/propertyListingStatus'
import { onVideoComponentError, previewNetworkVideo, resolveMediaUrl } from '@/utils/request'

const { noCopyClass } = useSecuritySettings()

const routeKey = ref('')
const detail = ref<PropertyDetailPayload | null>(null)
/** Start true so first paint does not render `detail.*` before onLoad → load(). */
const loading = ref(true)
const loadError = ref('')
const tab = ref(0)

/** Same order as publish wizard */
const tabLabels = ['基础分类', '地图定位', '图片视频', '土地建筑', '电力配套', '产权合规', '政策亮点', '挂牌联系']

const TAB_KV_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const

const auditClass = computed(() => {
  const k = detail.value?.auditKey || 'live'
  if (k === 'live') return 'audit-live'
  if (k === 'pending') return 'audit-pending'
  if (k === 'rejected') return 'audit-rejected'
  return 'audit-draft'
})

const canViewing = computed(() => detail.value?.auditKey === 'live')
const canChangeListingStatus = computed(() => detail.value?.auditKey === 'live')
const listingStatusSaving = ref(false)

const currentListingStatus = computed(() => {
  const d = detail.value
  if (!d) return ''
  const ext = String(d.externalStatus || '').trim()
  if (ext && LIVE_LISTING_STATUSES.includes(ext as LiveListingStatus)) return ext
  const chip = String(d.leaseChip || '').trim()
  if (chip && LIVE_LISTING_STATUSES.includes(chip as LiveListingStatus)) return chip
  return LIVE_LISTING_STATUSES[0]
})

const listingStatusIdx = computed(() => {
  const i = LIVE_LISTING_STATUSES.indexOf(currentListingStatus.value as LiveListingStatus)
  return i >= 0 ? i : 0
})

const rentSaleHint = computed(() => rentSaleStatusHint(detail.value?.rentSaleType || ''))
const canEditProperty = computed(() => {
  const k = detail.value?.auditKey
  return k === 'draft' || k === 'rejected'
})

const KV_STATUS_OMIT = new Set(['对外状态', '当前状态', '状态', '审核状态'])

const kvRows = computed(() => {
  const d = detail.value?.kv
  if (!d) return []
  return (d[TAB_KV_KEYS[tab.value]] ?? []).filter((r) => !KV_STATUS_OMIT.has(r.dt))
})

const mediaImages = computed(() => (detail.value?.mediaImages ?? []).map((u) => resolveMediaUrl(u)))
const mediaVideos = computed(() => (detail.value?.mediaVideos ?? []).map((u) => resolveMediaUrl(u)))
const heroVideo = computed(() => mediaVideos.value[0] || '')
const propertyTypeLabel = computed(() => detail.value?.propertyType || '')
const heroImage = computed(() => (heroVideo.value ? '' : mediaImages.value[0] || ''))
const heroActiveImage = ref(0)
/** Tab 2: videos already in hero — only list images below */
const detailTabVideos = computed(() => (heroVideo.value ? [] : mediaVideos.value))
const showMediaTab = computed(
  () => mediaImages.value.length > 0 || detailTabVideos.value.length > 0,
)

const statusChipLabel = computed(() => {
  const d = detail.value
  if (!d) return ''
  const ext = String(d.externalStatus || '').trim()
  if (ext && ext !== '—') return ext
  if (d.auditKey === 'draft') return '草稿'
  if (d.auditKey === 'pending') return '待审核'
  if (d.auditKey === 'rejected') return '驳回'
  return d.leaseChip || '—'
})

const statusChipClass = computed(() => {
  const k = detail.value?.auditKey
  if (k === 'draft') return 'chip'
  if (k === 'pending') return 'chip warn'
  if (k === 'rejected') return 'chip'
  if (k === 'live') return 'chip on ok'
  return 'chip'
})

const headerChips = computed(() => {
  const d = detail.value
  if (!d) return [] as { label: string; cls: string }[]
  const items: { label: string; cls: string }[] = []
  const type = propertyTypeLabel.value
  if (type) items.push({ label: type, cls: 'chip' })
  const st = statusChipLabel.value
  if (st && st !== '—') items.push({ label: st, cls: statusChipClass.value })
  if (d.company) items.push({ label: d.company, cls: 'chip' })
  const out: { label: string; cls: string }[] = []
  for (const it of items) {
    if (out.length && out[out.length - 1].label === it.label) continue
    out.push(it)
  }
  return out
})

const showAuditHintStrip = computed(() => {
  const d = detail.value
  if (!d?.auditHint) return false
  if (d.auditKey === 'rejected' && d.rejectReason) return false
  const hint = String(d.auditHint).trim()
  const st = statusChipLabel.value
  if (hint.includes(st) && st.length > 0) return false
  if (d.auditKey === 'draft' && /草稿/.test(hint)) return false
  return true
})

function parseCoord(v: unknown) {
  const n = Number.parseFloat(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

const hasMapCoords = computed(() => {
  const d = detail.value
  if (!d) return false
  const lat = parseCoord(d.lat)
  const lng = parseCoord(d.lng)
  return Number.isFinite(lat) && Number.isFinite(lng)
})

const mapLatitude = computed(() => (hasMapCoords.value ? parseCoord(detail.value!.lat) : 23.129112))
const mapLongitude = computed(() => (hasMapCoords.value ? parseCoord(detail.value!.lng) : 113.264385))

const mapMarkers = computed(() => {
  if (!hasMapCoords.value || !detail.value) return []
  return [
    {
      id: 1,
      latitude: parseCoord(detail.value.lat),
      longitude: parseCoord(detail.value.lng),
      width: 28,
      height: 36,
    },
  ]
})

onLoad((q) => {
  routeKey.value = parsePropertyRouteKey(q)
  if (routeKey.value) void load()
})

async function load() {
  if (!routeKey.value) {
    loading.value = false
    loadError.value = '缺少房源标识'
    return
  }
  loading.value = true
  loadError.value = ''
  detail.value = null
  try {
    const [payload, form] = await Promise.all([
      fetchPropertyDetail(routeKey.value),
      fetchPropertyEditForm(routeKey.value).catch(() => null),
    ])
    if (form) {
      payload.kv = buildPropertyDetailKvFromForm(form, {
        type: payload.propertyType,
        district: payload.district,
        company: payload.company,
        statusTag: payload.externalStatus || payload.leaseChip,
        priceLine: payload.priceLine,
        submitterName: typeof form.submitterName === 'string' ? form.submitterName : undefined,
      })
    } else if (isLegacyPropertyDetailKv(payload.kv)) {
      uni.showToast({ title: '表单数据加载失败，Tab 可能不完整', icon: 'none' })
    }
    detail.value = payload
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    uni.showToast({ title: loadError.value, icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  if (routeKey.value && consumePropertyDetailRefresh(routeKey.value)) {
    void load()
  }
})

function back() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/property/list' }) })
}

function goEdit() {
  navigateToPropertyPublish(routeKey.value)
}

function goLog(_key?: string) {
  navigateToPropertyLog(routeKey.value)
}

function goViewing() {
  navigateToViewingNew(routeKey.value)
}

function openMap() {
  const d = detail.value
  if (!d) return
  const lat = parseCoord(d.lat)
  const lng = parseCoord(d.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    uni.showToast({ title: '暂无坐标', icon: 'none' })
    return
  }
  uni.openLocation({
    latitude: lat,
    longitude: lng,
    name: d.detailTitle,
    address: d.navAddr || d.addrKv,
  })
}

function copyCoord() {
  const d = detail.value
  if (!d) return
  uni.setClipboardData({ data: d.lat && d.lng ? `${d.lat}, ${d.lng}` : d.mapCoordLabel })
}

async function onListingStatusPick(e: { detail: { value: string | number } }) {
  const d = detail.value
  if (!d || !canChangeListingStatus.value || listingStatusSaving.value) return
  const idx = Number(e.detail.value)
  const next = LIVE_LISTING_STATUSES[idx]
  if (!next || next === currentListingStatus.value) return
  listingStatusSaving.value = true
  try {
    const r = await updatePropertyListingStatus(d.id, next)
    d.externalStatus = r.externalStatus
    d.leaseChip = r.externalStatus
    markPropertyDetailStale(d.id)
    uni.showToast({ title: `已更新为「${next}」`, icon: 'none' })
  } catch (err) {
    uni.showToast({ title: err instanceof Error ? err.message : '更新失败', icon: 'none' })
  } finally {
    listingStatusSaving.value = false
  }
}

function shareInternal() {
  const d = detail.value
  if (!d) return
  uni.setClipboardData({
    data: `【房源】${d.detailTitle}\n编号 ${d.id}\n${d.priceLine}\n${d.addrKv}`,
    success: () => uni.showToast({ title: '已复制转发文案', icon: 'none' }),
  })
}

function previewHeroImage(index: number) {
  const urls = mediaImages.value
  if (!urls.length) return
  uni.previewImage({ urls, current: urls[index] || urls[0] })
}

function playHeroFullscreen() {
  if (heroVideo.value) previewNetworkVideo(heroVideo.value)
}

function openVideoFullscreen(url: string) {
  previewNetworkVideo(url)
}
</script>

<template>
  <view class="app-shell" :class="noCopyClass">
    <view class="page-frame screen active screen--sub">
      <NavIconBar
        title="房源详情"
        :actions="[{ key: 'log', icon: 'log', ariaLabel: '操作日志' }]"
        @back="back"
        @action="goLog"
      />

      <view v-if="loading" class="page-scroll pf-detail-loading">
        <text class="hint">加载中…</text>
      </view>

      <view v-else-if="loadError && !detail" class="page-scroll pf-detail-loading">
        <text class="hint" style="margin-bottom: 24rpx">{{ loadError }}</text>
        <button class="btn-secondary" @click="load">重试</button>
      </view>

      <scroll-view v-else-if="detail" scroll-y :show-scrollbar="false" class="page-scroll">
        <view class="pf-detail-hero-wrap">
          <view class="prop-media-hero">
            <video
              v-if="heroVideo"
              class="prop-media-hero__main prop-media-hero__video"
              :src="heroVideo"
              controls
              show-center-play-btn
              object-fit="cover"
              @error="onVideoComponentError"
            />
            <image
              v-else-if="heroImage"
              class="prop-media-hero__main"
              :src="heroImage"
              mode="aspectFill"
              @click="previewHeroImage(0)"
            />
            <view v-else class="prop-media-hero__main prop-media-hero__empty">
              <view class="prop-media-hero__orb" />
              <text class="prop-media-hero__empty-txt">暂无图片/视频</text>
            </view>
            <view v-if="heroVideo" class="prop-media-hero__fs" @tap="playHeroFullscreen">全屏</view>
            <scroll-view v-if="mediaImages.length > 1" scroll-x class="prop-media-hero__strip" :show-scrollbar="false">
              <image
                v-for="(url, i) in mediaImages"
                :key="'t' + i"
                class="prop-media-hero__thumb"
                :class="{ on: !heroVideo && heroActiveImage === i }"
                :src="url"
                mode="aspectFill"
                @click="heroActiveImage = i; previewHeroImage(i)"
              />
            </scroll-view>
          </view>
        </view>

        <view class="pf-detail-sheet">
          <view class="pf-detail-title-card">
            <text class="detail-header-card__code">{{ detail.id }}</text>
            <text class="detail-header-card__title">{{ detail.detailTitle }}</text>
            <text class="detail-header-card__meta">{{ detail.specLine }}</text>
            <text class="pf-detail-price">{{ detail.priceLine }}</text>
            <text v-if="detail.submitterName && detail.submitterName !== '—'" class="detail-header-card__meta" style="margin-top: 8rpx">
              提交人 {{ detail.submitterName }}
            </text>
            <view class="chip-row">
              <text v-for="(c, i) in headerChips" :key="i" :class="c.cls">{{ c.label }}</text>
            </view>
          </view>

          <view v-if="canChangeListingStatus" class="pf-kv-card" style="margin-top: 24rpx">
            <view class="section-title">租售状态</view>
            <view class="pf-cell pf-cell--col">
              <picker
                mode="selector"
                :range="[...LIVE_LISTING_STATUSES]"
                :value="listingStatusIdx"
                :disabled="listingStatusSaving"
                @change="onListingStatusPick"
              >
                <view class="picker-like">{{ currentListingStatus }}</view>
              </picker>
              <text v-if="rentSaleHint" class="hint" style="display: block; margin-top: 12rpx">{{ rentSaleHint }}</text>
              <text class="hint" style="display: block; margin-top: 8rpx">不可改为草稿、待审核或驳回</text>
            </view>
          </view>

          <view v-if="detail.auditKey === 'rejected' && detail.rejectReason" class="pf-reject-box">
            <text class="pf-reject-box__title">驳回原因</text>
            <text class="pf-reject-box__body">{{ detail.rejectReason }}</text>
          </view>

          <view v-else-if="showAuditHintStrip" class="pf-detail-audit-wrap">
            <view class="prop-detail-audit-strip" :class="auditClass">
              <text>{{ detail.auditHint }}</text>
            </view>
          </view>

          <view v-else-if="detail.auditKey === 'rejected'" class="pf-detail-audit-wrap">
            <view class="prop-detail-audit-strip audit-rejected">
              <text>审核未通过，请编辑后重新提交</text>
            </view>
          </view>

          <view class="pf-detail-tabs-wrap">
            <view class="pf-step-tabs">
              <text
                v-for="(label, i) in tabLabels"
                :key="label"
                class="pf-step-tab"
                :class="{ on: tab === i }"
                @click="tab = i"
                >{{ label }}</text
              >
            </view>
          </view>

          <view v-if="kvRows.length" class="pf-kv-card">
            <view v-for="(row, i) in kvRows" :key="i" class="pf-kv-row">
              <text class="pf-kv-dt">{{ row.dt }}</text>
              <text class="pf-kv-dd">{{ row.dd }}</text>
            </view>
          </view>

          <!-- Tab 1: map panel (address + coords; not duplicated in KV) -->
          <view v-if="tab === 1" class="pf-kv-card pf-detail-map-card">
            <view class="section-title">位置 · 地图</view>
            <view class="pf-map-preview-wrap pf-map-preview-wrap--detail">
              <map
                class="pf-map-preview"
                :latitude="mapLatitude"
                :longitude="mapLongitude"
                :scale="16"
                :markers="mapMarkers"
                enable-scroll
                enable-zoom
              />
              <view v-if="!hasMapCoords" class="pf-map-preview__empty">
                <text>尚未录入坐标</text>
              </view>
            </view>
            <text class="pf-detail-map-addr">{{ detail.navAddr || detail.addrKv }}</text>
            <text v-if="hasMapCoords" class="pf-detail-map-coord">坐标：{{ detail.lat }}, {{ detail.lng }}</text>
            <view class="page-footer__row">
              <button class="btn-primary" style="flex: 1" :disabled="!hasMapCoords" @click="openMap">导航</button>
              <button class="btn-secondary" style="flex: 1" @click="copyCoord">复制坐标</button>
            </view>
          </view>

          <!-- Tab 2: images only when hero plays video; otherwise images + videos -->
          <view v-if="tab === 2 && showMediaTab" class="pf-kv-card">
            <view v-if="mediaImages.length" class="pf-detail-media-block">
              <view class="section-title">{{ heroVideo ? '图片' : '全部图片' }}</view>
              <view class="pf-detail-media-grid">
                <image
                  v-for="(url, i) in mediaImages"
                  :key="'img' + i"
                  class="pf-detail-media-grid__img"
                  :src="url"
                  mode="aspectFill"
                  @click="previewHeroImage(i)"
                />
              </view>
            </view>
            <view v-if="detailTabVideos.length" class="pf-detail-media-block">
              <view class="section-title">全部视频</view>
              <view v-for="(url, i) in detailTabVideos" :key="'vid' + i" class="pf-detail-video-item">
                <video
                  class="prop-media-editor__video-sm"
                  :src="url"
                  controls
                  object-fit="contain"
                  @error="onVideoComponentError"
                />
                <button class="btn-ghost sm" style="width: 100%; margin-top: 12rpx" @click="openVideoFullscreen(url)">全屏播放</button>
              </view>
            </view>
          </view>

          <text
            v-if="!kvRows.length && tab !== 1 && !(tab === 2 && showMediaTab)"
            class="hint pf-detail-empty"
            >暂无数据</text
          >
          <text
            v-else-if="tab === 1 && !kvRows.length && !hasMapCoords && !(detail.navAddr || detail.addrKv)"
            class="hint pf-detail-empty"
            >暂无位置信息</text
          >
        </view>
      </scroll-view>

      <view v-if="detail" class="page-footer">
        <view class="page-footer__row">
          <button
            v-if="canEditProperty"
            class="btn-secondary"
            :class="{ 'btn-primary': !canViewing }"
            :style="canViewing ? '' : 'flex: 1'"
            @click="goEdit"
            >编辑</button
          >
          <button v-if="canViewing" class="btn-primary" style="flex: 1" @click="goViewing">预约带看</button>
        </view>
        <button v-if="canViewing" class="btn-ghost" style="width: 100%; margin-top: 12rpx" @click="shareInternal">复制转发文案</button>
      </view>
    </view>
  </view>
</template>
