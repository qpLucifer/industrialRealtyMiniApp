import { onMounted, onUnmounted, ref } from 'vue'

/** Extra bottom padding while keyboard is open — keeps focused field above footer/overlap. */
export function useKeyboardScrollPad() {
  const keyboardPadPx = ref(0)

  onMounted(() => {
    uni.onKeyboardHeightChange((res) => {
      keyboardPadPx.value = res.height > 0 ? res.height : 0
    })
  })

  onUnmounted(() => {
    try {
      uni.offKeyboardHeightChange?.()
    } catch {
      /* ignore */
    }
  })

  return { keyboardPadPx }
}
