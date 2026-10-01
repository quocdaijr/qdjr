import {describe, expect, test} from 'vitest'
import {PROFILE_CONTENT} from '~/data/profile'

const {vi, en} = PROFILE_CONTENT

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

describe('profile content', () => {
  test('both languages have the same number of entries in every section', () => {
    expect(vi.skills.length).toBe(en.skills.length)
    expect(vi.otherSkills.length).toBe(en.otherSkills.length)
    expect(vi.timeline.length).toBe(en.timeline.length)
    expect(vi.projects.length).toBe(en.projects.length)
    expect(vi.contact.length).toBe(en.contact.length)
    vi.timeline.forEach((entry, i) => expect(entry.achievements.length).toBe(en.timeline[i].achievements.length))
  })

  test('language-independent fields are identical', () => {
    expect(vi.timeline.map((e) => [e.period.slice(0, 7), e.kind])).toEqual(en.timeline.map((e) => [e.period.slice(0, 7), e.kind]))
    expect(vi.projects.map((p) => [p.image, p.url ?? null])).toEqual(en.projects.map((p) => [p.image, p.url ?? null]))
    expect(vi.contact.map((c) => c.href ?? null)).toEqual(en.contact.map((c) => c.href ?? null))
    expect(vi.profile.photo).toBe(en.profile.photo)
  })

  test('no section holds an empty string', () => {
    for (const content of [vi, en]) {
      expect(strings(content).filter((s) => !s.trim())).toEqual([])
    }
  })
})
