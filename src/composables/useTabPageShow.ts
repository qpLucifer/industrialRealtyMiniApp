import { onShow } from '@dcloudio/uni-app'
import { ensureMiniSession } from '@/utils/session'

type TabPageShowOptions = {
  /** Redirect to login when mini_token is missing (tab pages). */
  requireAuth?: boolean
}

/**
 * Run load when the page becomes visible (including first entry).
 * Use onShow only: on first paint uni-app fires onShow before Vue onMounted,
 * so pairing onMounted + onShow duplicates requests.
 */
export function useTabPageShow(load: () => void | Promise<void>, opts?: TabPageShowOptions) {
  onShow(() => {
    void (async () => {
      if (opts?.requireAuth && !ensureMiniSession()) return
      await load()
    })()
  })
}
