import {expect, test} from '@playwright/test'
import {enableVibes, modeCookie} from './helpers/mode'

// The top menu stays pinned to the viewport while the page scrolls, in cv and
// vibes mode. The classic header scrolls away (e2e/classic-mode.spec.ts).
test.describe('sticky header', () => {
  for (const path of ['/', '/about', '/blog']) {
    test(`stays at the top after scrolling ${path}`, async ({page}) => {
      await page.context().addCookies([modeCookie('cv')])
      await page.goto(path)
      const header = page.locator('body header').first()
      await expect(header).toBeVisible()
      await page.waitForLoadState('networkidle')

      await page.mouse.wheel(0, 3000)
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

      await expect(header).toBeInViewport()
      expect((await header.boundingBox())?.y).toBe(0)
    })
  }

  for (const look of ['cv', 'terminal', 'cartoon', 'galaxy']) {
    test(`the pinned header has no background band; its controls carry their own (${look})`, async ({page}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'desktop nav')
      if (look === 'cv') await page.context().addCookies([modeCookie('cv')])
      else {
        await enableVibes(page)
        await page.addInitScript((v) => localStorage.setItem('vibe', v), look)
      }
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
