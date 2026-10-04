import {PROFILE_CONTENT, type ProfileLocale} from '~/data/profile'

/** Profile copy for the current page language (Vietnamese when unknown). */
export function useProfile() {
  const {locale} = useI18n()
  return computed(() => PROFILE_CONTENT[locale.value as ProfileLocale] ?? PROFILE_CONTENT.vi)
}
