/**
 * Post-build fixes for WeChat mp-weixin:
 * - Re-export shims for paths DevTools / old bundles still resolve
 * - Never delete stub files (ENOENT breaks precompile)
 * - See .cursor/rules/mp-weixin.mdc
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '../dist/build/mp-weixin')
if (!fs.existsSync(root)) {
  console.warn('[mp-weixin-compat-shims] skip: dist/build/mp-weixin not found')
  process.exit(0)
}

const utilsDir = path.join(root, 'utils')
const apiDir = path.join(root, 'api')
const composablesDir = path.join(root, 'composables')
const propertyPageDir = path.join(root, 'pages/property')
fs.mkdirSync(utilsDir, { recursive: true })
fs.mkdirSync(apiDir, { recursive: true })
fs.mkdirSync(composablesDir, { recursive: true })
fs.mkdirSync(propertyPageDir, { recursive: true })

function write(filePath, content) {
  fs.writeFileSync(filePath, content)
}

const networkMedia = `"use strict";
const r = require("./request.js");
exports.resolveMediaUrl = r.resolveMediaUrl;
exports.previewNetworkVideo = r.previewNetworkVideo;
exports.onVideoComponentError = r.onVideoComponentError;
`

const upload = `"use strict";
const r = require("../utils/request.js");
exports.uploadOssFile = r.uploadOssFile;
`

const propertyForm = `"use strict";
const r = require("./request.js");
exports.emptyPropertyForm = r.emptyPropertyForm;
exports.parseMediaLines = r.parseMediaLines;
exports.joinMediaLines = r.joinMediaLines;
exports.applyPropertyApiForm = r.applyPropertyApiForm;
exports.buildPropertySubmitPayload = r.buildPropertySubmitPayload;
exports.chipListFromJoined = r.chipListFromJoined;
`

/** Always present — publish may still require this path from cached builds. */
const meta = `"use strict";
const r = require("../utils/request.js");
exports.fetchRegionDefs = r.fetchRegionDefs;
exports.fetchCodeMasterLabels = r.fetchCodeMasterLabels;
`

/** Legacy paths — empty stubs prevent ENOENT; logic is inlined in publish.js. */
const legacyPropertyFormUi = `"use strict";
module.exports = {};
`

write(path.join(utilsDir, 'networkMedia.js'), networkMedia)
write(path.join(apiDir, 'upload.js'), upload)
write(path.join(utilsDir, 'propertyForm.js'), propertyForm)
write(path.join(apiDir, 'meta.js'), meta)
write(path.join(propertyPageDir, 'propertyFormUi.js'), legacyPropertyFormUi)
write(path.join(composablesDir, 'usePropertyFormUi.js'), legacyPropertyFormUi)

/** Removed from source but DevTools cache may still reference these async components. */
const componentsDir = path.join(root, 'components')
fs.mkdirSync(componentsDir, { recursive: true })

function writeRemovedComponentStub(baseName) {
  const wxml = '<view class="prop-media-stub" style="display:none" />'
  const js = 'Component({})'
  const json = JSON.stringify({ component: true, usingComponents: {} }, null, 2)
  const wxss = '.prop-media-stub { display: none; }'
  write(path.join(componentsDir, `${baseName}.wxml`), wxml)
  write(path.join(componentsDir, `${baseName}.js`), js)
  write(path.join(componentsDir, `${baseName}.json`), `${json}\n`)
  write(path.join(componentsDir, `${baseName}.wxss`), wxss)
}

writeRemovedComponentStub('PropertyMediaHero')
writeRemovedComponentStub('PropertyMediaEditor')

function scrubStaleComponentRefs(dir) {
  if (!fs.existsSync(dir)) return 0
  let n = 0
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      n += scrubStaleComponentRefs(p)
      continue
    }
    if (!ent.name.endsWith('.json')) continue
    let raw
    try {
      raw = fs.readFileSync(p, 'utf8')
    } catch {
      continue
    }
    if (!/PropertyMedia|property-media-/i.test(raw)) continue
    try {
      const j = JSON.parse(raw)
      if (!j.usingComponents || typeof j.usingComponents !== 'object') continue
      let changed = false
      for (const [k, v] of Object.entries(j.usingComponents)) {
        if (/PropertyMedia|property-media-/i.test(k) || /PropertyMedia/i.test(String(v))) {
          delete j.usingComponents[k]
          changed = true
        }
      }
      if (changed) {
        write(p, `${JSON.stringify(j, null, 2)}\n`)
        n += 1
      }
    } catch {
      /* ignore non-page json */
    }
  }
  return n
}

const scrubbed = scrubStaleComponentRefs(root)
if (scrubbed) {
  console.log(`[mp-weixin-compat-shims] scrubbed PropertyMedia* from ${scrubbed} page json file(s)`)
}

const projCfgPath = path.join(root, 'project.config.json')
if (fs.existsSync(projCfgPath)) {
  const wxAppId = process.env.VITE_MP_WEIXIN_APPID || 'wx802c623c5215ec70'
  try {
    const cfg = JSON.parse(fs.readFileSync(projCfgPath, 'utf8'))
    if (!cfg.appid || cfg.appid === 'touristappid') {
      cfg.appid = wxAppId
    }
    cfg.setting = cfg.setting || {}
    cfg.setting.ignoreDevUnusedFiles = false
    cfg.setting.ignoreUploadUnusedFiles = false
    fs.writeFileSync(projCfgPath, `${JSON.stringify(cfg, null, 2)}\n`)
    console.log('[mp-weixin-compat-shims] patched project.config.json (appid + ignoreDevUnusedFiles)')
  } catch (e) {
    console.warn('[mp-weixin-compat-shims] project.config.json patch skipped:', e.message)
  }
}

console.log(
  '[mp-weixin-compat-shims] wrote request shims + legacy stubs (meta, propertyFormUi, usePropertyFormUi)',
)
