/**
 * Fail fast if tabBar PNGs are missing (common when uploading wrong folder or skipping gen).
 */
const fs = require('node:fs')
const path = require('node:path')

const names = ['home', 'property', 'customer', 'msg', 'me']
const required = []
for (const n of names) {
  required.push(`${n}.png`, `${n}-active.png`)
}

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
if (fs.existsSync(path.join(__dirname, '../dist/build/mp-weixin'))) {
  ok = checkDir('dist/build/mp-weixin/static/tab', distTab) && ok
}

if (!ok) {
  console.error('\nFix: npm run gen:tab-icons:svg && npm run build:mp-weixin')
  console.error('Upload WeChat 体验版 from: miniapp-uni/dist/build/mp-weixin (not src/, not dist/dev/)')
  process.exit(1)
}
