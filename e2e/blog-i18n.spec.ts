import {expect, test} from '@playwright/test'

test.describe('bilingual blog', () => {
  test('an English post is labelled, and a machine translation links to the original', async ({page}) => {
    await page.goto('/en/blog/hello-world')
    const notice = page.locator('[data-translation-notice]')
    await expect(notice).toBeVisible()

    // Which label appears depends on whether `npm run translate:posts` has run
    // (it needs an API key); both must explain what the reader is looking at.
    if ((await notice.getAttribute('data-kind')) === 'machine') {
      await expect(notice.getByRole('link')).toHaveAttribute('href', '/blog/hello-world')
      await expect(page.locator('article[lang="en"]')).toBeAttached()
    } else {
      await expect(page.locator('article[lang="vi"]')).toBeAttached()
    }
  })

  test('the Vietnamese original carries no translation notice', async ({page}) => {
    await page.goto('/blog/hello-world')
    await expect(page.locator('article.prose')).toBeVisible()
    await expect(page.locator('[data-translation-notice]')).toHaveCount(0)
  })

  test('every post in the English list carries a translation label', async ({page}) => {
    await page.goto('/en/blog')
    const posts = page.locator('main article')
    await expect(posts).toHaveCount(2)
    await expect(page.locator('main article .translation-badge')).toHaveCount(2)
  })

  test('blog chrome is translated', async ({page}) => {
    await page.goto('/blog/search')
    await expect(page.locator('main')).toContainText('Nhập từ khóa tìm kiếm ở trên')
    await page.goto('/en/blog/search')
    await expect(page.locator('main')).toContainText('Enter a search term above')
  })
})
