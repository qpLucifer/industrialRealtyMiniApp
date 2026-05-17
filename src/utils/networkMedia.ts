/**
 * WeChat mp-weixin may cache old page bundles that require utils/networkMedia.js.
 * Re-export from request.ts so the path stays valid after refactors.
 */
export { onVideoComponentError, previewNetworkVideo, resolveMediaUrl } from './request'
