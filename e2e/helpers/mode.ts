import type {Page, TestType} from '@playwright/test'

// CV mode is the default; a test about the three.js vibes opts in with the
// same cookie the switch sets, so the server already renders vibes mode.
export const VIBES_COOKIE = {name: 'mode', value: 'vibes', domain: 'localhost', path: '/'}

export async function enableVibes(page: Page) {
  await page.context().addCookies([VIBES_COOKIE])
}

/** Every test in the file runs in vibes mode. */
export function useVibes(test: TestType<{page: Page}, object>) {
  test.beforeEach(async ({page}) => enableVibes(page))
}
