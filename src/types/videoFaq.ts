export interface VideoFaqItem {
  id: string
  keywords: string
  meta: string
  title: string
  summary: string
  videoPath?: string
  /** Absolute play URL from API (OSS_PUBLIC_BASE_URL + video_path) */
  playUrl?: string
}
