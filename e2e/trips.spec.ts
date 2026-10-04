import {expect, test} from '@playwright/test'

// The /trips showcase: a list of trips, and a trip page whose itinerary
// follows the vehicle the scene drives on its own.
const hasVehicle = (page: import('@playwright/test').Page, kind: string) =>
  page.evaluate((name) => !!(window as unknown as {__qdjrScene?: {screenPointOf(n: string): unknown}}).__qdjrScene?.screenPointOf(name), `vehicle-${kind}`)

test('lists every trip and opens one', async ({page}) => {
  await page.goto('/trips')
  await expect(page.getByRole('heading', {level: 1, name: 'Hành trình'})).toBeVisible()
  await expect(page.locator('.trip-row')).toHaveCount(3)
  await page.getByRole('link', {name: 'Đi thử →'}).first().click()
  await expect(page).toHaveURL(/\/trips\/sg-dalat$/)
  await expect(page.getByRole('heading', {level: 1, name: 'Sài Gòn → Đà Lạt'})).toBeVisible()
})

test('a trip page shows its itinerary, the credits and the moving place', async ({page}) => {
  test.setTimeout(120_000) // software WebGL in CI renders a few frames a second
  await page.goto('/en/trips/sg-phanthiet')
  const itinerary = page.locator('.itinerary')
  await expect(itinerary.locator('.it-stop')).toHaveText(['Saigon', 'Phan Thiet'])
  await expect(page.getByRole('radio', {name: 'motorbike'})).toBeChecked()
  await expect(page.getByRole('link', {name: 'OpenStreetMap'})).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')
  await expect(page.getByRole('link', {name: 'Valhalla'})).toBeVisible()
  // The vehicle starts parked at Saigon, then drives on to the next place.
  await expect(itinerary.locator('[aria-current="step"]')).toHaveText('Saigon')
  await expect(itinerary.locator('[aria-current="step"]')).not.toHaveText('Saigon', {timeout: 100_000})
})

test('picking another vehicle changes the road and the scene', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'scene hook checks on one project are enough')
  await page.goto('/en/trips/sg-phanthiet')
  await expect(page.getByText('Motorbikes may not use expressways')).toBeVisible()
  await expect.poll(() => hasVehicle(page, 'motorbike')).toBe(true)
  const motorbikeMeta = await page.locator('.trip-meta').textContent()
  await page.getByRole('radio', {name: 'car'}).check()
  await expect(page.getByText('Motorbikes may not use expressways')).toBeHidden()
  await expect(page.locator('.trip-meta')).not.toHaveText(motorbikeMeta!)
  await expect.poll(() => hasVehicle(page, 'car')).toBe(true)
})

test('an unknown trip is a 404', async ({page}) => {
  await page.goto('/trips/nowhere')
  await expect(page.getByText('Không tìm thấy trang bạn cần.')).toBeVisible()
})

test('switching language on a trip page keeps the trip scene', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the switch sits in the desktop header')
  await page.goto('/trips/sg-dalat')
  await expect.poll(() => hasVehicle(page, 'coach')).toBe(true)
  await page.locator('header').getByRole('link', {name: /English|EN/}).first().click()
  await expect(page).toHaveURL(/\/en\/trips\/sg-dalat$/)
  await expect(page.locator('.it-stop').first()).toHaveText('Saigon')
  await expect.poll(() => hasVehicle(page, 'coach')).toBe(true)
})

test('picking a place drives the vehicle there and parks it until told to drive on', async ({page}) => {
  test.setTimeout(120_000)
  await page.goto('/en/trips/sg-phanthiet')
  const itinerary = page.locator('.itinerary')
  await itinerary.getByRole('button', {name: 'Drive to Phan Thiet'}).click()
  await expect(page.getByRole('status')).toContainText('Phan Thiet')
  await expect(page.getByRole('status')).toContainText('Stopped at Phan Thiet', {timeout: 90_000}) // software WebGL under load renders a few frames a second
  await expect(itinerary.locator('[aria-current="step"]')).toHaveText('Phan Thiet')
  await page.getByRole('button', {name: 'Drive on →'}).click()
  await expect(page.getByRole('status')).toHaveCount(0)
})

test("switching to the driver's seat keeps the scene and is a radio", async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'scene hook checks on one project are enough')
  await page.goto('/en/trips/sg-dalat')
  await page.getByRole('radio', {name: "Driver's seat"}).check()
  await expect(page.getByRole('radio', {name: "Driver's seat"})).toBeChecked()
  // In the driver's seat the vehicle model is hidden, so the hook no longer finds it on screen.
  await expect.poll(() => page.evaluate(() => (window as unknown as {__qdjrScene?: {cameraPosition(): number[] | null}}).__qdjrScene?.cameraPosition()?.[1] ?? 99)).toBeLessThan(12)
})

test('leaving a trip page for the home page brings back the vibe scene', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'scene hook checks on one project are enough')
  await page.goto('/trips/sg-dalat')
  await expect.poll(() => hasVehicle(page, 'coach')).toBe(true)
  await page.locator('header a[href="/"]').first().click()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => hasVehicle(page, 'coach')).toBe(false)
})
