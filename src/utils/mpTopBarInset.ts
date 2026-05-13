/** WeChat MP: reserve top + right inset for status bar and capsule (custom navigationBar). */

export type MpTopBarInset = {
  paddingTop: number
  paddingRight: number
}

function readInset(): MpTopBarInset {
  const sys = uni.getSystemInfoSync()
  const w = Number(sys.windowWidth) || 375
  const sb = Number(sys.statusBarHeight) || 24

  let paddingTop = Math.max(sb + 8, 48)
  let paddingRight = 12 + 96

  const uniAny = uni as {
    getMenuButtonBoundingClientRect?: () => {
      top: number
      left: number
      right: number
      bottom: number
      width: number
      height: number
    }
  }
  if (typeof uniAny.getMenuButtonBoundingClientRect === 'function') {
    try {
      const mb = uniAny.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.top === 'number' && mb.top > 0 && typeof mb.left === 'number' && mb.left > 0) {
        // Inner content must stay left of capsule: paddingRight >= screenWidth - menuButton.left + gap
        paddingRight = Math.max(96, Math.ceil(w - mb.left + 10))
        paddingTop = Math.max(Math.ceil(mb.top), sb)
      }
    } catch {
      /* ignore */
    }
  }

  return { paddingTop, paddingRight }
}

/**
 * Read fresh each call so capsule metrics are correct after first paint (no stale module cache).
 * Call from computed() so each access updates when Vue re-evaluates (still one read per render).
 */
export function getMpTopBarInset(): MpTopBarInset {
  return readInset()
}

/** Reserved for future (rotation); insets are not module-cached. */
export function clearMpTopBarInsetCache() {
  /* no-op */
}

export function mpTopBarInsetStyle(): Record<string, string> {
  const x = getMpTopBarInset()
  return {
    paddingTop: `${x.paddingTop}px`,
    paddingRight: `${x.paddingRight}px`,
    boxSizing: 'border-box',
  }
}
