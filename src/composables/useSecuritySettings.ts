import { computed, onMounted, ref } from 'vue'
import {
  getSecuritySettingsSync,
  preloadSecuritySettings,
  setSecuritySettingsCache,
} from '@/utils/securitySettingsCache'
import type { SecuritySettings } from '@/types/user'

/** Reactive security policy for pages (preload in App.vue onLaunch). */
export function useSecuritySettings() {
  const settings = ref<SecuritySettings>(getSecuritySettingsSync())

  onMounted(() => {
    void preloadSecuritySettings().then((s) => {
      settings.value = s
    })
  })

  const forbidLongPressCopy = computed(() => settings.value.forbidLongPressCopy)
  const noCopyClass = computed(() => (forbidLongPressCopy.value ? 'security-no-copy' : ''))

  function applySaved(next: SecuritySettings) {
    setSecuritySettingsCache(next)
    settings.value = next
  }

  return {
    settings,
    forbidLongPressCopy,
    noCopyClass,
    applySaved,
    refresh: () => preloadSecuritySettings(true),
  }
}
