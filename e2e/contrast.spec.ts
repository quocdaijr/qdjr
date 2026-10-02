import {expect, test} from '@playwright/test'

// WCAG 2.1 AA text contrast across every vibe × mode. For each visible text
// node the background is the nearest opaque ancestor (falling back to white,
// which is what the browser paints). Text drawn straight over the three.js
// canvas is measured against the page paper, an approximation the design
// accepts (see design.md, Marquee Hero).
const PAGES = ['/', '/about', '/blog', '/blog/hello-world', '/blog/search?q=zzzz', '/legacy-blogs', '/trang-khong-ton-tai']
const VIBES = ['terminal', 'cartoon', 'galaxy'] as const
const VN_NOON = new Date('2026-10-01T05:00:00Z')
const VN_NIGHT = new Date('2026-10-01T15:00:00Z')

interface Failure {
  page: string
  text: string
  ratio: number
  need: number
  classes: string
}

const collectFailures = () => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', {willReadFrequently: true})!
  const rgba = (css: string): number[] => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2], d[3] / 255]
  }
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const lum = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  const ratio = (a: number[], b: number[]) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }
  const backgroundOf = (el: Element | null): number[] => {
    for (let e = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor)
      if (c[3] > 0.5) return c
    }
    return [255, 255, 255, 1]
  }

  const failures: Array<Omit<Failure, 'page'>> = []
  const seen = new Set<string>()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const text = (node.textContent || '').trim()
    const el = node.parentElement
    if (!text || !el || !el.getClientRects().length) continue
    if (el.closest('[aria-hidden="true"], .sr-only, .invisible, #nuxt-devtools-container, nuxt-devtools-frame')) continue
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden') continue
    let opacity = 1
    for (let e: Element | null = el; e; e = e.parentElement) opacity *= Number(getComputedStyle(e).opacity)
    if (opacity < 0.9) continue

    const size = parseFloat(style.fontSize)
    const bold = Number(style.fontWeight) >= 700
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5
    const r = ratio(rgba(style.color), backgroundOf(el))
    const key = `${el.tagName}|${el.className}|${style.color}`
    if (r < need && !seen.has(key)) {
      seen.add(key)
      failures.push({text: text.slice(0, 40), ratio: Math.round(r * 100) / 100, need, classes: String(el.className).slice(0, 80)})
    }
  }
  return failures
}

for (const vibe of VIBES) {
  for (const [mode, time] of [['light', VN_NOON], ['dark', VN_NIGHT]] as const) {
    test(`text contrast meets WCAG AA — ${vibe} · ${mode}`, async ({page}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'one viewport is enough for colour')
      test.setTimeout(120_000)
      await page.clock.install({time})
      await page.addInitScript((v) => localStorage.setItem('vibe', v), vibe)

      const failures: Failure[] = []
      for (const path of PAGES) {
        await page.goto(path)
        await page.locator('main, svg.emoji-error').first().waitFor()
        await page.waitForTimeout(600)
        // Journey stops reveal on scroll; reveal them all so every panel is measured.
        await page.evaluate(() => document.querySelectorAll('.stop').forEach((s) => s.classList.add('is-active')))
        await page.waitForTimeout(500)
        const found = await page.evaluate(collectFailures)
        failures.push(...found.map((f) => ({page: path, ...f})))
      }

      expect(failures, JSON.stringify(failures, null, 1)).toEqual([])
    })
  }
}
