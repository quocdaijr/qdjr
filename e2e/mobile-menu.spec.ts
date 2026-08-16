import {expect, Page, test} from '@playwright/test'

const HAMBURGER = 'header button.w-10.h-10'
const DRAWER = '.nav-mobile'
// `d` of the close (X) icon path, rendered only while the menu is open
const CLOSE_ICON = `${HAMBURGER} svg path[d^="M4.293"]`

/** Left edge of the drawer: 0 when fully slid in, negative while parked off-screen. */
const drawerX = async (page: Page) => (await page.locator(DRAWER).boundingBox())?.x

/**
 * Regression: clicking the hamburger used to open and immediately close the drawer within
 * the same click. Re-rendering the v-if icon detached the click's e.target, which made the
 * v-click-outside guard (el.contains(target)) report "outside" and run closeNav().
 *
 * This only reproduces with a real browser event — a synthetic dispatchEvent runs inside a
 * single JS stack, so Vue's re-render never flushes mid-propagation.
 */
test.describe('mobile nav drawer', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/')
    await expect(page.locator(HAMBURGER)).toBeVisible()
  })

  test('opens when the hamburger is clicked and stays open', async ({page}) => {
    expect(await drawerX(page)).toBeLessThan(0)

    await page.click(HAMBURGER)

    // fully slid in: left edge flush with the viewport, and it stays there
    await expect.poll(() => drawerX(page)).toBe(0)
    await expect(page.locator(CLOSE_ICON)).toBeVisible()
    await page.waitForTimeout(500)
    expect(await drawerX(page)).toBe(0)
  })

  test('closes when the hamburger is clicked again', async ({page}) => {
    await page.click(HAMBURGER)
    await expect.poll(() => drawerX(page)).toBe(0)

    await page.click(HAMBURGER)

    await expect.poll(() => drawerX(page)).toBeLessThan(0)
    await expect(page.locator(CLOSE_ICON)).toBeHidden()
  })

  test('closes when clicking outside the drawer', async ({page}) => {
    await page.click(HAMBURGER)
    await expect.poll(() => drawerX(page)).toBe(0)

    // The open drawer is w-11/12, so the only region outside it is the strip down the
    // right-hand edge. Click there, clear of the header row.
    const viewport = page.viewportSize()!
    await page.mouse.click(viewport.width - 8, 700)

    await expect.poll(() => drawerX(page)).toBeLessThan(0)
  })

  test('navigates and closes when a drawer link is clicked', async ({page}) => {
    await page.click(HAMBURGER)
    await expect.poll(() => drawerX(page)).toBe(0)

    await page.click(`${DRAWER} a[href="/blog"]`)

    await expect(page).toHaveURL(/\/blog\/?$/)
    await expect.poll(() => drawerX(page)).toBeLessThan(0)
  })

  test('drawer content is hidden from assistive tech and tab order while closed', async ({page}) => {
    await expect(page.locator(`${DRAWER} a[href="/blog"]`)).toBeHidden()
  })
})
