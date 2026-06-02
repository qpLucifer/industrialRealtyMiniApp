<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavIconBar from '@/components/NavIconBar.vue'
import FollowAudioPlayer from '@/components/FollowAudioPlayer.vue'
import { parsePropertyRouteKey, postPropertyFollowUp } from '@/api/property'
import { markPropertyLogStale } from '@/utils/propertyNav'
import type { PropertyFollowUpPayload } from '@/types/property'
import { nowBeijingYmdHm } from '@/utils/beijingTime'
import {
  FOLLOW_UPLOAD_FOLDER,
  MAX_FOLLOW_IMAGES,
  MAX_FOLLOW_IMAGES_PER_PICK,
} from '@/utils/propertyFollowTimeline'
import { uploadAudioPath, uploadImagePath } from '@/utils/mediaUpload'
import { MAX_AUDIO_BYTES, formatBytes } from '@/utils/mediaUploadPolicy'
import { resolveMediaUrl } from '@/utils/request'

const code = ref('')
const followNote = ref('')
const followImageUrls = ref<string[]>([])
const followAudioUrls = ref<string[]>([])
const saving = ref(false)
const uploadingImages = ref(false)
const uploadingAudio = ref(false)
const occurredDate = ref('')
const occurredTime = ref('')

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.aac', '.wav', '.webm']

function parseNow() {
  const now = nowBeijingYmdHm()
  const m = now.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)
  if (m) {
    occurredDate.value = m[1]
    occurredTime.value = m[2]
  }
}

onLoad((q) => {
  code.value = parsePropertyRouteKey(q)
  parseNow()
})

function back() {
  uni.navigateBack()
}

function occurredAtPayload() {
  return `${occurredDate.value} ${occurredTime.value}`
}

function mediaSrc(url: string) {
  return resolveMediaUrl(url)
}

function removeImage(idx: number) {
  followImageUrls.value = followImageUrls.value.filter((_, i) => i !== idx)
}

function imageBatchCount() {
  const remain = MAX_FOLLOW_IMAGES - followImageUrls.value.length
  return Math.max(0, Math.min(MAX_FOLLOW_IMAGES_PER_PICK, remain))
}

async function pickFollowImages() {
  if (uploadingImages.value || saving.value) return
  const batch = imageBatchCount()
  if (batch <= 0) {
    uni.showToast({ title: `单条跟进最多 ${MAX_FOLLOW_IMAGES} 张图片`, icon: 'none' })
    return
  }
  uni.chooseImage({
    count: batch,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const paths = res.tempFilePaths || []
      if (!paths.length) return
      uploadingImages.value = true
      try {
        for (const path of paths) {
          const { url } = await uploadImagePath(path, FOLLOW_UPLOAD_FOLDER)
          followImageUrls.value = [...followImageUrls.value, url]
        }
        uni.showToast({ title: '图片已上传', icon: 'none' })
      } catch (e) {
        uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
      } finally {
        uploadingImages.value = false
      }
    },
  })
}

function resolveFileSize(path: string, reported: number): Promise<number> {
  if (reported > 0) return Promise.resolve(reported)
  return new Promise((resolve, reject) => {
    uni.getFileInfo({
      filePath: path,
      success: (res) => {
        const n = Number(res.size)
        if (Number.isFinite(n) && n > 0) resolve(n)
        else reject(new Error('无法读取文件大小'))
      },
      fail: () => reject(new Error('无法读取文件大小')),
    })
  })
}

function ensureAudioFilename(name: string, filePath: string) {
  let n = String(name || '').trim() || 'audio.mp3'
  if (/\.(mp3|m4a|aac|wav|webm)$/i.test(n)) return n
  const m = String(filePath || '').match(/\.(mp3|m4a|aac|wav|webm)$/i)
  if (m) return `audio.${m[1].toLowerCase()}`
  return `${n.replace(/\.\w+$/, '') || 'audio'}.mp3`
}

async function uploadAudioFiles(files: { path: string; name: string; size: number }[]) {
  if (!files.length || uploadingAudio.value) return
  uploadingAudio.value = true
  try {
    for (const file of files) {
      const size = await resolveFileSize(file.path, file.size)
      if (size > MAX_AUDIO_BYTES) {
        throw new Error(`「${file.name}」超过 ${formatBytes(MAX_AUDIO_BYTES)}`)
      }
      const uploadName = ensureAudioFilename(file.name, file.path)
      const { url } = await uploadAudioPath(file.path, FOLLOW_UPLOAD_FOLDER, uploadName)
      followAudioUrls.value = [...followAudioUrls.value, url]
    }
    uni.showToast({ title: '音频已上传', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '上传失败', icon: 'none' })
  } finally {
    uploadingAudio.value = false
  }
}

function pickFollowAudio() {
  if (uploadingAudio.value || saving.value) return
  uni.chooseMessageFile({
    count: MAX_FOLLOW_IMAGES_PER_PICK,
    type: 'file',
    extension: AUDIO_EXTENSIONS,
    success: (res) => {
      const files = (res.tempFiles || []).map((f) => ({
        path: f.path,
        name: f.name || 'audio',
        size: Number(f.size) || 0,
      }))
      void uploadAudioFiles(files)
    },
    fail: () => {
      uni.showToast({ title: '请选择音频文件（mp3/m4a 等）', icon: 'none' })
    },
  })
}

