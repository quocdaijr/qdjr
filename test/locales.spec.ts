import {describe, expect, test} from 'vitest'
import en from '~~/i18n/locales/en.json'
import vi from '~~/i18n/locales/vi.json'

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix]
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

describe('locale messages', () => {
  test('Vietnamese and English define exactly the same keys', () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort())
  })

  test('skill levels and technical labels stay in English', () => {
    expect(vi.about.expert).toBe(en.about.expert)
    expect(vi.about.proficient).toBe(en.about.proficient)
    expect(vi.about.thirdParties).toBe(en.about.thirdParties)
  })
})
