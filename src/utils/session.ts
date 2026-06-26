/** WeChat scenes: opened from chat / App share card. */
const SHARE_CARD_SCENES = new Set([1007, 1008, 1036, 1044, 1179])

/** Icon / recent — redirect away from restored share-view only on these scenes. */
const DIRECT_MINI_ENTRY_SCENES = new Set([1023, 1089])

type EnterLike = {
  path?: string
  scene?: number
  query?: Record<string, string | undefined>
  shareTicket?: string
}

function normalizePath(path: string | undefined): string {
  return String(path || '').replace(/^\//, '')
}

function readEnterOptions(fallback?: EnterLike): EnterLike | undefined {
  try {
    const uniAny = uni as typeof uni & { getEnterOptionsSync?: () => EnterLike }
    return fallback ?? uniAny.getEnterOptionsSync?.() ?? uni.getLaunchOptionsSync?.()
  } catch {
    return fallback
  }
}

export function isShareViewLaunchPath(path: string | undefined): boolean {
  return normalizePath(path).includes('share-view')
}

/** True when the top page is the token-based public share gallery (no login redirect). */
export function isPublicSharePage(): boolean {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    return String(cur?.route || '').includes('property/share-view')
  } catch {
    return false
  }
}

export function isShareCardScene(scene: number): boolean {
  return SHARE_CARD_SCENES.has(Number(scene))
}

/** Hide WeChat share menu (uni types vs wx runtime differ). */
export function hideWeixinShareMenu() {
  // #ifdef MP-WEIXIN
  uni.hideShareMenu({
    hideShareItems: [],
    menus: ['shareAppMessage', 'shareTimeline'],
  } as UniNamespace.HideShareMenuOptions)
  // #endif
}

/** Cold start targets share-view — skip login auto-jump and staff session refresh. */
export function isPublicShareLaunch(launchOptions?: EnterLike): boolean {
  try {
    const launch = readEnterOptions(launchOptions)
    if (!launch) return false
    if (isShareViewLaunchPath(launch.path)) return true
    const scene = Number(launch.scene ?? 0)
    return isShareCardScene(scene)
  } catch {
    return false
  }
}

/** Login page: do not reLaunch home when cold start is a share deep link. */
export function shouldSkipLoginSessionRestore(launchOptions?: EnterLike): boolean {
  return isPublicShareLaunch(launchOptions)
}

export function homeOrLoginUrl(): string {
  const token = uni.getStorageSync('mini_token')
  return token ? '/pages/home/home' : '/pages/login/login'
}

/**
 * Icon / recent entry while share-view is on screen — go home/login.
 * Only call from App.onShow; never block share-card cold start.
 */
export function redirectShareViewOnDirectEntry() {
  try {
    if (!isPublicSharePage()) return
    const enter = readEnterOptions()
    const scene = Number(enter?.scene ?? 0)
    if (!DIRECT_MINI_ENTRY_SCENES.has(scene)) return
    uni.reLaunch({ url: homeOrLoginUrl() })
  } catch {
    /* ignore */
  }
}

/** Clear stored mini session and return user to login (avoid duplicate redirects). */
let redirecting = false

/** Tab pages: require mini_token before loading data. */
export function ensureMiniSession(): boolean {
  const token = uni.getStorageSync('mini_token')
  if (token) return true
  clearMiniSessionAndGoLogin('请先登录')
  return false
}

export function clearMiniSessionAndGoLogin(reason?: string) {
  if (isPublicSharePage()) return

  uni.removeStorageSync('mini_token')
  uni.removeStorageSync('mini_session_expires_at')
  if (redirecting) return
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as { route?: string } | undefined
  if (cur?.route?.includes('login')) return
  redirecting = true
  const title =
    reason && String(reason).trim()
      ? String(reason).trim()
      : '登录已失效（未读取到服务端说明，可能被网关改写 401 响应体）'
  uni.showToast({ title, icon: 'none', duration: 2500 })
  setTimeout(() => {
    if (isPublicSharePage()) {
      redirecting = false
      return
    }
    uni.reLaunch({ url: '/pages/login/login' })
    redirecting = false
  }, 400)
}

/** Resolve share token from page query and launch/enter options. */
export function resolveSharePageToken(
  pageQuery?: Record<string, string | undefined>,
  launchOptions?: EnterLike,
): string {
  const read = (q: Record<string, string | undefined> | undefined) => {
    if (!q) return ''
    let raw = String(q.token ?? '').trim()
    if (!raw) {
      const scene = String(q.scene ?? '').trim()
      if (scene) {
        const decoded = decodeURIComponent(scene)
        const m = decoded.match(/(?:^|[?&])token=([^&]+)/)
        raw = m ? m[1] : decoded
      }
    }
    if (!raw) return ''
    try {
      return decodeURIComponent(raw).trim()
    } catch {
      return raw.trim()
    }
  }

  const fromPage = read(pageQuery)
  if (fromPage) return fromPage

  const launch = readEnterOptions(launchOptions)
  const fromLaunch = read(launch?.query)
  if (fromLaunch) return fromLaunch

  return ''
}
