import type { PickerSearchPage } from '@/utils/pickerSearch'

export type SinglePickerSession<T = unknown> = {
  search: (q: string, page: number) => Promise<PickerSearchPage<T>>
  getKey: (item: T) => string
  getLabel: (item: T) => string
  getSubline?: (item: T) => string
  title: string
  searchPlaceholder: string
  emptyHint?: string
  initialKey?: string
}

export type MultiPickerOption = { id: string; name: string }

export type MultiPickerSession = {
  searchFn?: (q: string) => Promise<MultiPickerOption[]>
  options?: MultiPickerOption[]
  title: string
  searchPlaceholder: string
  minCount: number
  initialIds: string[]
}

const singleSessions = new Map<string, SinglePickerSession>()
const multiSessions = new Map<string, MultiPickerSession>()

function newSessionId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createSinglePickerSession<T>(config: SinglePickerSession<T>): string {
  const id = newSessionId('sp')
  singleSessions.set(id, config as SinglePickerSession)
  return id
}

export function getSinglePickerSession(id: string): SinglePickerSession | undefined {
  return singleSessions.get(id)
}

export function destroySinglePickerSession(id: string) {
  singleSessions.delete(id)
}

export function createMultiPickerSession(config: MultiPickerSession): string {
  const id = newSessionId('mp')
  multiSessions.set(id, config)
  return id
}

export function getMultiPickerSession(id: string): MultiPickerSession | undefined {
  return multiSessions.get(id)
}

export function destroyMultiPickerSession(id: string) {
  multiSessions.delete(id)
}
