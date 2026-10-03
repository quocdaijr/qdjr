import {expect, test} from '@playwright/test'

// The top menu stays pinned to the viewport while the page scrolls.
test.describe('sticky header', () => {
  for (const path of ['/', '/about', '/blog']) {
    test(`stays at the top after scrolling ${path}`, async ({page}) => {
      await page.goto(path)
      const header = page.locator('body header').first()
      await expect(header).toBeVisible()

      await page.mouse.wheel(0, 3000)
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

      await expect(header).toBeInViewport()
      expect((await header.boundingBox())?.y).toBe(0)
    })
  }
})
