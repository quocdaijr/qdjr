import {expect, test} from '@playwright/test'

// The legacy backend (api.qdjr.me) no longer resolves, so API_URL ships unset.
// These assertions pin the behaviour that state must have: an honest offline
// panel, no error page, and — critically — no network traffic to the dead host.

const LEGACY_ROUTES = [
  '/legacy-blogs',
  '/legacy-blogs/some-old-post',
  '/legacy-blogs/category/engineering',
  '/legacy-blogs/tag/php'
]

for (const route of LEGACY_ROUTES) {
  test(`${route} renders the offline panel, not an error page`, async ({page}) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))

    await page.goto(route)
    await expect(page.getByText('The legacy blog archive is offline')).toBeVisible()

    // Must not be the 404 page.
    await expect(page.locator('svg.emoji-error')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('legacy routes issue no requests to the dead API host', async ({page}) => {
  const apiCalls: string[] = []
  page.on('request', (r) => {
    if (r.url().includes('api.qdjr.me')) apiCalls.push(r.url())
  })

  for (const route of LEGACY_ROUTES) {
    await page.goto(route)
    await expect(page.getByText('The legacy blog archive is offline')).toBeVisible()
  }

  expect(apiCalls).toEqual([])
})

test('an invalid slug still 404s through the custom error page', async ({page}) => {
  // Uppercase fails definePageMeta validate(), which is a real 404 rather than
  // a backend problem — so it must reach error.vue, not the offline panel.
  await page.goto('/legacy-blogs/NOT_A_VALID_SLUG')
  await expect(page.locator('svg.emoji-error')).toBeVisible()
  await expect(page.getByText("couldn't find what you are looking for")).toBeVisible()
})

test('legacy search renders without a query param', async ({page}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))

  // Previously threw: $route.query.txt.toString() on an absent param.
  await page.goto('/legacy-blogs/search')
  await expect(page.locator('body')).not.toBeEmpty()
  expect(errors).toEqual([])
})
