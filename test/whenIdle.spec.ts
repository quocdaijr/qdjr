import {afterEach, describe, expect, test, vi} from 'vitest'
import {whenIdle} from '~/utils/whenIdle'

describe('whenIdle', () => {
  afterEach(() => vi.unstubAllGlobals())

  test('waits for the load event, a settling pause, then an idle moment', () => {
    vi.useFakeTimers()
    const idle: Array<() => void> = []
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => idle.push(cb))
    Object.defineProperty(document, 'readyState', {value: 'loading', configurable: true})
    const task = vi.fn()
    whenIdle(task)
    expect(idle).toHaveLength(0)
    window.dispatchEvent(new Event('load'))
    vi.advanceTimersByTime(1000)
    expect(idle).toHaveLength(0) // still settling
    vi.advanceTimersByTime(600)
    expect(task).not.toHaveBeenCalled()
    idle[0]!()
    expect(task).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  test('can be cancelled before it runs', () => {
    const idle: Array<() => void> = []
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => idle.push(cb))
    vi.stubGlobal('cancelIdleCallback', () => {})
    Object.defineProperty(document, 'readyState', {value: 'complete', configurable: true})
    const task = vi.fn()
    whenIdle(task, {settle: 0})()
    idle[0]?.()
    expect(task).not.toHaveBeenCalled()
  })
})
