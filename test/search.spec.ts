import {describe, expect, test} from 'vitest'
import {foldDiacritics, matchesQuery} from '~/utils/search'

describe('foldDiacritics', () => {
  test('lowercases plain ASCII', () => {
    expect(foldDiacritics('Hello World')).toBe('hello world')
  })

  test('strips Vietnamese diacritics', () => {
    // The blog contains "Claude Code — Trợ lý lập trình trong terminal".
    expect(foldDiacritics('Trợ lý lập trình')).toBe('tro ly lap trinh')
  })

  test('strips accents from other Latin scripts', () => {
    expect(foldDiacritics('Café Naïve Über')).toBe('cafe naive uber')
  })

  test('returns an empty string for null and undefined', () => {
    expect(foldDiacritics(null)).toBe('')
    expect(foldDiacritics(undefined)).toBe('')
  })

  test('coerces non-string input rather than throwing', () => {
    expect(foldDiacritics(42)).toBe('42')
  })
})

describe('matchesQuery', () => {
  const post = {
    title: 'Claude Code — Trợ lý lập trình trong terminal',
    description: 'Giới thiệu nhanh về Claude Code của Anthropic',
    tags: ['claude-code', 'ai', 'workflow'],
    category: 'tools'
  }

  test('matches on title', () => {
    expect(matchesQuery(post, 'claude')).toBe(true)
  })

  test('matches on title ignoring diacritics', () => {
    // The whole point: a reader typing unaccented ASCII must still find it.
    expect(matchesQuery(post, 'tro ly')).toBe(true)
  })

  test('matches regardless of query case', () => {
    expect(matchesQuery(post, 'CLAUDE')).toBe(true)
  })

  test('matches on description', () => {
    expect(matchesQuery(post, 'anthropic')).toBe(true)
  })

  test('matches on tag', () => {
    expect(matchesQuery(post, 'workflow')).toBe(true)
  })

  test('matches on category', () => {
    expect(matchesQuery(post, 'tools')).toBe(true)
  })

  test('does not match unrelated text', () => {
    expect(matchesQuery(post, 'kubernetes')).toBe(false)
  })

  test('returns false for an empty query rather than matching everything', () => {
    expect(matchesQuery(post, '')).toBe(false)
    expect(matchesQuery(post, '   ')).toBe(false)
  })

  test('tolerates posts with missing optional fields', () => {
    expect(matchesQuery({title: 'Bare'}, 'bare')).toBe(true)
    expect(matchesQuery({title: 'Bare'}, 'nothing')).toBe(false)
  })
})
