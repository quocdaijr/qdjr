import {expect, test, type Page} from '@playwright/test'

// Drag to look around and zoom, on top of the scene's own camera.
const camera = (page: Page) =>
  page.evaluate(() => (window as unknown as {__qdjrScene: {cameraPosition(): number[] | null}}).__qdjrScene.cameraPosition())
const distance = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

test.describe('scene orbit and zoom', () => {
  test.beforeEach(({page: _page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'mouse + desktop layout')
  })

  test('the camera no longer follows the mouse', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('vibe', 'terminal'))
    await page.goto('/')
    await page.waitForTimeout(2000)
    const before = (await camera(page))!
    await page.mouse.move(20, 20)
    await page.mouse.move(1260, 780, {steps: 10})
    await page.waitForTimeout(1500)
    expect(distance((await camera(page))!, before)).toBeLessThan(1e-6)
  })

  test('dragging turns the view without navigating; reset puts it back', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('vibe', 'terminal'))
    await page.goto('/')
    await page.waitForTimeout(2000)
    const before = (await camera(page))!
    // An empty spot right of the hero: the footer (page UI) starts lower down and keeps its own clicks.
    await page.mouse.move(1100, 420)
    await page.mouse.down()
    await page.mouse.move(900, 370, {steps: 12})
    await page.mouse.up()
    await page.waitForTimeout(300)
    expect(distance((await camera(page))!, before)).toBeGreaterThan(1)
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', {name: 'Reset góc nhìn'}).click()
    await page.waitForTimeout(300)
    expect(distance((await camera(page))!, before)).toBeLessThan(1e-6)
    await expect(page.getByRole('button', {name: 'Reset góc nhìn'})).toHaveCount(0)
  })

  test('the zoom buttons bring the camera closer and further', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('vibe', 'cartoon'))
    await page.goto('/en/')
    await page.waitForTimeout(2000)
    const origin = (await camera(page))!
    const far = Math.hypot(...origin)
    await page.getByRole('button', {name: 'Zoom in'}).click()
    await page.waitForTimeout(300)
    expect(Math.hypot(...(await camera(page))!)).toBeLessThan(far)
    await page.getByRole('button', {name: 'Zoom out'}).click()
    await page.getByRole('button', {name: 'Zoom out'}).click()
    await page.waitForTimeout(300)
    expect(Math.hypot(...(await camera(page))!)).toBeGreaterThan(far)
  })

  test('on the journey the wheel still scrolls; ctrl + wheel zooms', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('vibe', 'galaxy'))
    await page.goto('/about')
    await page.locator('#stop-0').waitFor()
    await page.waitForTimeout(1500)
    await page.mouse.move(1150, 500)
    await page.mouse.wheel(0, 900)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)

    await page.waitForTimeout(2500)
    const scrolled = await page.evaluate(() => window.scrollY)
    const before = (await camera(page))!
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -400)
    await page.keyboard.up('Control')
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrolled)
    expect(distance((await camera(page))!, before)).toBeGreaterThan(0.2)
  })
})
