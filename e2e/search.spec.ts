import {expect, test} from '@playwright/test'

// The header search form used to submit to /search, a route that never existed,
// so it 404'd on every use. It now searches the @nuxt/content blog.

test('header search navigates to results', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop header instance')

  await page.goto('/blog')
  await page.locator('#site-search').first().fill('hello')
  await page.locator('#site-search').first().press('Enter')

  await expect(page).toHaveURL(/\/blog\/search\?q=hello/)
  await expect(page.locator('main')).toContainText('Hello, World')
})

test('matches on title', async ({page}) => {
  await page.goto('/blog/search?q=hello')
  await expect(page.locator('main')).toContainText('Hello, World')
  await expect(page.locator('main')).not.toContainText('Claude Code')
})

test('matches accent-insensitively', async ({page}) => {
  // The post title is "Claude Code — Trợ lý lập trình...". Typing unaccented
  // "tro ly" must still find it.
  await page.goto('/blog/search?q=tro ly')
  await expect(page.locator('main')).toContainText('Claude Code')
})

test('matches on tag', async ({page}) => {
  await page.goto('/blog/search?q=markdown')
  await expect(page.locator('main')).toContainText('Hello, World')
})

test('empty query renders a prompt rather than crashing', async ({page}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/en/blog/search')
  await expect(page.locator('main')).toContainText('Enter a search term')
  expect(errors).toEqual([])
})

test('no match renders an empty state', async ({page}) => {
  await page.goto('/en/blog/search?q=zzzznotathing')
  await expect(page.locator('main')).toContainText('No posts match')
})

test('search results are not indexed', async ({page}) => {
  await page.goto('/blog/search?q=hello')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
