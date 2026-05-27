import { parseBeijingNaiveToInstant } from '@/utils/beijingTime'

export type ViewingPhase = 'upcoming' | 'active' | 'ended'

export function viewingPhase(start: string, end: string, now = Date.now()): ViewingPhase {
  const s = parseBeijingNaiveToInstant(start)?.getTime()
  const e = parseBeijingNaiveToInstant(end)?.getTime()
  if (s == null || e == null) return 'ended'
  if (now < s) return 'upcoming'
  if (now > e) return 'ended'
  return 'active'
}

export function viewingPhaseLabel(phase: ViewingPhase): string {
  if (phase === 'upcoming') return '未开始'
  if (phase === 'active') return '进行中'
  return '已结束'
}

export function viewingPhaseTone(phase: ViewingPhase): string {
  if (phase === 'upcoming') return 'upcoming'
  if (phase === 'active') return 'active'
  return 'ended'
}
