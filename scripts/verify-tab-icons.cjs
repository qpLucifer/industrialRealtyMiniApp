/**
 * Fail fast if tabBar PNGs are missing (common when uploading wrong folder or skipping gen).
 * Pre-build: checks src/static/tab only (dist may be stale until uni build finishes).
 * Post-build: pass --with-dist to also require dist/build/mp-weixin/static/tab.
 */
const fs = require('node:fs')
const path = require('node:path')

const names = ['home', 'property', 'customer', 'msg', 'me']
const required = []
for (const n of names) {
  required.push(`${n}.png`, `${n}-active.png`)
}

const withDist = process.argv.includes('--with-dist')

function checkDir(label, dir) {
  const missing = []
  for (const f of required) {
    const p = path.join(dir, f)
    if (!fs.existsSync(p) || fs.statSync(p).size < 200) missing.push(f)
  }
  if (missing.length) {
    console.error(`[verify-tab-icons] ${label}: missing or too small: ${missing.join(', ')}`)
    return false
  }
  console.log(`[verify-tab-icons] OK ${label} (${required.length} files)`)
  return true
}

const srcTab = path.join(__dirname, '../src/static/tab')
const distTab = path.join(__dirname, '../dist/build/mp-weixin/static/tab')

let ok = checkDir('src/static/tab', srcTab)

if (withDist) {
  if (!fs.existsSync(path.join(__dirname, '../dist/build/mp-weixin'))) {
    console.error('[verify-tab-icons] dist/build/mp-weixin not found — run uni build first')
    ok = false
  } else {
    ok = checkDir('dist/build/mp-weixin/static/tab', distTab) && ok
  }
}

if (!ok) {
  console.error('\nFix: npm run gen:tab-icons:svg && npm run build:mp-weixin')
  console.error('Upload WeChat 体验版 from: industrialRealtyMiniApp/dist/build/mp-weixin (not src/, not dist/dev/)')
  process.exit(1)
}
