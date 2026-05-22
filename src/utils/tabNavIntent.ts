/** One-shot navigation intent when switching tab or opening a list from home stats. */

export type TabNavIntent =
  | { kind: 'property'; available?: boolean }
  | { kind: 'customer' }
  | { kind: 'viewing'; thisWeek?: boolean }

const KEY = 'mini_tab_nav_intent'

export function setTabNavIntent(intent: TabNavIntent) {
  try {
    uni.setStorageSync(KEY, JSON.stringify(intent))
  } catch {
    /* ignore */
  }
}

export function consumeTabNavIntent(): TabNavIntent | null {
  try {
    const raw = uni.getStorageSync(KEY)
    if (raw) uni.removeStorageSync(KEY)
    if (!raw) return null
    const parsed = JSON.parse(String(raw)) as TabNavIntent
    if (!parsed || typeof parsed !== 'object' || !('kind' in parsed)) return null
    return parsed
  } catch {
    return null
  }
}
