import {defineConfig, devices} from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    // The site redirects English-preferring browsers from / to /en on first
    // visit. Pin the browser to Vietnamese so / stays the Vietnamese page.
    locale: 'vi-VN',
    trace: 'on-first-retry'
  },
  // Screenshot comparison budget. 0 while triaging a change; a small ratio keeps
  // CI from tripping on font antialiasing.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled'
    }
  },
  projects: [
    {
      // Chromium-based mobile emulation: the drawer bug is a DOM-event-ordering
      // issue, not engine-specific, and this keeps the suite runnable without a
      // separate WebKit download.
      name: 'mobile',
      use: {...devices['Pixel 7']}
    },
    {
      // The layout is heavily md:-branched, and the Tailwind v4 utilities most
      // likely to regress it (max-w-screen-*, flex-grow) only apply above the
      // mobile breakpoint. A mobile-only suite cannot see those.
      name: 'desktop',
      use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 800}},
      // The drawer only exists below the md breakpoint; its hamburger is hidden
      // at this viewport, so that spec is mobile-only by construction.
      testIgnore: /mobile-menu\.spec\.ts/
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
