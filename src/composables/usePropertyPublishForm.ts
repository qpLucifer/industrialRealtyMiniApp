import { type InjectionKey, computed, inject, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchPropertyEditForm, markPropertyDetailStale, parsePropertyRouteKey } from '@/api/property'
import { postAction } from '@/api/message'
import type { PropertyEditForm } from '@/types/property'
import { markListStale } from '@/utils/listStale'
import { getSecuritySettingsSync } from '@/utils/securitySettingsCache'
import {
  CERT_OPTIONS,
  DINING_OPTIONS,
  DISCHARGE,
  FALLBACK_PROPERTY_TYPES,
  FIRE_OPTIONS,
  FIRE_PASS,
  LAND_USE_OPTIONS,
  MONITOR,
  PHOTO_OPTIONS,
  PUBLISH_STEP_NAMES,
  RENT_SALE,
  RIGHTS_OPTIONS,
  RUSH_HOUR,
  SOLAR,
  STRUCTURE_OPTIONS,
  YES_NO,
  collectPropertyRequiredMiss,
  isPhone11Cn,
  parseCoord,
  pickFromRange,
  pickerIdx,
  toggleFormArr,
  type PickerChange,
} from '@/utils/propertyPublish'
import { markWorkbenchStale } from '@/utils/workbenchRefresh'
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
} from '@/utils/request'
import {
  formatBatchUploadToast,
  uploadImagesFromPaths,
  uploadVideoFromPath,
} from '@/utils/mediaUpload'
import { MAX_IMAGES_PER_PICK } from '@/utils/mediaUploadPolicy'
import { isRentSaleTypeForFeatured, showFeaturedOption } from '@/utils/propertyFeatured'