function removeAudio(idx: number) {
  followAudioUrls.value = followAudioUrls.value.filter((_, i) => i !== idx)
}

function onOccurredDateChange(e: { detail: { value: string } }) {
  occurredDate.value = e.detail.value
}

function onOccurredTimeChange(e: { detail: { value: string } }) {
  occurredTime.value = e.detail.value
}

async function onSaveFollow() {
  if (!code.value || saving.value) return
  const hasContent =
    followNote.value.trim() || followImageUrls.value.length || followAudioUrls.value.length
  if (!hasContent) {
    uni.showToast({ title: '请填写内容或上传图片/音频', icon: 'none' })
    return
  }
  if (!occurredDate.value.trim() || !occurredTime.value.trim()) {
    uni.showToast({ title: '请选择跟进日期与时刻', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const payload: PropertyFollowUpPayload = {
      code: code.value,
      note: followNote.value.trim(),
      occurredAt: occurredAtPayload(),
    }
    if (followImageUrls.value.length) payload.imageUrls = [...followImageUrls.value]
    if (followAudioUrls.value.length) payload.audioUrls = [...followAudioUrls.value]
    await postPropertyFollowUp(payload)
    markPropertyLogStale(code.value)
    uni.showToast({ title: '跟进已保存', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {
    uni.showToast({ title: e instanceof Error ? e.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="app-shell">
    <view class="page-frame screen active screen--sub">
      <NavIconBar title="写跟进" @back="back" />
      <scroll-view scroll-y :show-scrollbar="false" class="page-scroll customer-form-scroll">
        <view class="page-scroll__inner">
          <view class="card customer-form">
            <view class="form-group">
              <text class="label">跟进内容</text>
              <textarea
                v-model="followNote"
                class="field-textarea"
                placeholder="现场情况、客户反馈、下一步（可与图片/音频组合）"
                :maxlength="2000"
                :cursor-spacing="120"
                :show-confirm-bar="true"
                :adjust-position="true"
                :auto-height="false"
              />
            </view>
            <view class="form-group">
              <text class="label">跟进图片（可选，单次最多 {{ MAX_FOLLOW_IMAGES_PER_PICK }} 张，可多次添加）</text>
              <view class="follow-media-grid">
                <view v-for="(url, idx) in followImageUrls" :key="url" class="follow-media-thumb">
                  <image :src="mediaSrc(url)" mode="aspectFill" class="follow-media-img" />
                  <text class="follow-media-remove" @tap="removeImage(idx)">×</text>
                </view>
                <view
                  v-if="followImageUrls.length < MAX_FOLLOW_IMAGES"
                  class="follow-media-add"
                  @tap="pickFollowImages"
                >
                  <text>{{ uploadingImages ? '上传中…' : '＋ 图片' }}</text>
                </view>
              </view>
            </view>
            <view class="form-group">
              <text class="label">跟进音频（可选，上传 mp3/m4a 等文件）</text>
              <button class="btn-secondary follow-upload-btn" :disabled="uploadingAudio || saving" @click="pickFollowAudio">
                {{ uploadingAudio ? '上传中…' : '选择音频文件' }}
              </button>
              <view v-for="(url, idx) in followAudioUrls" :key="url" class="follow-audio-list">
                <FollowAudioPlayer :src="url" :label="`语音 ${idx + 1}`" removable @remove="removeAudio(idx)" />
              </view>
            </view>
            <view class="form-group">
              <text class="label">跟进日期<text class="req">*</text></text>
              <picker mode="date" :value="occurredDate" @change="onOccurredDateChange">
                <view class="picker-like">{{ occurredDate || '请选择日期' }}</view>
              </picker>
            </view>
            <view class="form-group">
              <text class="label">跟进时刻<text class="req">*</text></text>
              <picker mode="time" :value="occurredTime" @change="onOccurredTimeChange">
                <view class="picker-like">{{ occurredTime || '请选择时刻' }}</view>
              </picker>
            </view>
            <button class="btn-primary follow-save" :disabled="saving" @click="onSaveFollow">
              {{ saving ? '保存中…' : '保存跟进' }}
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.customer-form-scroll { flex: 1; min-height: 0; height: 0; }
.page-scroll__inner { padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }
.customer-form .form-group picker { display: block; width: 100%; box-sizing: border-box; }
.customer-form .picker-like { width: 100%; box-sizing: border-box; }
.follow-save { width: 100%; margin-top: 16rpx; }
.follow-media-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.follow-media-thumb, .follow-media-add { position: relative; width: 160rpx; height: 160rpx; border-radius: 12rpx; overflow: hidden; background: #f1f5f9; }
.follow-media-img { width: 100%; height: 100%; }
.follow-media-remove { position: absolute; top: 4rpx; right: 8rpx; width: 40rpx; height: 40rpx; line-height: 40rpx; text-align: center; border-radius: 999rpx; background: rgba(15, 23, 42, 0.55); color: #fff; font-size: 28rpx; }
.follow-media-add { display: flex; align-items: center; justify-content: center; border: 2rpx dashed #cbd5e1; color: #64748b; font-size: 26rpx; }
.follow-upload-btn { width: 100%; font-size: 28rpx; margin-bottom: 12rpx; }
.follow-audio-list { margin-top: 12rpx; }
</style>
