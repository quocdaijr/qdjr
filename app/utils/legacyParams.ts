export type LegacyListType = 'normal' | 'byTag' | 'byCategory' | 'bySearch'

export interface LegacyListParams {
  page: number
  perPage: number
  tag?: string
  category?: string
  txt?: string
  isLoadMore?: boolean
}

export const LEGACY_PER_PAGE = 5

/**
 * Build the query for a legacy post listing.
 *
 * Extracted from post/List.vue: the Nuxt 2 original derived these from
 * this.$route.params.id, which does not match the current route shapes at all,
 * so the filter silently did nothing. Driving it from the component's props is
 * both correct and directly testable.
 */
export function buildLegacyListParams(
  listType: LegacyListType,
  extraValue: string,
  page = 1,
  extra: Partial<LegacyListParams> = {}
): LegacyListParams {
  const params: LegacyListParams = {page, perPage: LEGACY_PER_PAGE, ...extra}

  if (listType === 'byTag') params.tag = extraValue
  if (listType === 'byCategory') params.category = extraValue
  if (listType === 'bySearch') params.txt = extraValue

  return params
}
