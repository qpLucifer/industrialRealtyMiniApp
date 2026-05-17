/**
 * Remove stale mp-weixin output when possible (WeChat DevTools may lock the folder).
 */
const fs = require('node:fs')
const path = require('node:path')

const out = path.join(__dirname, '../dist/build/mp-weixin')
const staleComponents = path.join(out, 'components')

try {
  if (fs.existsSync(staleComponents)) {
    fs.rmSync(staleComponents, { recursive: true, force: true })
    console.log('[clean-mp-weixin-dist] removed dist/build/mp-weixin/components')
  }
} catch (e) {
  console.warn('[clean-mp-weixin-dist] could not remove components (close WeChat DevTools?):', e.message)
}

try {
  if (fs.existsSync(out)) {
    fs.rmSync(out, { recursive: true, force: true })
    console.log('[clean-mp-weixin-dist] removed dist/build/mp-weixin')
  }
} catch (e) {
  console.warn(
    '[clean-mp-weixin-dist] full clean skipped — close DevTools if previewing, then rebuild. Stub shims will still run.',
  )
}
