import {expect, test} from '@playwright/test'

// The about page shipped an Options API head() hook, which Nuxt 3/4 ignore
// entirely — so it had no title and no meta tags at all. These assertions pin
// the ported useSeoMeta output, including the two things the original got
// wrong: og:* declared as name= rather than property=, and a baseUrl built from
// process.env (undefined at runtime) rather than runtimeConfig.

test('about page emits its title and meta', async ({page}) => {
  await page.goto('/en/about')

  await expect(page).toHaveTitle(/Quoc Dai Nguyen/)

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Senior Backend Software Engineer/
  )

  // property=, not name=
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Quoc Dai Nguyen/
  )

  // Resolved from runtimeConfig, so it must be an absolute URL rather than
  // the string "undefined/about".
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    /^https?:\/\/.+\/about$/
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /^https?:\/\/.+\/profile\.jpg$/
  )
})

test('Vietnamese about page has Vietnamese meta', async ({page}) => {
  await page.goto('/about')
  await expect(page).toHaveTitle(/Nguyễn Quốc Đại/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Kỹ sư Phần mềm Backend/)
})

test('blog post emits article meta', async ({page}) => {
  await page.goto('/blog/hello-world')
  await expect(page).toHaveTitle(/Hello, World/)
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
})
