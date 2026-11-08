import {expect, test} from '@playwright/test'


test.describe('cv mode (phase 2: opt-in by cookie)', () => {
  test.beforeEach(async ({context, baseURL}) => {
    await context.addCookies([{name: 'mode', value: 'cv', url: baseURL!}])
  })

  test('renders no scene, no veil and no vibe fonts', async ({page}) => {
    await page.goto('/blog')
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'cv')
    await expect(page.locator('html')).not.toHaveAttribute('data-vibe', /./)
    await page.waitForTimeout(5000) // past SCENE_SETTLE_MS on phones
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(0)
    await expect(page.locator('.scene-veil')).toHaveCount(0)
    expect(await page.locator('link[href*="fonts.googleapis.com/css2"]').count()).toBe(0)
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(font).not.toMatch(/Bricolage|JetBrains|Geist/)
  })

  test('follows the OS colour scheme: dark before hydration and after', async ({page}) => {
    await page.emulateMedia({colorScheme: 'dark'})
    await page.goto('/blog', {waitUntil: 'commit'})
    await page.locator('body').waitFor({state: 'attached'})
    const early = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(early).not.toBe('rgb(255, 255, 255)')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.emulateMedia({colorScheme: 'light'})
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('a trip page still draws its road in cv mode', async ({page}) => {
    await page.goto('/trips/sg-dalat')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, {timeout: 15_000})
  })
})
