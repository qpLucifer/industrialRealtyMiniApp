/** Clear stored mini session and return user to login (avoid duplicate redirects). */
let redirecting = false

export function clearMiniSessionAndGoLogin(reason?: string) {
  uni.removeStorageSync('mini_token')
  uni.removeStorageSync('mini_session_expires_at')
  if (redirecting) return
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as { route?: string } | undefined
  if (cur?.route?.includes('login')) return
  redirecting = true
  const title = reason && String(reason).trim() ? String(reason).trim() : '登录已失效，请重新登录'
  uni.showToast({ title, icon: 'none', duration: 2500 })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/login' })
    redirecting = false
  }, 400)
}
