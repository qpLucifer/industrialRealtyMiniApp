/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string
  readonly VITE_API_BASE?: string
  readonly VITE_OSS_PUBLIC_BASE_URL?: string
  readonly VITE_MINI_LOGIN_PHONE_FALLBACK?: string
  readonly VITE_WX_SUBSCRIBE_TEMPLATE_WORK_TASK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
