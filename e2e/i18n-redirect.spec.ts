import {expect, test} from '@playwright/test'

// Review Focus 1: an English-preferring browser lands on /en once; a manual
// switch back to Vietnamese is remembered (cookie i18n_lang). The rest of the
// suite pins vi-VN, so this file overrides the browser locale.
test.use({locale: 'en-US'})

test('an English browser is redirected from / to /en and the choice is remembered', async ({page, context}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the switch sits in the desktop nav')

  await page.goto('/')
  await expect(page).toHaveURL(/\/en\/?$/)
  expect((await context.cookies()).find((c) => c.name === 'i18n_lang')?.value).toBe('en')

  await page.locator('header nav .lang-switch').filter({visible: true}).first().click()
  await expect(page).toHaveURL(/localhost:\d+\/?$/)
  await expect.poll(async () => (await context.cookies()).find((c) => c.name === 'i18n_lang')?.value).toBe('vi')

  await page.goto('/')
  await expect(page).toHaveURL(/localhost:\d+\/?$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi-VN')
})
