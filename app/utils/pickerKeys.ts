// Keyboard model for the /about project picker: arrows step and wrap, Home/End jump.
const STEP: Readonly<Record<string, number>> = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}

export function nextPick(current: number, key: string, count: number): number | null {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  const step = STEP[key]
  return step === undefined ? null : (current + step + count) % count
}
