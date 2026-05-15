import { get } from '@/utils/request'

export function fetchWorkbench() {
  return get<import('@/mock/data/workbench').WorkbenchSummary>('/api/workbench/summary')
}
