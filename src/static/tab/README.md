# Tab bar icons (81×81 PNG)

**These PNG files must exist in git** — otherwise CI / another machine’s 体验版 upload will have no tab icons.

Regenerate:

```bash
npm run gen:tab-icons:svg
```

Colors:

- Default: `#64748b` (matches `tabBar.color` in `pages.json`)
- Selected: `#1a3a6c` (企鹏品牌深蓝, matches `tabBar.selectedColor`)

## 开发 vs 体验版（重要）

| 环境 | 目录 | 说明 |
|------|------|------|
| 本地开发 `dev:mp-weixin` | `dist/dev/mp-weixin` | `predev` 会自动生成图标 |
| **上传体验版/正式版** | **`dist/build/mp-weixin`** | 必须先 `npm run build:mp-weixin`，在微信开发者工具里打开**此目录**再点「上传」 |

不要上传 `src/` 或旧的 `dist/dev/` 包，否则 Tab 图标会缺失或仍是旧版。
