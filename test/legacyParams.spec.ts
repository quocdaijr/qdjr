import {describe, expect, test} from 'vitest'
import {LEGACY_PER_PAGE, buildLegacyListParams} from '~/utils/legacyParams'

describe('buildLegacyListParams', () => {
  test('defaults to page 1 and the shared page size', () => {
    expect(buildLegacyListParams('normal', '')).toEqual({
      page: 1,
      perPage: LEGACY_PER_PAGE
    })
  })

  test('adds no filter for the normal listing', () => {
    const params = buildLegacyListParams('normal', 'ignored')
    expect(params).not.toHaveProperty('tag')
    expect(params).not.toHaveProperty('category')
    expect(params).not.toHaveProperty('txt')
  })

  test('maps byTag to the tag filter', () => {
    expect(buildLegacyListParams('byTag', 'php')).toMatchObject({tag: 'php'})
  })

  test('maps byCategory to the category filter', () => {
    expect(buildLegacyListParams('byCategory', '12')).toMatchObject({category: '12'})
  })

  test('maps bySearch to the text filter', () => {
    expect(buildLegacyListParams('bySearch', 'redis')).toMatchObject({txt: 'redis'})
  })

  test('applies only the filter matching the list type', () => {
    const params = buildLegacyListParams('byTag', 'php')
    expect(params.category).toBeUndefined()
    expect(params.txt).toBeUndefined()
  })

  test('carries the requested page through', () => {
    expect(buildLegacyListParams('normal', '', 3)).toMatchObject({page: 3})
  })

  test('merges extra options such as the load-more flag', () => {
    expect(buildLegacyListParams('byTag', 'php', 2, {isLoadMore: true})).toEqual({
      page: 2,
      perPage: LEGACY_PER_PAGE,
      isLoadMore: true,
      tag: 'php'
    })
  })

  test('lets the filter win over a same-named extra', () => {
    // The list type is the source of truth for its own filter.
    expect(buildLegacyListParams('byTag', 'php', 1, {tag: 'stale'})).toMatchObject({
      tag: 'php'
    })
  })
})
