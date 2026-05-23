/**
 * Remove stale mp-weixin output when possible (WeChat DevTools may lock the folder).
 */
const fs = require('node:fs')
const path = require('node:path')

const roots = [
  path.join(__dirname, '../dist/build/mp-weixin'),
  path.join(__dirname, '../dist/dev/mp-weixin'),
]

for (const out of roots) {
  try {
    if (fs.existsSync(out)) {
      fs.rmSync(out, { recursive: true, force: true })
      console.log('[clean-mp-weixin-dist] removed', path.relative(path.join(__dirname, '..'), out))
    }
  } catch (e) {
    console.warn(
      `[clean-mp-weixin-dist] could not remove ${out} (close WeChat DevTools?):`,
      e.message,
    )
  }
}
