/** Keep in sync with industrialRealtyServer/src/lib/uploadPolicy.js */

export const MAX_IMAGE_BYTES = 50 * 1024 * 1024
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024
export const MAX_AUDIO_BYTES = 20 * 1024 * 1024
export const MAX_IMAGES_PER_PICK = 5
export const MAX_VIDEOS_PER_PICK = 1
export const MAX_AUDIOS_PER_FOLLOW = 3
export const MULTIPART_CHUNK_BYTES = 5 * 1024 * 1024

export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
]

export function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))}MB`
  if (n >= 1024) return `${Math.round(n / 1024)}KB`
  return `${n}B`
}
