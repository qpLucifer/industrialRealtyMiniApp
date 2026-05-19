/**
 * Rasterize prototype tab SVG paths (index.html tab-bar) to 81x81 PNGs for native tabBar.
 * Run: node scripts/render-tab-icons-svg.cjs
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const dir = path.join(__dirname, '..', 'src', 'static', 'tab')
fs.mkdirSync(dir, { recursive: true })

/** Same path `d` as prototype/miniapp/index.html */
const ICONS = [
  { file: 'home', d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z' },
  {
    file: 'property',
    d: 'M4 21V9l8-6 8 6v12h-6v-7h-4v7H4zm8-11.5l7 5.25V19h-2v-6H9v6H7v-4.25l5-3.75z',
  },
  {
    file: 'customer',
    d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  },
  { file: 'msg', d: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z' },
  { file: 'me', d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
]

function buildSvg(pathD, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="81" height="81"><path fill="${fill}" d="${pathD}"/></svg>`
}

async function main() {
  /** Match pages.json tabBar + brand-theme (--brand) */
  const inactive = '#64748b'
  const active = '#1a3a6c'
  for (const { file, d } of ICONS) {
    const out1 = path.join(dir, `${file}.png`)
    const out2 = path.join(dir, `${file}-active.png`)
    await sharp(Buffer.from(buildSvg(d, inactive))).resize(81, 81).png().toFile(out1)
    await sharp(Buffer.from(buildSvg(d, active))).resize(81, 81).png().toFile(out2)
    console.log('wrote', file)
  }
  console.log('OK', dir)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
