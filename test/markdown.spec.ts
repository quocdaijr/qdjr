import {describe, expect, test} from 'vitest'
import {renderMarkdown} from '~/utils/markdown'

describe('renderMarkdown', () => {
  test('renders headings, links and fenced code', () => {
    const html = renderMarkdown('# Hi\n\n[x](https://qdjr.dev)\n\n```ts\nconst a = 1\n```\n')
    expect(html).toContain('<h1>Hi</h1>')
    expect(html).toContain('<a href="https://qdjr.dev">x</a>')
    expect(html).toContain('<pre><code class="language-ts">')
  })

  test('keeps raw HTML written by the admin and tolerates empty input', () => {
    expect(renderMarkdown('<video src="a.mp4"></video>')).toContain('<video src="a.mp4">')
    expect(renderMarkdown('')).toBe('')
  })
})
