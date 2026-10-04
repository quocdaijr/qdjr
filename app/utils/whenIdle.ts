// Run `task` once the page has loaded, settled and the browser has a moment to
// spare: heavy, non-essential work (the 3D scene, analytics) waits until the
// content is on screen and the page answers input. `settle` is a pause after
// the load event, past the hero's reveal animation and its largest paint — a
// download started earlier competes with them for a slow phone's bandwidth.
// `timeout` caps the wait for an idle moment that never comes on a busy page.
const SETTLE_MS = 1500
const IDLE_TIMEOUT_MS = 2500

export function whenIdle(task: () => void, {settle = SETTLE_MS, timeout = IDLE_TIMEOUT_MS} = {}): () => void {
  let cancelled = false
  let idleId: number | undefined
  let timerId: ReturnType<typeof setTimeout> | undefined
  const idle = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(() => !cancelled && task(), {timeout})
    else timerId = setTimeout(() => !cancelled && task(), 1)
  }
  const schedule = () => {
    if (!cancelled) timerId = setTimeout(idle, settle)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, {once: true})
  return () => {
    cancelled = true
    window.removeEventListener('load', schedule)
    if (idleId !== undefined) window.cancelIdleCallback(idleId)
    if (timerId !== undefined) clearTimeout(timerId)
  }
}
