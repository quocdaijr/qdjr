import type {Page, TestType} from '@playwright/test'

// The classic look is the default; a test about another mode opts in with the
// same cookie the switch sets, so the server already renders vibes mode.
export const modeCookie = (value: string) => ({name: 'mode', value, domain: 'localhost', path: '/'})
export const VIBES_COOKIE = modeCookie('vibes')

export async function enableVibes(page: Page) {
  await page.context().addCookies([VIBES_COOKIE])
}

/** Every test in the file runs in vibes mode. */
export function useVibes(test: TestType<{page: Page}, object>) {
  test.beforeEach(async ({page}) => enableVibes(page))
}

/** Every test in the file runs in the given mode. */
export function useMode(test: TestType<{page: Page}, object>, mode: string) {
  test.beforeEach(async ({page}) => page.context().addCookies([modeCookie(mode)]))
}
