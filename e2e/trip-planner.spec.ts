import {readFileSync} from 'node:fs'
import path from 'node:path'
import {expect, test, type Page} from '@playwright/test'

// Phase 2: a visitor plans their own trip. The two API routes are mocked so
// the test never calls the OSM services: the planned trip is a curated one
// cut down to the vehicle asked for, as /api/trips/plan returns it.
const CURATED = JSON.parse(readFileSync(path.resolve('app/data/trips/sg-phanthiet.json'), 'utf8'))
const PLACES: Record<string, Array<{name: string; detail: string; lat: number; lng: number}>> = {
  'chợ': [{name: 'Chợ Bến Thành', detail: 'Bến Thành, Thành phố Hồ Chí Minh', lat: 10.77253, lng: 106.69804}],
  phan: [{name: 'Phan Thiết', detail: 'Lâm Đồng', lat: 10.9289, lng: 108.1021}],
  'mũi': [{name: 'Mũi Né', detail: 'Phan Thiết', lat: 10.9333, lng: 108.2833}]
}

async function mockApis(page: Page, {fail}: {fail?: number} = {}) {
  const asked: Array<{stops: unknown[]; vehicle: string}> = []
  await page.route('**/api/trips/places?*', (route) => {
    const q = new URL(route.request().url()).searchParams.get('q')!.toLowerCase()
    const key = Object.keys(PLACES).find((k) => q.startsWith(k))
    return route.fulfill({json: key ? PLACES[key] : []})
  })
  await page.route('**/api/trips/plan', async (route) => {
    const body = route.request().postDataJSON()
    asked.push(body)
    if (fail) return route.fulfill({status: fail, json: {statusCode: fail}})
    const v = body.vehicle
    const trip = {...CURATED, slug: `plan-test-${v}`, title: {vi: 'Chợ Bến Thành → Phan Thiết', en: 'Chợ Bến Thành → Phan Thiết'}, summary: {vi: '', en: ''}, vehicle: v, variants: {[v]: CURATED.variants[v]}}
    return route.fulfill({json: trip})
  })
  return asked
}

async function pick(page: Page, nth: number, typed: string, name: string) {
  await page.getByRole('combobox').nth(nth).fill(typed)
  await page.getByRole('option', {name: new RegExp(name)}).click()
}

test('plans a trip from the form and shows it with its itinerary', async ({page}) => {
  const asked = await mockApis(page)
  await page.goto('/trips')
  await expect(page.getByRole('heading', {name: 'Tự lên lịch trình'})).toBeVisible()

  // Submitting before picking says what is missing.
  await page.getByRole('button', {name: 'Lên lịch trình →'}).click()
  await expect(page.getByRole('alert')).toHaveText('Chọn đủ địa điểm từ list gợi ý trước đã nhé.')

  await pick(page, 0, 'Chợ Bến', 'Chợ Bến Thành')
  // Keyboard: arrows and Enter pick a suggestion too.
  await page.getByRole('combobox').nth(1).fill('Phan')
  await expect(page.getByRole('option')).toHaveCount(1)
  await page.getByRole('combobox').nth(1).press('Enter')
  await expect(page.getByRole('combobox').nth(1)).toHaveValue('Phan Thiết')

  await page.getByRole('button', {name: 'Lên lịch trình →'}).click()
  await expect(page).toHaveURL(/\/trips\/plan\?stop=.+&stop=.+&v=motorbike/)
  await expect(page.locator('.trip-panel h1')).toHaveText('Chợ Bến Thành → Phan Thiết')
  await expect(page.locator('.it-stop')).toHaveText(['Sài Gòn', 'Phan Thiết']) // the stops of the mocked trip
  expect(asked[0]).toEqual({
    stops: [
      {name: 'Chợ Bến Thành', lat: 10.77253, lng: 106.69804},
      {name: 'Phan Thiết', lat: 10.9289, lng: 108.1021}
    ],
    vehicle: 'motorbike'
  })
})

test('adds, reorders and removes stops', async ({page}) => {
  await mockApis(page)
  await page.goto('/trips')
  await pick(page, 0, 'Chợ', 'Chợ Bến Thành')
  await pick(page, 1, 'Phan', 'Phan Thiết')
  await page.getByRole('button', {name: '+ Thêm điểm đến'}).click()
  await pick(page, 2, 'Mũi', 'Mũi Né')
  await page.getByRole('button', {name: 'Đưa Mũi Né lên trước'}).click()
  const values = await page.getByRole('combobox').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
  expect(values).toEqual(['Chợ Bến Thành', 'Mũi Né', 'Phan Thiết'])
  await page.getByRole('button', {name: 'Bỏ Mũi Né'}).click()
  await expect(page.getByRole('combobox')).toHaveCount(2)
  await expect(page.getByRole('button', {name: /^Bỏ /}).first()).toBeDisabled() // two stops is the least
})

test('a road that cannot be found says so and offers a retry; editing brings the form back filled in', async ({page}) => {
  await mockApis(page, {fail: 422})
  await page.goto('/trips/plan?stop=10.77253,106.69804,Chợ Bến Thành&stop=10.9289,108.1021,Phan Thiết&v=car')
  await expect(page.getByRole('alert')).toHaveText('Không có đường nào nối mấy chỗ này.')
  await expect(page.getByRole('button', {name: 'Thử lại'})).toBeVisible()
  await page.getByRole('link', {name: '← Sửa lịch trình'}).click()
  await expect(page).toHaveURL(/\/trips\?stop=/)
  const values = await page.getByRole('combobox').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
  expect(values).toEqual(['Chợ Bến Thành', 'Phan Thiết'])
  await expect(page.getByRole('radio', {name: 'ô tô'})).toBeChecked()
})

test('switching vehicle asks for that vehicle’s road', async ({page}) => {
  const asked = await mockApis(page)
  await page.goto('/en/trips/plan?stop=10.77253,106.69804,Chợ Bến Thành&stop=10.9289,108.1021,Phan Thiết&v=motorbike')
  await expect(page.locator('.trip-panel')).toBeVisible({timeout: 15_000}) // late in a long run, software WebGL is slow to first paint
  await page.getByRole('radio', {name: 'car'}).check()
  await expect(page).toHaveURL(/v=car/)
  await expect.poll(() => asked.map((a) => a.vehicle)).toEqual(['motorbike', 'car'])
  await expect(page.locator('.trip-meta')).toContainText(`${CURATED.variants.car.distanceKm} km`)
})

test('a link without stops says so', async ({page}) => {
  await page.goto('/trips/plan')
  await expect(page.getByText('Link này không có lịch trình nào.')).toBeVisible()
})

test('the server render of a shared plan link only shows the waiting panel; the browser asks for the road', async ({request}) => {
  // A crawler following a shared link must not spend a plan on the OSM services.
  const html = await (await request.get('/trips/plan?stop=10.77253,106.69804,A&stop=10.9289,108.1021,B&v=car')).text()
  expect(html).toContain('plan-loading')
  expect(html).not.toContain('trip-panel')
})