export function usePropertyPublishPage() {
  const step = ref(0)
  const title = ref('发布房源')
  const showLeave = ref(false)
  const saving = ref(false)
  const uploading = ref(false)
  const uploadPercent = ref(0)
  const uploadLabel = ref('')

  const form = reactive<PropertyEditForm>(emptyPropertyForm())
  const propertyTypes = ref<string[]>([...FALLBACK_PROPERTY_TYPES])
  const regionDefs = ref<{ id: number; name: string }[]>([])
  const regionNames = computed(() => regionDefs.value.map((r) => r.name))

  function mapRegionDefs(list: unknown[]) {
    return list
      .map((r) => {
        const row = r as { id?: number | string; name?: string; label?: string }
        const id = Number(row.id)
        const name = String(row.name || row.label || '').trim()
        return Number.isFinite(id) && name ? { id, name } : null
      })
      .filter(Boolean) as { id: number; name: string }[]
  }

  /** Keep current property district visible when editing legacy/out-of-list row. */
  function ensureCurrentDistrictInRegionList() {
    const id = form.districtRegionId != null ? Number(form.districtRegionId) : NaN
    const name = String(form.district || '').trim()
    if (Number.isFinite(id) && id > 0 && !regionDefs.value.some((r) => r.id === id)) {
      regionDefs.value = [...regionDefs.value, { id, name: name || `区域#${id}` }]
    }
  }

  async function loadMeta() {
    try {
      const [regions, types] = await Promise.all([
        fetchRegionDefs(),
        fetchCodeMasterLabels('property_type').catch(() => ({ list: [] as string[] })),
      ])
      regionDefs.value = mapRegionDefs(regions.list ?? [])
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
  const coTenantAnnualOff = computed(() => !Number(form.coTenantCount))
  const showRentFields = computed(() => form.rentSaleType === '出租' || form.rentSaleType === '租售皆可')
  const showFeaturedField = computed(() =>
    showFeaturedOption(form.externalStatus, form.rentSaleType),
  )

  const auditState = computed(() => {
    const s = String(form.auditState || '').trim()
    return s || 'draft'
  })
  const statusDisplay = computed(() => String(form.externalStatus || '草稿').trim() || '草稿')
  const auditStatusClass = computed(() => {
    const s = auditState.value
    if (s === 'live') return 'audit-live'
    if (s === 'pending') return 'audit-pending'
    if (s === 'rejected') return 'audit-rejected'
    return 'audit-draft'
  })
  const formReadonly = computed(() => auditState.value === 'pending')
  const formLocked = computed(() => formReadonly.value)
  const canPublishForAudit = computed(() => auditState.value === 'draft' || auditState.value === 'rejected')
  const canSaveDraft = computed(
    () => canPublishForAudit.value || !form.code || auditState.value === 'live',
  )
  const saveDraftLabel = computed(() => (auditState.value === 'live' ? '保存修改' : '保存草稿'))
  const showStatusAuditHint = computed(() => {
    if (auditState.value === 'draft' || auditState.value === 'rejected') return false
    const hint = String(form.auditHint || '').trim()
    if (!hint) return false
    if (hint.includes('未发布') && hint.includes('草稿')) return false
    return true
  })

  function toggleTypes(t: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.types)) form.types = []
    toggleFormArr(form.types, t, 1)
  }
  function togglePhoto(p: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.photoChecklist)) form.photoChecklist = []
    toggleFormArr(form.photoChecklist, p, 0)
  }
  function toggleStructure(s: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.structureTypes)) form.structureTypes = []
    toggleFormArr(form.structureTypes, s, 0)
  }
  function toggleRights(r: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.propertyRights)) form.propertyRights = []
    toggleFormArr(form.propertyRights, r, 0)
  }
  function toggleLandUse(u: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.landUse)) form.landUse = []
    toggleFormArr(form.landUse, u, 0)
  }
  function toggleCert(c: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.certificates)) form.certificates = []
    toggleFormArr(form.certificates, c, 0)
  }
  function toggleFire(f: string) {
    if (formLocked.value) return
    if (!Array.isArray(form.fireSystems)) form.fireSystems = []
    toggleFormArr(form.fireSystems, f, 0)
  }

  const stepNames = [...PUBLISH_STEP_NAMES]
  const editorImages = computed(() => parseMediaLines(form.mediaImageUrls).map((u) => resolveMediaUrl(u)))
  const editorVideos = computed(() => parseMediaLines(form.mediaVideoUrls).map((u) => resolveMediaUrl(u)))

  const hasMapCoords = computed(() => {
    const lat = parseCoord(form.lat)
    const lng = parseCoord(form.lng)
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  })
  const mapLatitude = computed(() => (hasMapCoords.value ? parseCoord(form.lat) : 23.129112))
  const mapLongitude = computed(() => (hasMapCoords.value ? parseCoord(form.lng) : 113.264385))
  const mapMarkers = computed(() => {
    if (!hasMapCoords.value) return []
    return [{ id: 1, latitude: parseCoord(form.lat), longitude: parseCoord(form.lng), width: 28, height: 36 }]
  })

  function guessDistrictFromAddress(address: string) {
    const text = String(address || '').trim()
    if (!text) return ''
    const hit = regionDefs.value.find((r) => r.name && text.includes(r.name))
    if (hit) {
      form.districtRegionId = hit.id
      return hit.name
    }
    return ''
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

  function reorderMediaField(field: 'mediaImageUrls' | 'mediaVideoUrls', from: number, to: number) {
    if (formLocked.value) return
    const cur = field === 'mediaImageUrls' ? form.mediaImageUrls : form.mediaVideoUrls
    const lines = parseMediaLines(cur)
    if (from === to || from < 0 || to < 0 || from >= lines.length || to >= lines.length) return
    const [item] = lines.splice(from, 1)
    lines.splice(to, 0, item)
    if (field === 'mediaImageUrls') form.mediaImageUrls = joinMediaLines(lines)
    else form.mediaVideoUrls = joinMediaLines(lines)
  }

  function reorderEditorImage(from: number, to: number) {
    reorderMediaField('mediaImageUrls', from, to)
  }

  function reorderEditorVideo(from: number, to: number) {
    reorderMediaField('mediaVideoUrls', from, to)
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

  function pickDistrict(e: PickerChange) {
    const i = Number(e.detail.value)
    const row = regionDefs.value[i]
    if (row) {
      form.district = row.name
      form.districtRegionId = row.id
    }
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
      if (!isRentSaleTypeForFeatured(v)) form.featured = false
    })
  }

  function onFeaturedSwitch(e: { detail?: { value?: boolean } }) {
    if (formLocked.value) return
    form.featured = !!e.detail?.value
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
    if (formLocked.value) return
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
    if (formLocked.value) return
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
    if (formLocked.value) return
    uni.chooseMedia({
      count: MAX_IMAGES_PER_PICK,
      mediaType: ['image'],
      success: async (res) => {
        const files = res.tempFiles.slice(0, MAX_IMAGES_PER_PICK)
        uploading.value = true
        uploadPercent.value = 0
        uploadLabel.value = '图片上传中…'
        try {
          const summary = await uploadImagesFromPaths(
            files.map((f, i) => ({
              path: f.tempFilePath,
              name: `图片${i + 1}`,
              size: f.size ?? 0,
            })),
            uploadFolder(),
            (done, total) => {
              uploadPercent.value = total ? Math.round((done / total) * 100) : 0
            },
          )
          for (const item of summary.succeeded) {
            if (item.url) appendUrl('mediaImageUrls', item.url)
          }
          uni.showToast({ title: formatBatchUploadToast(summary), icon: 'none' })
        } catch (e) {
          uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
        } finally {
          uploading.value = false
          uploadPercent.value = 0
          uploadLabel.value = ''
        }
      },
    })
  }

  async function pickVideos() {
    if (formLocked.value) return
    uni.chooseMedia({
      count: 1,
      mediaType: ['video'],
      success: async (res) => {
        const f = res.tempFiles[0]
        if (!f) return
        uploading.value = true
        uploadPercent.value = 0
        uploadLabel.value = '视频上传中…'
        try {
          const { url } = await uploadVideoFromPath(
            f.tempFilePath,
            f.size ?? 0,
            uploadFolder(),
            'video/mp4',
            (pct) => {
              uploadPercent.value = pct
            },
          )
          appendUrl('mediaVideoUrls', url)
          uni.showToast({ title: '视频已上传', icon: 'none' })
        } catch (e) {
          uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
        } finally {
          uploading.value = false
          uploadPercent.value = 0
          uploadLabel.value = ''
        }
      },
    })
  }

  onLoad(async (q) => {
    await loadMeta()
    if (q?.clear === '1') {
      title.value = '发布房源'
      applyPropertyApiForm(form, emptyPropertyForm())
      return
    }
    const key = parsePropertyRouteKey(q)
    if (key) {
      title.value = '编辑房源'
      try {
        const api = await fetchPropertyEditForm(key)
        applyPropertyApiForm(form, api)
        ensureCurrentDistrictInRegionList()
      } catch {
        uni.showToast({ title: '加载房源失败', icon: 'none' })
      }
    }
  })

  const isLast = computed(() => step.value >= stepNames.length - 1)

  function applySaveDraftMeta(r: {
    code?: string
    auditState?: string
    externalStatus?: string
    auditHint?: string
  }) {
    if (r.code) form.code = r.code
    if (r.auditState != null) form.auditState = String(r.auditState)
    if (r.externalStatus != null) form.externalStatus = String(r.externalStatus)
    if (r.auditHint != null) form.auditHint = String(r.auditHint)
  }

  function nextStep() {
    if (step.value < stepNames.length - 1) step.value += 1
  }
  function prevStep() {
    if (step.value > 0) step.value -= 1
  }

  async function saveDraft() {
    if (!canSaveDraft.value) {
      uni.showToast({ title: '当前状态不可保存', icon: 'none' })
      return
    }
    saving.value = true
    try {
      const payload = buildPropertySubmitPayload(form)
      const r = await postAction<{
        ok: boolean
        code?: string
        auditState?: string
        externalStatus?: string
        auditHint?: string
      }>('save-draft', payload)
      applySaveDraftMeta(r || {})
      if (form.code) markPropertyDetailStale(form.code)
      markListStale('my-published')
      markListStale('property-list')
      markWorkbenchStale()
      uni.showToast({
        title: auditState.value === 'live' ? '已保存修改' : '草稿已保存',
        icon: 'none',
      })
    } catch (e) {
      uni.showToast({ title: e instanceof Error ? e.message : '保存失败', icon: 'none' })
    } finally {
      saving.value = false
    }
  }

  async function submitFinal() {
    if (!canPublishForAudit.value) {
      uni.showToast({ title: '仅草稿或驳回状态可提交审核', icon: 'none' })
      return
    }
    const miss = collectPropertyRequiredMiss(form)
    if (miss.length) {
      uni.showToast({ title: `发布前请完善：${miss.join('、')}`, icon: 'none' })
      return
    }
    if (String(form.listTitle || '').length > 120) {
      uni.showToast({ title: '列表标题不超过 120 字', icon: 'none' })
      return
    }
    if (String(form.address || '').length > 200) {
      uni.showToast({ title: '详细地址不超过 200 字', icon: 'none' })
      return
    }
    if (!isPhone11Cn(String(form.contactPhone || ''))) {
      uni.showToast({ title: '联系人电话须为 11 位手机号', icon: 'none' })
      return
    }
    const auditOn = getSecuritySettingsSync().auditPublish
    const ok = await new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '确认发布',
        content: auditOn
          ? '提交后房源将进入「待审核」，管理员审核通过后将按「租售类型」设置对外状态（出租→待租，出售→待售，租售皆可→待租售，待开发→待开发）。'
          : '当前未开启发布审核，提交后将直接上架，对外状态按「租售类型」自动设置（含待开发→待开发）。',
        confirmText: '确认发布',
        cancelText: '取消',
        success: (res) => resolve(Boolean(res.confirm)),
        fail: () => resolve(false),
      })
    })
    if (!ok) return

    saving.value = true
    try {
      const payload = buildPropertySubmitPayload(form)
      if (!form.code) {
        const draft = await postAction<{ ok: boolean; code?: string }>('save-draft', payload)
        if (draft?.code) form.code = draft.code
      } else {
        await postAction('save-draft', { ...payload, code: form.code })
      }
      await postAction('submit-property', { ...payload, code: form.code } as Record<string, unknown>)
      if (form.code) markPropertyDetailStale(form.code)
      markListStale('my-published')
      markListStale('property-list')
      markWorkbenchStale()
      uni.showToast({ title: auditOn ? '已提交审核' : '已发布上架', icon: 'none' })
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

  return {
    step,
    title,
    showLeave,
    saving,
    uploading,
    uploadPercent,
    uploadLabel,
    form,
    propertyTypes,
    regionDefs,
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
    showFeaturedField,
    onFeaturedSwitch,
    auditState,
    statusDisplay,
    auditStatusClass,
    formReadonly,
    formLocked,
    canPublishForAudit,
    canSaveDraft,
    saveDraftLabel,
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
    reorderEditorImage,
    reorderEditorVideo,
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
    PHOTO_OPTIONS,
    STRUCTURE_OPTIONS,
    RIGHTS_OPTIONS,
    LAND_USE_OPTIONS,
    CERT_OPTIONS,
    FIRE_OPTIONS,
    DINING_OPTIONS,
    YES_NO,
    FIRE_PASS,
    DISCHARGE,
    SOLAR,
    RENT_SALE,
    MONITOR,
    RUSH_HOUR,
  }
}

export type PropertyPublishContext = ReturnType<typeof usePropertyPublishPage>

export const PROPERTY_PUBLISH_KEY: InjectionKey<PropertyPublishContext> = Symbol('propertyPublish')

export function usePropertyPublishInject() {
  const ctx = inject(PROPERTY_PUBLISH_KEY)
  if (!ctx) throw new Error('PropertyPublish: missing provider')
  return ctx
}
