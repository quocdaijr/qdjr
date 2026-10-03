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

  for (const vibe of ['terminal', 'cartoon', 'galaxy']) {
    test(`the pinned header has no background band; its controls carry their own (${vibe})`, async ({page}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'desktop nav')
      await page.addInitScript((v) => localStorage.setItem('vibe', v), vibe)
      await page.goto('/about')
      const bg = (selector: string) => page.locator(selector).filter({visible: true}).first().evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(await bg('body header')).toBe('rgba(0, 0, 0, 0)')
      // Links stay readable over whatever scrolls beneath: a mostly opaque fill.
      const alpha = (css: string) => Number(css.match(/[\d.]+/g)!.at(-1))
      const link = await bg('header nav a')
      expect(link).not.toBe('rgba(0, 0, 0, 0)')
      expect(alpha(link)).toBeGreaterThanOrEqual(0.8)
    })
  }
})
