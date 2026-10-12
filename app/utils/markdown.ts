import MarkdownIt from 'markdown-it'

// ponytail: no HTML sanitizer. Post bodies are written by authenticated admins
// in qdjr-admin, never by visitors; add DOMPurify/rehype-sanitize if authors
// ever become untrusted.
const md = new MarkdownIt({html: true, linkify: true})

/** Markdown (as stored in posts.content) → HTML for v-html. */
export function renderMarkdown(source: string): string {
  return md.render(source ?? '')
}
