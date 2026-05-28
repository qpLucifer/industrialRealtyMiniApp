import type { PropertyEditForm } from '@/types/property'
import { parseMediaLines } from '@/utils/request'

export const PHOTO_OPTIONS = ['门口形象照', '路口进出照', '车间照片', '货梯', '厂房屋顶'] as const
export const STRUCTURE_OPTIONS = ['钢构', '混凝土', '其他'] as const
export const RIGHTS_OPTIONS = ['国有土地', '出让', '划拨', '集体土地', '其他'] as const
export const LAND_USE_OPTIONS = ['工业', '仓储', '其他'] as const
export const CERT_OPTIONS = ['房产证', '土地证', '消防验收证', '环保批文'] as const
export const FIRE_OPTIONS = ['喷淋', '烟感', '消防栓', '其他'] as const
export const DINING_OPTIONS = ['集中', '分散', '缺乏'] as const
export const YES_NO = ['无', '有'] as const
export const FIRE_PASS = ['是', '否'] as const
export const DISCHARGE = ['有', '无'] as const
export const SOLAR = ['可接入', '不可接入'] as const
export const RENT_SALE = ['出租', '出售', '租售皆可', '待开发'] as const
export const MONITOR = ['全厂区', '部分区域'] as const
export const RUSH_HOUR = ['无', '轻度', '严重'] as const
export const FALLBACK_PROPERTY_TYPES = ['标准厂房', '独门独院厂房', '仓库', '工业用地', '写字楼', '产业园商铺']
export const PUBLISH_STEP_NAMES = ['基础分类', '地图定位', '图片视频', '土地建筑', '电力配套', '产权合规', '政策亮点', '挂牌联系'] as const

export type PickerChange = { detail: { value: string | number } }

export function isPhone11Cn(phone: string) {
  return /^1\d{10}$/.test(String(phone || '').trim())
}

export function collectPropertyRequiredMiss(form: PropertyEditForm): string[] {
  const miss: string[] = []
  if (!String(form.listTitle || '').trim()) miss.push('列表标题')
  if (!Array.isArray(form.types) || !form.types.length) miss.push('房源类型')
  if (!String(form.address || '').trim()) miss.push('详细地址')
  const district = String(form.district || '').trim()
  if (!district || district === '未分区') miss.push('所属区域')
  if (!String(form.lat || '').trim() || !String(form.lng || '').trim()) miss.push('地图坐标（GCJ-02 纬经度）')
  if (!Array.isArray(form.photoChecklist) || !form.photoChecklist.length) miss.push('现场必拍清单')
  const hasImg = parseMediaLines(form.mediaImageUrls).length > 0
  const hasVid = parseMediaLines(form.mediaVideoUrls).length > 0
  if (!hasImg && !hasVid) miss.push('图片或视频（至少一类）')
  if (form.landMu == null || Number(form.landMu) <= 0) miss.push('土地（亩）')
  if (form.powerKva == null || Number(form.powerKva) <= 0) miss.push('电力总容量')
  if (!String(form.rentSaleType || '').trim()) miss.push('租售类型')
  if (!String(form.contactName || '').trim()) miss.push('联系人姓名')
  if (!String(form.contactPhone || '').trim()) miss.push('联系人电话')
  return miss
}

export function toggleFormArr(arr: string[], v: string, min = 0) {
  const i = arr.indexOf(v)
  if (i >= 0) {
    if (arr.length > min) arr.splice(i, 1)
  } else {
    arr.push(v)
  }
}

export function pickerIdx(range: readonly string[], val: string) {
  const i = range.indexOf(val)
  return i >= 0 ? i : 0
}

export function parseCoord(v: unknown) {
  const n = Number.parseFloat(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

export function pickFromRange(range: readonly string[], e: PickerChange, set: (v: string) => void) {
  const i = Number(e.detail.value)
  if (range[i] != null) set(range[i])
}
