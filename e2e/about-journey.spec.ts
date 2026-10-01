import {expect, test} from '@playwright/test'

// Hello · What I do · 4 career stages · 10 projects (one stop each) · Say hello
const STOP_COUNT = 17
const FIRST_PROJECT_STOP = 6

test.describe('about journey', () => {
  test('renders one stop per section and per project, with ordered ids', async ({page}) => {
    await page.goto('/en/about')

    await expect(page.locator('[data-stop]')).toHaveCount(STOP_COUNT)
    for (let i = 0; i < STOP_COUNT; i++) {
      await expect(page.locator(`#stop-${i}`)).toBeAttached()
    }
    await expect(page.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
    await expect(page.locator(`#stop-${FIRST_PROJECT_STOP}`).getByRole('heading', {level: 2})).toHaveText(/OneMobile/)
  })

  test('only the centred stop is revealed; the next one waits', async ({page}) => {
    await page.goto('/about')
    await page.locator(`#stop-${FIRST_PROJECT_STOP}`).waitFor()

    await page.locator(`#stop-${FIRST_PROJECT_STOP}`).scrollIntoViewIfNeeded()
    await expect(page.locator(`#stop-${FIRST_PROJECT_STOP}`)).toHaveClass(/is-active/)
    await expect(page.locator(`#stop-${FIRST_PROJECT_STOP + 1}`)).not.toHaveClass(/is-active/)

    const opacity = (id: string) => page.locator(`${id} .stop-panel`).evaluate((el) => getComputedStyle(el).opacity)
    await expect.poll(() => opacity(`#stop-${FIRST_PROJECT_STOP}`)).toBe('1')
    expect(Number(await opacity(`#stop-${FIRST_PROJECT_STOP + 1}`))).toBeLessThan(1)
  })

  test('rail tracks the centred stop on desktop', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'rail is hidden below 60rem')
    await page.goto('/about')

    await page.locator('#stop-4').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '4')
    await expect(page.locator('.rail-dot[aria-current="step"]')).toHaveText(/04/)

    await page.locator('.rail-dot', {hasText: '16'}).click()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '16')
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
})
