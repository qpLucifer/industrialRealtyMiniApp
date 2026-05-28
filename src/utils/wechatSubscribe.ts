import { post } from '@/utils/request'

const TEMPLATE_ID = String(import.meta.env.VITE_WX_SUBSCRIBE_TEMPLATE_WORK_TASK || '').trim()

function isMock() {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

function isWeixinMiniProgram(): boolean {
  try {
    const info =
      typeof uni.getAppBaseInfo === 'function'
        ? uni.getAppBaseInfo()
        : uni.getSystemInfoSync()
    const platform = String((info as { uniPlatform?: string }).uniPlatform || '').toLowerCase()
    return platform === 'mp-weixin' || platform.includes('weixin')
  } catch {
    return false
  }
}

function uniLoginCode(): Promise<string | undefined> {
  return new Promise((resolve) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res.code || undefined),
      fail: () => resolve(undefined),
    })
  })
}

/**
 * Before mini save: subscribe consent + bind openid for scheduled reminders (submitter only).
 * requestSubscribeMessage must run before other async calls (e.g. uni.login) to stay in user tap context.
 */
export async function prepareWorkTaskSubscribe(): Promise<void> {
  if (isMock()) return
  if (!TEMPLATE_ID) {
    if (import.meta.env.DEV) {
      uni.showToast({ title: '未配置订阅模板 ID', icon: 'none', duration: 2800 })
    }
    return
  }
  if (!isWeixinMiniProgram()) {
    if (import.meta.env.DEV) {
      uni.showToast({ title: '请使用微信小程序模式运行', icon: 'none', duration: 2800 })
    }
    return
  }

  await new Promise<void>((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: (res) => {
        if (import.meta.env.DEV) {
          console.log('[subscribe] requestSubscribeMessage ok', res)
        }
        resolve()
      },
      fail: (err) => {
        const msg = String((err as { errMsg?: string })?.errMsg || err || '订阅失败')
        console.warn('[subscribe] requestSubscribeMessage fail', msg, 'tmplId=', TEMPLATE_ID)
        const noTemplate = /no template data|template id exist/i.test(msg)
        if (import.meta.env.DEV) {
          uni.showToast({
            title: noTemplate
              ? '订阅模板ID与后台不一致，请从公众平台复制完整ID到.env'
              : msg.length > 30
                ? `${msg.slice(0, 30)}…`
                : msg,
            icon: 'none',
            duration: 4000,
          })
        }
        resolve()
      },
    })
  })

  const loginCode = await uniLoginCode()
  if (loginCode) {
    try {
      await post<{ ok: boolean }>('/api/mini/bind-openid', { loginCode })
    } catch (e) {
      console.warn('[subscribe] bind-openid', e)
    }
  }
}
