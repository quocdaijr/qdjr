import {describe, expect, test} from 'vitest'
import {PROFILE_CONTENT} from '~/data/profile'
import {educationEntries, projectsByEmployer, workEntries} from '~/utils/cvOrder'

const {en} = PROFILE_CONTENT

describe('cv ordering', () => {
  test('work entries come newest first and exclude education', () => {
    expect(workEntries(en.timeline).map((e) => e.short)).toEqual(['FireGroup', 'Tuoi Tre', 'Applancer'])
  })

  test('education entries are the rest, unchanged order', () => {
    expect(educationEntries(en.timeline).map((e) => e.short)).toEqual(['HCMUNRE'])
  })

  test('projects group by employer in first-seen order, items in source order', () => {
    const groups = projectsByEmployer(en.projects)
    expect(groups.map((g) => [g.group, g.items.length])).toEqual([
      ['FireGroup Technology', 5],
      ['Tuoi Tre Newspaper', 5]
    ])
    expect(groups[0].items[0].name).toBe(en.projects[0].name)
  })

  test('does not mutate its input', () => {
    const before = en.timeline.map((e) => e.short)
    workEntries(en.timeline)
    expect(en.timeline.map((e) => e.short)).toEqual(before)
  })
})
