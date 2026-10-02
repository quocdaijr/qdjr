import {expect, test} from '@playwright/test'

// Hello · What I do · 4 career stages · Projects (one stop, with a picker) · Say hello
const STOP_COUNT = 8
const PROJECTS_STOP = 6
const CONTACT_STOP = 7
const PROJECT_COUNT = 10

test.describe('about journey', () => {
  test('renders one stop per section, with ordered ids', async ({page}) => {
    await page.goto('/en/about')

    await expect(page.locator('[data-stop]')).toHaveCount(STOP_COUNT)
    for (let i = 0; i < STOP_COUNT; i++) {
      await expect(page.locator(`#stop-${i}`)).toBeAttached()
    }
    await expect(page.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
    await expect(page.locator(`#stop-${PROJECTS_STOP}`).getByRole('heading', {level: 2})).toHaveText('Projects')
    await expect(page.locator(`#stop-${PROJECTS_STOP} .picker-item`)).toHaveCount(PROJECT_COUNT)
  })

  test('only the centred stop is revealed; the next one waits', async ({page}) => {
    await page.goto('/about')
    await page.locator(`#stop-${PROJECTS_STOP}`).waitFor()

    await page.locator(`#stop-${PROJECTS_STOP}`).scrollIntoViewIfNeeded()
    await expect(page.locator(`#stop-${PROJECTS_STOP}`)).toHaveClass(/is-active/)
    await expect(page.locator(`#stop-${CONTACT_STOP}`)).not.toHaveClass(/is-active/)

    const opacity = (id: string) => page.locator(`${id} .stop-panel`).evaluate((el) => getComputedStyle(el).opacity)
    await expect.poll(() => opacity(`#stop-${PROJECTS_STOP}`)).toBe('1')
    expect(Number(await opacity(`#stop-${CONTACT_STOP}`))).toBeLessThan(1)
  })

  test('rail tracks the centred stop on desktop', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'rail is hidden below 60rem')
    await page.goto('/about')

    await page.locator('#stop-4').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '4')
    await expect(page.locator('.rail-dot[aria-current="step"]')).toHaveText(/04/)

    await page.locator('.rail-dot', {hasText: '07'}).click()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '7')
  })

  test('the journey page opts into smooth scrolling (blog routes do not)', async ({page}) => {
    await page.goto('/about')
    await page.locator('#stop-0').waitFor()

    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
    expect(behavior).toBe('smooth')
  })

  test('a stop taller than the viewport still becomes active on mobile', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only: the skills stop is more than one viewport tall')
    await page.goto('/about')
    await page.locator('#stop-1').waitFor() // SPA: stops mount after load

    // Scroll so the viewport centre sits well inside the skills stop
    // (document-relative top, not offsetTop, which is relative to the z-10 wrapper).
    await page.evaluate(() => {
      const el = document.querySelector('#stop-1') as HTMLElement
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({top: top + window.innerHeight * 0.9, behavior: 'instant'})
    })

    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '1')
  })

  test('the cartoon train can be driven through the whole journey without errors', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one run is enough')
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.addInitScript(() => localStorage.setItem('vibe', 'cartoon'))

    await page.goto('/about')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1)
    for (const stop of [3, 6, 7, 0, 5]) {
      await page.locator(`#stop-${stop}`).scrollIntoViewIfNeeded()
      await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', String(stop))
    }
    await page.locator(`#stop-${PROJECTS_STOP}`).scrollIntoViewIfNeeded()
    for (const k of [4, 9, 0]) await page.locator(`#stop-${PROJECTS_STOP} .picker-item`).nth(k).click()
    await page.waitForTimeout(3000)
    expect(errors).toEqual([])
  })

  test('the projects picker switches the detail by click and keyboard', async ({page}) => {
    await page.goto('/en/about')
    const stop = page.locator(`#stop-${PROJECTS_STOP}`)
    await stop.scrollIntoViewIfNeeded()
    const items = stop.locator('.picker-item')
    const title = stop.locator('.picker-detail h3')
    await expect(items.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(title).toHaveText(/OneMobile/)

    await items.nth(2).click()
    await expect(title).toHaveText(/Transcy/)
    await expect(items.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(items.first()).toHaveAttribute('aria-pressed', 'false')

    await page.keyboard.press('ArrowDown')
    await expect(title).toHaveText(/Swift/)
    await expect(items.nth(3)).toBeFocused()
    await page.keyboard.press('End')
    await expect(title).toHaveText(/Tuoi Tre Internal/)
    await page.keyboard.press('ArrowDown') // wraps
    await expect(title).toHaveText(/OneMobile/)

    // Only the picked project is in the tab order.
    await expect(items.locator('xpath=self::*[@tabindex="0"]')).toHaveCount(1)
    await stop.getByRole('button', {name: 'Next project'}).click()
    await expect(title).toHaveText(/OneLoyalty/)
    await expect(stop.locator('.picker-group')).toHaveText(['FireGroup Technology', 'Tuoi Tre Newspaper'])
  })

  test('switching projects does not change the stop height', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one layout is enough')
    await page.goto('/en/about')
    const stop = page.locator(`#stop-${PROJECTS_STOP}`)
    await stop.scrollIntoViewIfNeeded()
    const heights: number[] = []
    for (let k = 0; k < PROJECT_COUNT; k++) {
      await stop.locator('.picker-item').nth(k).click()
      await page.waitForTimeout(400) // out-in transition
      heights.push((await stop.locator('.stop-panel').boundingBox())!.height)
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2)
  })
})
