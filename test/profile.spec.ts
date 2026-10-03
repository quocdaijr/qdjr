import {describe, expect, test} from 'vitest'
import {PROFILE_CONTENT, type ProfileContent} from '~/data/profile'

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

  test('job titles, project names and technical terms stay in English', () => {
    expect(vi.profile.role).toBe(en.profile.role)
    expect(vi.timeline.map((e) => e.position ?? null)).toEqual(en.timeline.map((e) => e.position ?? null))
    expect(vi.timeline.map((e) => [e.technologies ?? null, e.thirdParties ?? null])).toEqual(en.timeline.map((e) => [e.technologies ?? null, e.thirdParties ?? null]))
    expect(vi.skills).toEqual(en.skills)
    expect(vi.projects.map((p) => p.name)).toEqual(en.projects.map((p) => p.name))
    // "Backend Software Engineer - <what I did>": the title before the dash is not translated.
    expect(vi.projects.map((p) => p.role.split(' - ')[0])).toEqual(en.projects.map((p) => p.role.split(' - ')[0]))
    expect(vi.contact.some((row) => row.value === en.profile.role)).toBe(true)
  })

  test('projects are grouped by employer the same way in both languages', () => {
    const runs = (c: ProfileContent) => c.projects.map((p, i, all) => (i === 0 || p.group !== all[i - 1].group ? 'new' : 'same'))
    expect(runs(vi)).toEqual(runs(en))
    expect(new Set(en.projects.map((p) => p.group)).size).toBe(2)
    for (const content of [vi, en]) {
      // Group names are the employers' timeline names, in that language.
      expect(content.projects.every((p) => content.timeline.some((t) => t.org === p.group))).toBe(true)
    }
  })

  test('every career stage has a short rail name', () => {
    for (const content of [vi, en]) {
      for (const entry of content.timeline) {
        expect(entry.short.trim().length).toBeGreaterThan(0)
        expect(entry.short.length).toBeLessThanOrEqual(12)
      }
    }
    // Names, not prose: only the Vietnamese diacritics may differ.
    const plain = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace('Đ', 'D').replace('đ', 'd')
    expect(vi.timeline.map((e) => plain(e.short))).toEqual(en.timeline.map((e) => e.short))
  })
})
