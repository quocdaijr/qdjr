import {expect, test} from '@playwright/test'

const STOP_COUNT = 8

test.describe('about journey', () => {
  test('renders eight stops with ordered ids', async ({page}) => {
    await page.goto('/about')

    await expect(page.locator('[data-stop]')).toHaveCount(STOP_COUNT)
    for (let i = 0; i < STOP_COUNT; i++) {
      await expect(page.locator(`#stop-${i}`)).toBeAttached()
    }
    await expect(page.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
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
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only: the projects stop is several viewports tall')
    await page.goto('/about')
    await page.locator('#stop-6').waitFor() // SPA: stops mount after load

    // Scroll so the viewport centre sits well inside the projects stop
    // (document-relative top, not offsetTop, which is relative to the z-10 wrapper).
    await page.evaluate(() => {
      const el = document.querySelector('#stop-6') as HTMLElement
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({top: top + window.innerHeight * 1.2, behavior: 'instant'})
    })

    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
  })
})
