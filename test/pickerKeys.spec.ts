import {expect, test} from 'vitest'
import {nextPick} from '~/utils/pickerKeys'

test('arrows step and wrap, Home/End jump, other keys are ignored', () => {
  expect(nextPick(0, 'ArrowDown', 10)).toBe(1)
  expect(nextPick(9, 'ArrowDown', 10)).toBe(0)
  expect(nextPick(0, 'ArrowUp', 10)).toBe(9)
  expect(nextPick(3, 'ArrowRight', 10)).toBe(4)
  expect(nextPick(3, 'ArrowLeft', 10)).toBe(2)
  expect(nextPick(5, 'Home', 10)).toBe(0)
  expect(nextPick(5, 'End', 10)).toBe(9)
  expect(nextPick(5, 'a', 10)).toBeNull()
})
