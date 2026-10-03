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

  test('the chrome follows the language', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop nav')
    await page.goto('/blog')
    await expect(page.locator('header nav').filter({visible: true}).first()).toContainText('Giới thiệu')
    await expect(page.locator('#site-search').first()).toHaveAttribute('placeholder', 'Tìm bài viết ...')

    await page.goto('/en/blog')
    await expect(page.locator('header nav').filter({visible: true}).first()).toContainText('About')
    await expect(page.locator('#site-search').first()).toHaveAttribute('placeholder', 'Search post ...')
  })

  test('nav labels stay on one line and clear of the search box at every desktop width', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop nav')
    await page.addInitScript(() => localStorage.setItem('vibe', 'cartoon')) // bordered pills: the widest nav
    for (const width of [768, 900, 1024, 1280]) {
      await page.setViewportSize({width, height: 800})
      await page.goto('/')
      const nav = page.locator('header nav').filter({visible: true}).first()
      await expect(nav).toContainText('Giới thiệu')
      // Distinct line tops of each label's text: more than one means it wrapped.
      const lines = await nav.locator('a').evaluateAll((links) =>
        links.map((a) => {
          const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
          const tops = new Set<number>()
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.textContent?.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            for (const rect of range.getClientRects()) tops.add(Math.round(rect.top))
          }
          return tops.size
        })
      )
      expect(lines, `wrapped label at ${width}px`).toEqual(lines.map(() => 1))
      const search = await page.locator('header form[role="search"]').filter({visible: true}).first().boundingBox()
      const first = await nav.locator('a').first().boundingBox()
      expect(first!.x, `nav overlaps search at ${width}px`).toBeGreaterThanOrEqual(search!.x + search!.width)
    }
  })

  test('the language switch keeps the current page', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop nav holds the switch')
    await page.goto('/about')
    await page.locator('header nav .lang-switch').filter({visible: true}).first().click()
    await expect(page).toHaveURL(/\/en\/about\/?$/)

    await page.locator('header nav .lang-switch').filter({visible: true}).first().click()
    await expect(page).toHaveURL(/\/about\/?$/)
    await expect(page).not.toHaveURL(/\/en\//)
  })

  test('the 404 page speaks the current language', async ({page}) => {
    await page.goto('/trang-khong-ton-tai')
    await expect(page.getByText('Xin lỗi, không tìm thấy nội dung bạn cần!')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi-VN')
    await page.goto('/en/page-that-does-not-exist')
    await expect(page.getByText("Sorry, We couldn't find what you are looking for!")).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  })

  test('the journey rail is labelled in the page language', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'rail is hidden below 60rem')
    await page.goto('/about')
    await expect(page.locator('nav.rail')).toHaveAttribute('aria-label', 'Các chặng hành trình')
    await expect(page.locator('.rail-link').first()).toHaveText('Xin chào')
    await page.goto('/en/about')
    await expect(page.locator('nav.rail')).toHaveAttribute('aria-label', 'Journey stops')
    await expect(page.locator('.rail-link').first()).toHaveText('Hello')
  })

  test('profile content is translated, not just the chrome', async ({page}) => {
    await page.goto('/about')
    await page.locator('#stop-5').waitFor()
    // Job titles stay in English; the surrounding copy is Vietnamese.
    await expect(page.locator('#stop-5')).toContainText('Senior Backend Software Engineer')
    await expect(page.locator('#stop-5')).toContainText('Thành tựu chính')

    await page.goto('/en/about')
    await page.locator('#stop-5').waitFor()
    await expect(page.locator('#stop-5')).toContainText('Senior Backend Software Engineer')
  })
})
