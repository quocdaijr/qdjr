import { test, expect } from '@playwright/test'

test('tag route swaps content between tags', async ({ page }) => {
  await page.goto('/blog/tag/nuxt')
  await expect(page.locator('main')).toContainText('Hello, World')
  await expect(page.locator('main')).not.toContainText('Claude Code')

  await page.goto('/blog/tag/ai')
  await expect(page.locator('main')).toContainText('Claude Code')
  await expect(page.locator('main')).not.toContainText('Hello, World')
})

test('category route swaps content between categories', async ({ page }) => {
  await page.goto('/blog/category/meta')
  await expect(page.locator('main')).toContainText('Hello, World')
  await page.goto('/blog/category/tools')
  await expect(page.locator('main')).toContainText('Claude Code')
})

test('blog index renders both posts (status loading state)', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.locator('article')).toHaveCount(2)
})
