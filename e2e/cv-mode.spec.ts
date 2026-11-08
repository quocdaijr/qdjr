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

  test('the header switch leaves cv mode without a reload and remembers it', async ({page}) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle') // hydrated: the click must reach Vue
    const button = page.locator('header .mode-switch-icon').filter({visible: true}).first()
    await expect(page.locator('header .vibe-switch-icon')).toHaveCount(0)
    await button.click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'vibes')
    await expect(page.locator('html')).toHaveAttribute('data-vibe', 'cartoon')
    await expect(page.locator('link[href*="fonts.googleapis.com/css2"]')).toHaveCount(3)
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, {timeout: 15_000})
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'vibes')
  })

  test('the mobile drawer offers the segmented mode control', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'drawer exists only below md')
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')
    await page.click('header button.w-10.h-10')
    await page.locator('#mobile-nav .mode-switch').locator('label.seg-option:has-text("Vibes")').click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'vibes')
  })

  test('/about is a one-page cv with every section, newest job first', async ({page}) => {
    await page.goto('/en/about')
    await expect(page.locator('[data-stop]')).toHaveCount(0)
    await expect(page.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
    await expect(page.locator('.cv h2')).toHaveText(['Summary', 'Experience', 'Projects', 'Skills', 'Education', 'More'])
    const jobs = page.locator('.cv-job h3')
    await expect(jobs.first()).toContainText('FireGroup Technology')
    await expect(jobs).toHaveCount(3)
    // Bullets come from the admin API (9 once profile:sync has run; the bundled fallback has 9 too).
    expect(await page.locator('.cv-job').first().locator('li').count()).toBeGreaterThanOrEqual(6)
    await expect(page.getByRole('button', {name: 'Print / Save as PDF'})).toBeVisible()
    await expect(page.locator('.cv')).toContainText('quocdaijr@gmail.com')
  })

  test('/ is a short intro that points at the cv', async ({page}) => {
    await page.goto('/en')
    await expect(page.getByRole('heading', {level: 1, name: 'Nguyen Quoc Dai'})).toBeVisible()
    await expect(page.locator('.vibe-switch')).toHaveCount(0)
    await page.getByRole('link', {name: 'View my CV →'}).click()
    await expect(page).toHaveURL(/\/en\/about\/?$/)
  })

  test('print hides the chrome and keeps the sheet', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one project is enough')
    await page.goto('/en/about')
    await page.emulateMedia({media: 'print'})
    await expect(page.locator('.site-header')).toBeHidden()
    await expect(page.locator('.site-footer')).toBeHidden()
    await expect(page.locator('.cv')).toBeVisible()
    await expect(page.locator('.cv-head h1')).toBeVisible()
  })
})
