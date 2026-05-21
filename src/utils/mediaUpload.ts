import { API_BASE, post } from '@/utils/request'
import { unwrapResult } from '@/utils/result'
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PICK,
  MAX_VIDEO_BYTES,
  MULTIPART_CHUNK_BYTES,
  formatBytes,
} from '@/utils/mediaUploadPolicy'

export type BatchUploadItem = { name: string; ok: boolean; url?: string; error?: string }
export type BatchUploadSummary = { succeeded: BatchUploadItem[]; failed: BatchUploadItem[] }

function miniAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'X-Client': 'miniapp' }
  const token = uni.getStorageSync('mini_token')
  if (token && typeof token === 'string') {
    headers.Authorization = `Bearer ${token}`
    headers['X-Mini-Token'] = token
  }
  return headers
}

function parseUploadError(res: UniApp.UploadFileSuccessCallbackResult): string {
  const sc = res.statusCode ?? 0
  let msg = `上传失败 (${sc})`
  try {
    const body = JSON.parse(res.data as string) as { message?: string }
    if (body.message) msg = body.message
  } catch {
    /* ignore */
  }
  return msg
}

export function uploadImagePath(
  filePath: string,
  folder: string,
  displayName = 'image',
): Promise<{ url: string; key: string }> {
  if (!API_BASE) return Promise.reject(new Error('未配置 VITE_API_BASE'))
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE}/api/upload/oss`,
      filePath,
      name: 'file',
      formData: { folder },
      header: miniAuthHeaders(),
      timeout: 120000,
      success(res) {
        try {
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(parseUploadError(res)))
            return
          }
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          resolve(unwrapResult<{ url: string; key: string }>(data))
        } catch (e) {
          reject(e instanceof Error ? e : new Error(`${displayName} 上传失败`))
        }
      },
      fail(err) {
        reject(err ?? new Error(`${displayName} 上传失败`))
      },
    })
  })
}

function validateImageMeta(size: number, name: string): string | null {
  if (size > MAX_IMAGE_BYTES) return `「${name}」超过 ${formatBytes(MAX_IMAGE_BYTES)}`
  return null
}

/** Batch upload with per-file try/catch. */
export async function uploadImagesFromPaths(
  items: { path: string; name: string; size: number }[],
  folder: string,
  onProgress?: (done: number, total: number) => void,
): Promise<BatchUploadSummary> {
  if (items.length > MAX_IMAGES_PER_PICK) {
    throw new Error(`一次最多上传 ${MAX_IMAGES_PER_PICK} 张图片`)
  }
  const succeeded: BatchUploadItem[] = []
  const failed: BatchUploadItem[] = []
  const total = items.length
  let done = 0
  for (const item of items) {
    const pre = validateImageMeta(item.size, item.name)
    if (pre) {
      failed.push({ name: item.name, ok: false, error: pre })
      done++
      onProgress?.(done, total)
      continue
    }
    try {
      const { url } = await uploadImagePath(item.path, folder, item.name)
      succeeded.push({ name: item.name, ok: true, url })
    } catch (e) {
      failed.push({
        name: item.name,
        ok: false,
        error: e instanceof Error ? e.message : '上传失败',
      })
    }
    done++
    onProgress?.(done, total)
  }
  return { succeeded, failed }
}

type MultipartInit = { sessionId: string; chunkSize: number; totalParts: number }

async function initVideoMultipart(
  filePath: string,
  size: number,
  folder: string,
  mimeType: string,
): Promise<MultipartInit> {
  const data = await post<MultipartInit>('/api/upload/oss/multipart/init', {
    filename: filePath.split('/').pop() || 'video.mp4',
    mimeType: mimeType || 'video/mp4',
    size,
    folder,
  })
  return data
}

function readFileChunk(filePath: string, position: number, length: number): Promise<ArrayBuffer> {
  const fs = uni.getFileSystemManager()
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      position,
      length,
      success: (res) => {
        const data = res.data
        if (data instanceof ArrayBuffer) resolve(data)
        else reject(new Error('分片读取失败'))
      },
      fail: (err) => reject(err ?? new Error('分片读取失败')),
    })
  })
}

function userDataDir(): string {
  type WxUniGlobal = {
    wx?: { env?: { USER_DATA_PATH?: string } }
    uni?: { env?: { USER_DATA_PATH?: string } }
  }
  const g = globalThis as WxUniGlobal
  return g.wx?.env?.USER_DATA_PATH || g.uni?.env?.USER_DATA_PATH || ''
}

function writeTempChunk(data: ArrayBuffer, partNumber: number): Promise<string> {
  const fs = uni.getFileSystemManager()
  const base = userDataDir()
  const tempPath = base
    ? `${base}/upload-chunk-${Date.now()}-${partNumber}.bin`
    : `_upload_chunk_${Date.now()}_${partNumber}.bin`
  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath: tempPath,
      data,
      success: () => resolve(tempPath),
      fail: (err) => reject(err ?? new Error('写入临时分片失败')),
    })
  })
}

function uploadChunkPath(
  tempPath: string,
  sessionId: string,
  partNumber: number,
): Promise<void> {
  if (!API_BASE) return Promise.reject(new Error('未配置 VITE_API_BASE'))
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE}/api/upload/oss/multipart/part`,
      filePath: tempPath,
      name: 'chunk',
      formData: { sessionId, partNumber: String(partNumber) },
      header: miniAuthHeaders(),
      timeout: 180000,
      success(res) {
        if ((res.statusCode ?? 0) >= 400) {
          reject(new Error(parseUploadError(res)))
          return
        }
        resolve()
      },
      fail: (err) => reject(err ?? new Error('分片上传失败')),
    })
  })
}

async function completeMultipart(sessionId: string): Promise<{ url: string; key: string }> {
  return post<{ url: string; key: string }>('/api/upload/oss/multipart/complete', { sessionId })
}

export async function uploadVideoFromPath(
  filePath: string,
  size: number,
  folder: string,
  mimeType = 'video/mp4',
  onProgress?: (percent: number) => void,
): Promise<{ url: string; key: string }> {
  if (size > MAX_VIDEO_BYTES) {
    throw new Error(`视频不能超过 ${formatBytes(MAX_VIDEO_BYTES)}`)
  }
  const { sessionId, chunkSize } = await initVideoMultipart(filePath, size, folder, mimeType)
  const chunk = chunkSize > 0 ? chunkSize : MULTIPART_CHUNK_BYTES
  let offset = 0
  let partNumber = 1
  const fs = uni.getFileSystemManager()

  while (offset < size) {
    const len = Math.min(chunk, size - offset)
    const buf = await readFileChunk(filePath, offset, len)
    const tempPath = await writeTempChunk(buf, partNumber)
    try {
      await uploadChunkPath(tempPath, sessionId, partNumber)
    } finally {
      try {
        fs.unlink({ filePath: tempPath })
      } catch {
        /* ignore */
      }
    }
    offset += len
    partNumber += 1
    onProgress?.(Math.min(99, Math.round((offset / size) * 100)))
  }

  const result = await completeMultipart(sessionId)
  onProgress?.(100)
  return result
}

export function formatBatchUploadToast(summary: BatchUploadSummary): string {
  const { succeeded, failed } = summary
  if (!failed.length) return `已成功上传 ${succeeded.length} 张图片`
  if (!succeeded.length) return failed[0]?.error || '图片上传失败'
  return `成功 ${succeeded.length} 张，失败 ${failed.length} 张`
}
