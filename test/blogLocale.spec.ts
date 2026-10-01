import {describe, expect, test} from 'vitest'
import {mergeTranslations, stripLocalePrefix} from '~/utils/blogLocale'

describe('stripLocalePrefix', () => {
  test('leaves default-locale paths alone', () => {
    expect(stripLocalePrefix('/blog/hello-world', 'vi')).toBe('/blog/hello-world')
  })

  test('removes the /en prefix', () => {
    expect(stripLocalePrefix('/en/blog/hello-world', 'en')).toBe('/blog/hello-world')
    expect(stripLocalePrefix('/en', 'en')).toBe('/')
  })

  test('does not strip a prefix that only looks similar', () => {
    expect(stripLocalePrefix('/english-notes', 'en')).toBe('/english-notes')
  })
})

describe('mergeTranslations', () => {
  const originals = [{path: '/blog/a', title: 'A vi'}, {path: '/blog/b', title: 'B vi'}]

  test('uses the translation when one exists and keeps the original order', () => {
    const merged = mergeTranslations(originals, [{path: '/blog/b', title: 'B en'}])
    expect(merged.map((p) => p.title)).toEqual(['A vi', 'B en'])
  })

  test('marks posts without a translation as original-only', () => {
    const merged = mergeTranslations(originals, [])
    expect(merged.every((p) => 'originalOnly' in p && p.originalOnly)).toBe(true)
  })

  test('ignores orphan translations whose original is gone', () => {
    const merged = mergeTranslations(originals, [{path: '/blog/zzz', title: 'orphan'}])
    expect(merged).toHaveLength(2)
  })
})
