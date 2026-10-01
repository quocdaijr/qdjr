import {describe, expect, test} from 'vitest'
import {needsTranslation, parseCliArgs, protect, restore, splitFrontMatter, translateMarkdownBody, translatePost} from '~~/scripts/translate/markdown.mjs'

// Stands in for Google: changes the words (prefix) but keeps every tag.
const fakeTranslate = async (segments: string[]) => segments.map((s) => `EN ${s}`)
// A careless translator that drops the placeholder spans.
const dropsPlaceholders = async (segments: string[]) => segments.map((s) => s.replace(/<span[^>]*><\/span>/g, ''))

describe('protect / restore', () => {
  test('round-trips code, links, emphasis and HTML-significant characters', () => {
    const source = 'Chạy `npm i` rồi đọc [tài liệu](https://nuxt.com/docs) — **rất** *hay* & a < b'
    const {html, tokens} = protect(source)
    expect(html).not.toContain('npm i')
    expect(html).not.toContain('https://nuxt.com')
    expect(restore(html, tokens)).toBe(source)
  })

  test('returns null when a placeholder is lost', () => {
    const {html, tokens} = protect('xem `code` nhé')
    expect(restore(html.replace(/<span[^>]*><\/span>/, ''), tokens)).toBeNull()
  })
})

describe('translateMarkdownBody', () => {
  test('translates prose and keeps Markdown structure', async () => {
    const body = ['## Xin chào', '', '- mục một', '> trích dẫn', '1. bước `một`'].join('\n')
    const {body: out, keptLines} = await translateMarkdownBody(body, fakeTranslate)
    expect(out.split('\n')).toEqual(['## EN Xin chào', '', '- EN mục một', '> EN trích dẫn', '1. EN bước `một`'])
    expect(keptLines).toBe(0)
  })

  test('never touches fenced code blocks', async () => {
    const body = ['```bash', 'echo "xin chào"', '```', 'văn bản'].join('\n')
    const {body: out} = await translateMarkdownBody(body, fakeTranslate)
    expect(out.split('\n')).toEqual(['```bash', 'echo "xin chào"', '```', 'EN văn bản'])
  })

  test('keeps a line verbatim when the translator drops a placeholder', async () => {
    const body = 'chạy `npm run dev` nhé'
    const {body: out, keptLines} = await translateMarkdownBody(body, dropsPlaceholders)
    expect(out).toBe(body)
    expect(keptLines).toBe(1)
  })

  test('translates table cells but not the separator row', async () => {
    const body = ['| Tên | Giá |', '| --- | --- |', '| Cà phê | 20k |'].join('\n')
    const {body: out} = await translateMarkdownBody(body, fakeTranslate)
    expect(out.split('\n')[1]).toBe('| --- | --- |')
    expect(out.split('\n')[2]).toContain('EN Cà phê')
  })
})

describe('translatePost', () => {
  const raw = ['---', 'title: "Xin chào"', 'description: "Mô tả"', 'publishedAt: 2026-04-19T09:00:00+07:00', 'tags:', '  - nuxt', '---', '', 'Nội dung'].join('\n')

  test('translates title, description and body, and records provenance', async () => {
    const {text} = await translatePost(raw, fakeTranslate, {provider: 'google-translate', sourceHash: 'abc', now: '2026-10-01T00:00:00.000Z'})
    const {data, body} = splitFrontMatter(text)
    expect(data.title).toBe('EN Xin chào')
    expect(data.description).toBe('EN Mô tả')
    expect(data.tags).toEqual(['nuxt'])
    expect(data.machineTranslated).toBe(true)
    expect(data.translatedFrom).toBe('vi')
    expect(data.sourceHash).toBe('abc')
    expect(body.trim()).toBe('EN Nội dung')
  })
})

describe('needsTranslation', () => {
  const existing = ['---', 'title: Hi', 'sourceHash: abc', '---', '', 'Body'].join('\n')

  test('skips a post whose source is unchanged', () => {
    expect(needsTranslation(existing, 'abc', false)).toBe(false)
  })

  test('translates when the source changed, when nothing exists yet, or when forced', () => {
    expect(needsTranslation(existing, 'def', false)).toBe(true)
    expect(needsTranslation(null, 'abc', false)).toBe(true)
    expect(needsTranslation(existing, 'abc', true)).toBe(true)
  })
})

describe('review fixes', () => {
  test('keeps HTML entities inside inline code exactly as written', () => {
    const source = 'Dùng `&lt;div&gt;` và `a &amp;&amp; b` trong code'
    const {html, tokens} = protect(source)
    expect(restore(html, tokens)).toBe(source)
  })

  test('keeps a whole link URL that contains parentheses', async () => {
    const body = 'Xem [wiki](https://en.wikipedia.org/wiki/Foo_(bar)) nhé'
    const {html, tokens} = protect(body)
    expect(tokens).toContain('https://en.wikipedia.org/wiki/Foo_(bar)')
    // Even if the translator moves text around the link, the URL survives intact.
    const moved = html.replace(' nhé', '').replace('Xem ', 'See ')
    expect(restore(moved, tokens)).toBe('See [wiki](https://en.wikipedia.org/wiki/Foo_(bar))')
  })

  test('preserves a Markdown hard line break (two trailing spaces)', async () => {
    const {body: out} = await translateMarkdownBody('dòng một  \ndòng hai', fakeTranslate)
    expect(out.split('\n')[0]).toBe('EN dòng một  ')
  })

  test('--only without a value is an error, not "translate everything"', () => {
    expect(() => parseCliArgs(['--only'])).toThrow(/--only needs a post name/)
    expect(parseCliArgs(['--only', 'hello-world', '--force'])).toEqual({force: true, dryRun: false, only: 'hello-world'})
  })
})
