<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { refreshMiniSession } from '@/api/session'
import { isIndustrialMiniSessionToken } from '@/utils/miniSessionToken'
import { preloadSecuritySettings } from '@/utils/securitySettingsCache'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

onLaunch(async () => {
  void preloadSecuritySettings()
  const token = uni.getStorageSync('mini_token')
  if (USE_MOCK || !token) return
  if (typeof token === 'string' && !isIndustrialMiniSessionToken(token)) {
    uni.removeStorageSync('mini_token')
    uni.removeStorageSync('mini_session_expires_at')
    uni.removeStorageSync('mini_profile_json')
    return
  }
  try {
    const r = await refreshMiniSession()
    uni.setStorageSync('mini_token', r.token)
    if (r.expiresAt) uni.setStorageSync('mini_session_expires_at', r.expiresAt)
  } catch {
    // 401: request layer clears session and returns to login
  }
})
</script>

<style src="@/styles/prototype.css"></style>
<style src="@/styles/brand-theme.css"></style>
<style src="@/styles/layout-refine.css"></style>
<style src="@/styles/glass-list-cards.css"></style>
<style src="@/styles/property-pages.css"></style>
<style src="@/styles/property-form-ui.css"></style>
<style src="@/styles/security.css"></style>
<style src="@/styles/customer-form.css"></style>
