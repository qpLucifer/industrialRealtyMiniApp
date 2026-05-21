import { fetchSecuritySettings } from '@/api/user'
import type { SecuritySettings } from '@/types/user'

const STORAGE_KEY = 'mini_security_settings_v1'

const DEFAULTS: SecuritySettings = {
  maskPropertyContact: true,
  maskCustomerPhone: true,
  forbidLongPressCopy: true,
  auditPublish: false,
}

let memory: SecuritySettings | null = null
let inflight: Promise<SecuritySettings> | null = null

function readStorage(): SecuritySettings | null {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw || typeof raw !== 'object') return null
    const o = raw as Record<string, unknown>
    return {
      maskPropertyContact: !!o.maskPropertyContact,
      maskCustomerPhone: !!o.maskCustomerPhone,
      forbidLongPressCopy: !!o.forbidLongPressCopy,
      auditPublish: o.auditPublish !== false,
    }
  } catch {
    return null
  }
}

function writeStorage(s: SecuritySettings) {
  try {
    uni.setStorageSync(STORAGE_KEY, s)
  } catch {
    /* ignore */
  }
}

export function getSecuritySettingsSync(): SecuritySettings {
  return memory ?? readStorage() ?? { ...DEFAULTS }
}

export function setSecuritySettingsCache(s: SecuritySettings) {
  memory = { ...s }
  writeStorage(s)
}

/** Load from API (deduped); falls back to storage/defaults on failure. */
export async function preloadSecuritySettings(force = false): Promise<SecuritySettings> {
  if (!force && memory) return memory
  if (!force && inflight) return inflight
  inflight = (async () => {
    try {
      const s = await fetchSecuritySettings()
      setSecuritySettingsCache(s)
      return s
    } catch {
      const cached = readStorage()
      if (cached) {
        memory = cached
        return cached
      }
      memory = { ...DEFAULTS }
      return memory
    } finally {
      inflight = null
    }
  })()
  return inflight
}
