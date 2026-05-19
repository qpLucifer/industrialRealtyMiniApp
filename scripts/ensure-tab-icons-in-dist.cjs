/**
 * Copy tab PNGs into production mp-weixin output (belt-and-suspenders after vite build).
 */
const fs = require('node:fs')
const path = require('node:path')

const src = path.join(__dirname, '../src/static/tab')
const dest = path.join(__dirname, '../dist/build/mp-weixin/static/tab')

if (!fs.existsSync(path.join(__dirname, '../dist/build/mp-weixin'))) {
  console.log('[ensure-tab-icons-in-dist] skip — no dist/build/mp-weixin yet')
  process.exit(0)
}

fs.mkdirSync(dest, { recursive: true })
const files = fs.readdirSync(src).filter((f) => f.endsWith('.png'))
for (const f of files) {
  fs.copyFileSync(path.join(src, f), path.join(dest, f))
}
console.log(`[ensure-tab-icons-in-dist] copied ${files.length} PNG(s) → dist/build/mp-weixin/static/tab`)
