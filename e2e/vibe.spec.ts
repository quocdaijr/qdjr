import {expect, test} from '@playwright/test'

const HTML = 'html'
const HAMBURGER = 'header button.w-10.h-10'
// The radio itself is sr-only; users (and Playwright) click its visible label.
const SEGMENTED_OPTION = (label: string) => `label.vibe-switch-option:has-text("${label}")`
// The scene mounts once the page has settled after load (4 s on phones, whenIdle + SCENE_SETTLE_MS).
const SCENE_WAIT = {timeout: 15_000}

test.describe('vibe switcher', () => {
  test('defaults to cartoon and the header button cycles without console errors', async ({page}) => {
    const errors: string[] = []
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/blog')
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')

    const button = page.locator('header .vibe-switch-icon').filter({visible: true}).first()
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')

    expect(errors).toEqual([])
  })

  test('the default cartoon vibe has its body font from the first paint; a picked vibe persists across reloads', async ({page}) => {
    await page.goto('/blog')
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(font).toContain('Bricolage Grotesque')

    await page.locator('header .vibe-switch-icon').filter({visible: true}).first().click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
    await page.reload()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
  })

  test('the page shell already carries the cartoon vibe before any script runs', async ({request}) => {
    const html = await (await request.get('/')).text()
    expect(html).toMatch(/<html[^>]*data-vibe="cartoon"/)
  })

  test('the mobile drawer exposes the segmented control', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'drawer exists only below md')

    await page.goto('/blog')
    await page.click(HAMBURGER)
    await page.locator(SEGMENTED_OPTION('Galaxy')).click()

    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
  })

  test('hero control switches the vibe and the heading renders before any canvas', async ({page}) => {
    await page.goto('/en')

    await expect(page.getByRole('heading', {level: 1, name: 'Nguyen Quoc Dai'})).toBeVisible()
    // The mobile drawer holds a second (hidden) segmented control; scope to the hero.
    await page.locator('.hero').locator(SEGMENTED_OPTION('Cartoon')).click()

    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
  })

  test('scene canvas exists on every page, behind a veil where the page has no panels', async ({page}) => {
    await page.goto('/en')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)

    await page.getByRole('link', {name: 'About me →'}).click()
    await expect(page).toHaveURL(/\/about\/?$/)
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)

    await expect(page.locator('.scene-veil')).toHaveCount(0)

    await page.goto('/en/blog')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)
    await expect(page.locator('.scene-veil')).toHaveCount(1)

    await page.goto('/en/trips')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)
  })

  test('rapid vibe switching with a live renderer, then leaving the page, logs no errors', async ({page}) => {
    const errors: string[] = []
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/en')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)

    // Dispose-then-build runs synchronously on every click; no waits between.
    const hero = page.locator('.hero')
    for (const label of ['Cartoon', 'Galaxy', 'Terminal', 'Galaxy', 'Cartoon', 'Terminal']) {
      await hero.locator(SEGMENTED_OPTION(label)).click()
    }
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)

    // Leave for a page with its own scene (a trip): the vibe scene is disposed and replaced without touching a disposed scene.
    await page.goto('/en/trips')
    await page.getByRole('link', {name: 'Ride along →'}).first().click()
    await expect(page.locator('.trip-panel')).toBeVisible()
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1, SCENE_WAIT)

    expect(errors).toEqual([])
  })
})
