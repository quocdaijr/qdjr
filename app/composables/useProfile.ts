import {PROFILE_CONTENT, type ProfileLocale} from '~/data/profile'
import {pickProfileContent} from '~/utils/profileContent'

/**
 * Profile copy for the current page language: the API's profile.content[locale]
 * (edited in qdjr-admin → Profile → Site content), else the bundled copy in
 * ~/data/profile.* so the site still renders while the API is down.
 */
export function useProfile() {
  const {locale} = useI18n()
  const shell = useSiteShell()
  return computed(
    () =>
      pickProfileContent(shell.value?.profile?.content, locale.value) ??
      PROFILE_CONTENT[locale.value as ProfileLocale] ??
      PROFILE_CONTENT.vi
  )
}
