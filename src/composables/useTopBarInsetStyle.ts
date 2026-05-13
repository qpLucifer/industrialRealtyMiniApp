import { computed } from 'vue'
import { getMpTopBarInset } from '@/utils/mpTopBarInset'

/** Bind to `<view class="top-bar" :style="topBarInsetStyle">` on custom nav pages. */
export function useTopBarInsetStyle() {
  return computed(() => {
    const x = getMpTopBarInset()
    return {
      paddingTop: `${x.paddingTop}px`,
      paddingRight: `${x.paddingRight}px`,
      boxSizing: 'border-box',
    } as Record<string, string>
  })
}
