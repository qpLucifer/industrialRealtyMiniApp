import { get, post } from '@/utils/request'

export function loginApi() {
  return post<{ token: string; profile: import('@/mock/data/user').UserProfile }>('/api/auth/login', {})
}

export function fetchWorkbench() {
  return get<import('@/mock/data/workbench').WorkbenchSummary>('/api/workbench/summary')
}
