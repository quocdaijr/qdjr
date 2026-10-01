import {expect, test} from '@playwright/test'

// Guards the Tailwind v4 utility renames that are structural rather than
// cosmetic. `max-w-screen-lg` and `flex-grow` were removed in v4; if their
// replacements ever stop emitting, the container loses its width cap and the
// sticky footer collapses. Both symptoms are invisible at mobile widths, which
// is why these assertions run on the desktop project.

test('content container is width-capped, not full-bleed', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only layout assertion')

  await page.goto('/blog')
  await expect(page.locator('main')).toBeVisible()

  const header = page.locator('header').first()
  const box = await header.boundingBox()
  const viewport = page.viewportSize()!

  // max-w-(--breakpoint-lg) is 64rem = 1024px. If the utility failed to emit,
  // the header would stretch to the full 1280px viewport.
  expect(box).not.toBeNull()
  expect(box!.width).toBeLessThan(viewport.width)
})

test('main stretches to meet the footer (grow applied)', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only layout assertion')

  // A short page, so the column has slack to distribute. On a long page main
  // overflows anyway and the assertion would pass with or without `grow`.
  await page.goto('/blog/tag/nuxt')
  await expect(page.locator('main')).toBeVisible()

  const main = (await page.locator('main').boundingBox())!
  const footer = (await page.locator('footer').first().boundingBox())!

  // The parent is `flex flex-col justify-between h-screen`, so justify-between
  // pins the footer to the bottom whether or not `grow` is present. What `grow`
  // actually controls is main filling the slack: without it main collapses to
  // content height and leaves a visible gap above the footer.
  expect(main.y + main.height).toBeCloseTo(footer.y, 0)
})

// Dark mode follows the Vietnam clock (UTC+7), not a stored preference.
const VN_NIGHT = new Date('2026-10-01T15:00:00Z') // 22:00 in Vietnam
const VN_NOON = new Date('2026-10-01T05:00:00Z') // 12:00 in Vietnam

test('dark mode applies at night in Vietnam', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'runs once, on desktop')

  await page.clock.install({time: VN_NIGHT})
  await page.goto('/blog')

  await expect(page.locator('html')).toHaveClass(/dark/)

  // body carries `dark:bg-gray-900`; the remapped token is a dark tinted paper.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).not.toBe('rgb(249, 250, 251)')
})

test('light mode applies at noon in Vietnam', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'runs once, on desktop')

  await page.clock.install({time: VN_NOON})
  await page.goto('/blog')

  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
