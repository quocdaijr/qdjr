import {expect, test} from '@playwright/test'

const HTML = 'html'
const HAMBURGER = 'header button.w-10.h-10'
// The radio itself is sr-only; users (and Playwright) click its visible label.
const SEGMENTED_OPTION = (label: string) => `label.vibe-switch-option:has-text("${label}")`

test.describe('vibe switcher', () => {
  test('defaults to terminal and the header button cycles without console errors', async ({page}) => {
    const errors: string[] = []
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/blog')
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')

    const button = page.getByRole('button', {name: /^Vibe:/}).first()
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')

    expect(errors).toEqual([])
  })

  test('cartoon vibe swaps the body font and persists across reloads', async ({page}) => {
    await page.goto('/blog')
    const button = page.getByRole('button', {name: /^Vibe:/}).first()
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')

    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(font).toContain('Bricolage Grotesque')

    await page.reload()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
  })

  test('the mobile drawer exposes the segmented control', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'drawer exists only below md')

    await page.goto('/blog')
    await page.click(HAMBURGER)
    await page.locator(SEGMENTED_OPTION('Galaxy')).click()

    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
  })
})
