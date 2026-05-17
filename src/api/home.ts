import type { WorkbenchSummary } from '@/types/workbench'
import { get } from '@/utils/request'

export function fetchWorkbench(): Promise<WorkbenchSummary> {
  return get<WorkbenchSummary>('/api/workbench/summary')
}
