import {expect, test, type Page} from '@playwright/test'

// Clicking 3D scene objects (desktop, every vibe). Object positions come from
// the dev-only window.__qdjrScene hook; a candidate is used only if it is on
// screen and not under page UI, which must keep its own clicks.
const NAMES = {
  cartoon: {stop: (i: number) => `station-${i}`, project: (k: number) => `billboard-${k}`},
  galaxy: {stop: (i: number) => `galaxy-anchor-${i}`, project: (k: number) => `orbiter-${k}`},
  terminal: {stop: (i: number) => `arch-anchor-${i}`, project: (k: number) => `pod-${k}`}
} as const

interface Hook {
  screenPointOf(n: string): {x: number; y: number; behind: boolean} | null
  actionAt(x: number, y: number): {type: string; stop?: number; project?: number} | null
}

/** The first candidate whose screen point is free of page UI and really hits it in the scene. */
async function clickablePoint(page: Page, candidates: Array<{name: string; type: 'stop' | 'project'; value: number}>) {
  return page.evaluate((list) => {
    const hook = (window as unknown as {__qdjrScene: Hook}).__qdjrScene
    for (const c of list) {
      const p = hook.screenPointOf(c.name)
      if (!p || p.behind || p.x < 8 || p.y < 8 || p.x > innerWidth - 8 || p.y > innerHeight - 8) continue
      if (document.elementFromPoint(p.x, p.y)?.closest('a, button, .stop-panel, header, footer, nav, .rail')) continue
      // Objects are probed at their origin and a little above it (billboards stand on posts).
      for (const dy of [0, -12, -24, -36]) {
        const a = hook.actionAt(p.x, p.y + dy)
        if (a && a.type === c.type && (a.stop ?? a.project) === c.value) return {...c, x: p.x, y: p.y + dy}
      }
    }
    return null
  }, candidates)
}

for (const [vibe, names] of Object.entries(NAMES)) {
  test(`clicking the ${vibe} scene goes to a section and picks a project`, async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'pointer + desktop layout')
    test.setTimeout(60_000)
    await page.addInitScript((v) => localStorage.setItem('vibe', v), vibe)
    await page.goto('/about')
    await page.locator('#stop-2').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '2')
    await page.waitForTimeout(3000)

    const s = await clickablePoint(page, [3, 1, 4, 0, 5, 7, 6].map((i) => ({name: names.stop(i), type: 'stop' as const, value: i})))
    expect(s, 'a section object on screen').not.toBeNull()
    await page.mouse.click(s!.x, s!.y)
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', String(s!.value))

    await page.locator('#stop-6').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
    await page.waitForTimeout(3000)
    // The camera may still be settling: probe and click again until a pick lands.
    const candidates = [4, 5, 3, 6, 2, 7, 1, 8, 9].map((k) => ({name: names.project(k), type: 'project' as const, value: k}))
    await expect(async () => {
      const p = await clickablePoint(page, candidates)
      expect(p, 'a project object on screen').not.toBeNull()
      await page.mouse.click(p!.x, p!.y)
      await expect(page.locator('#stop-6 .picker-item').nth(p!.value)).toHaveAttribute('aria-pressed', 'true', {timeout: 1500})
    }).toPass({timeout: 15_000})
  })
}

test('clicking a panel never triggers the scene behind it', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one run is enough')
  await page.goto('/about')
  await page.locator('#stop-6').scrollIntoViewIfNeeded()
  await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
  await page.locator('#stop-6 .stop-title').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
})

test('hovering a scene object shows its name', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'pointer only')
  await page.addInitScript(() => localStorage.setItem('vibe', 'galaxy'))
  await page.goto('/en/about')
  await page.locator('#stop-2').scrollIntoViewIfNeeded()
  await page.waitForTimeout(3000)
  const s = await clickablePoint(page, [2, 1, 3].map((i) => ({name: `galaxy-anchor-${i}`, type: 'stop' as const, value: i})))
  expect(s).not.toBeNull()
  await page.mouse.move(s!.x, s!.y)
  await expect(page.locator('.scene-tip')).toBeVisible()
})
