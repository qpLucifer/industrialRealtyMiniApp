/**
 * Generate 81x81 PNG tab icons (WeChat recommends ~81px; tiny PNGs may show as red blocks).
 * Run: node scripts/gen-tab-icons.cjs
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const dir = path.join(__dirname, '..', 'src', 'static', 'tab')
fs.mkdirSync(dir, { recursive: true })

function writeSolid(name, w, h, rgb) {
  const png = new PNG({ width: w, height: h })
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) << 2
      png.data[idx] = rgb[0]
      png.data[idx + 1] = rgb[1]
      png.data[idx + 2] = rgb[2]
      png.data[idx + 3] = 255
    }
  }
  const buf = PNG.sync.write(png)
  fs.writeFileSync(path.join(dir, name), buf)
}

const muted = [148, 163, 184] /* slate-400 */
const active = [26, 58, 108] /* brand #1a3a6c */

const names = ['home', 'property', 'customer', 'msg', 'me']
for (const n of names) {
  writeSolid(`${n}.png`, 81, 81, muted)
  writeSolid(`${n}-active.png`, 81, 81, active)
}

console.log('OK: wrote 81x81 tab icons to', dir)
