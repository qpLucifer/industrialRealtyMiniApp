import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ensureMiniSession } from '@/utils/session'

type TabPageShowOptions = {
  /** Redirect to login when mini_token is missing (tab pages). */
  requireAuth?: boolean
}

/**
 * Avoid duplicate fetch on first paint: onMounted runs once, the immediate onShow is skipped.
 * Later tab switches still invoke onShow.
 */
export function useTabPageShow(load: () => void | Promise<void>, opts?: TabPageShowOptions) {
  const skipNextShow = ref(false)

  async function run() {
    if (opts?.requireAuth && !ensureMiniSession()) return
    await load()
  }

  onMounted(() => {
    skipNextShow.value = true
    void run()
  })

  onShow(() => {
    if (skipNextShow.value) {
      skipNextShow.value = false
      return
    }
    void run()
  })
}
