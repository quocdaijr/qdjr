import {describe, expect, test} from 'vitest'
import {PROFILE_CONTENT} from '~/data/profile'
import {pickProfileContent} from '~/utils/profileContent'

describe('pickProfileContent', () => {
  test('returns the locale entry when it looks like ProfileContent', () => {
    const content = {vi: PROFILE_CONTENT.vi, en: PROFILE_CONTENT.en}
    expect(pickProfileContent(content, 'en')).toBe(content.en)
  })

  test('returns null for missing, non-object or incomplete content', () => {
    expect(pickProfileContent(undefined, 'vi')).toBeNull()
    expect(pickProfileContent(null, 'vi')).toBeNull()
    expect(pickProfileContent({}, 'vi')).toBeNull()
    expect(pickProfileContent({vi: {profile: {name: 'x'}}}, 'vi')).toBeNull()
    expect(pickProfileContent({vi: 'nope'}, 'vi')).toBeNull()
  })
})
