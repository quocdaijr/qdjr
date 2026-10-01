import {expect, test} from '@playwright/test'

test.describe('languages', () => {
  test('Vietnamese is the default and English lives under /en', async ({page}) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi-VN')
    await expect(page.getByRole('link', {name: 'Về tôi →'})).toBeVisible()

    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page.getByRole('link', {name: 'About me →'})).toBeVisible()
  })

  test('hreflang alternates are emitted for both languages', async ({page}) => {
    await page.goto('/about')
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute('href', /\/en\/about$/)
    await expect(page.locator('link[rel="alternate"][hreflang="vi-VN"]')).toHaveAttribute('href', /\/about$/)
  })
})
