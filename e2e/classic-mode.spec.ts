import {expect, test} from '@playwright/test'
test.describe('classic mode (the v3.0.0 look, the default)', () => {
  test('the server renders the classic shell and the old home page', async ({request}) => {
    const html = await (await request.get('/en')).text()
    expect(html).toMatch(/<html[^>]*data-mode="classic"/)
    expect(html).not.toContain('data-vibe=')
    expect(html).toContain('Hi, I&#39;m Nguyen Quoc Dai')
  })

  test('home shows the greeting, the quote and both buttons', async ({page}) => {
    await page.goto('/en')
    await expect(page.getByRole('heading', {level: 1})).toContainText("Hi, I'm")
    await expect(page.getByRole('link', {name: 'More info'})).toHaveAttribute('href', '/en/about')
    await expect(page.getByRole('link', {name: 'Go to my blog'})).toHaveAttribute('href', '/en/blog')
  })

  test('renders no scene, no veil and no vibe fonts; the header is not pinned', async ({page}) => {
    await page.goto('/blog')
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'classic')
    await page.waitForTimeout(5000) // past SCENE_SETTLE_MS on phones
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(0)
    await expect(page.locator('.scene-veil')).toHaveCount(0)
    expect(await page.locator('link[href*="fonts.googleapis.com/css2"]').count()).toBe(0)
    expect(await page.locator('header.site-header').evaluate((el) => getComputedStyle(el).position)).toBe('static')
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

  test('a trip page still draws its road', async ({page}) => {
    await page.goto('/trips/sg-dalat')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, {timeout: 15_000})
  })

  test('the header switch cycles classic → cv → vibes and remembers it', async ({page}) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle') // hydrated: the click must reach Vue
    const button = page.locator('header .mode-switch-icon').filter({visible: true}).first()
    await button.click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'cv')
    await button.click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'vibes')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'vibes')
  })

  test('/about is the v3.0.0 layout fed by the live profile, in both languages', async ({page}) => {
    await page.goto('/en/about')
    const about = page.locator('.classic-about')
    await expect(page.locator('[data-stop], .cv')).toHaveCount(0)
    await expect(about.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
    await expect(about.locator('h2')).toHaveText(['Contact', 'Skills', 'More', 'Education & Experience', 'Projects'])
    await expect(about.locator('.classic-timeline > li:not([aria-hidden])')).toHaveCount(4)
    expect(await about.locator('.classic-projects > li').count()).toBeGreaterThanOrEqual(6)
    await expect(about).toContainText('quocdaijr@gmail.com')
    const english = await about.locator('.classic-summary').innerText()

    await page.goto('/about')
    await expect(about.locator('h2').first()).toHaveText('Liên hệ')
    expect(await about.locator('.classic-summary').innerText()).not.toBe(english)
  })

  test('/about never scrolls sideways', async ({page}) => {
    await page.goto('/en/about')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
