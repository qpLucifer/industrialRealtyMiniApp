<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { refreshMiniSession } from '@/api/session'

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

onLaunch(async () => {
  const token = uni.getStorageSync('mini_token')
  if (USE_MOCK || !token) return
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
