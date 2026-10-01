// Pure helpers for machine-translating a Markdown post while keeping its
// structure: front matter, headings, lists, quotes, tables, links, code.
// No I/O and no network; the translator is injected (see translate-posts.mjs),
// so these rules are unit-tested with a fake (test/translateMarkdown.spec.ts).
//
// Strategy: each translatable line becomes a small HTML string in which
// everything that must survive verbatim is either an empty
// <span translate="no" data-k="N"> placeholder or a simple tag (<a>, <b>, <i>).
// Google Translate's html format keeps tags; if a placeholder is lost anyway,
// that line stays untranslated rather than losing a URL or a code span.
import {parse, stringify} from 'yaml'

const FENCE = /^\s*(```|~~~)/
const LINE_PREFIX = /^(\s*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+|>\s?)*)/
const KEEP_LINE = /^\s*(?:<|::|\{|$)/ // raw HTML, MDC components, attribute blocks, blank
const TABLE_ROW = /^\s*\|/
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/
const HAS_LETTER = /\p{L}/u
const MAX_SEGMENTS = 100
const MAX_CHARS = 25_000

const OPEN = '\u0000'
const CLOSE = '\u0001'

export function splitFrontMatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return {data: {}, body: raw}
  return {data: parse(match[1]) ?? {}, body: match[2]}
}

export function joinFrontMatter(data, body) {
  return `---\n${stringify(data).trimEnd()}\n---\n\n${body.replace(/^\n+/, '')}`
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function decodeHtml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Turn one line of inline Markdown into HTML with protected placeholders. */
export function protect(text) {
  const tokens = []
  const stash = (value) => {
    tokens.push(value)
    return `${OPEN}K${tokens.length - 1}${CLOSE}`
  }

  let s = text
  s = s.replace(/`[^`]+`/g, stash) // inline code
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, stash) // images
  s = s.replace(/<https?:\/\/[^>\s]+>/g, stash) // autolinks
  // One level of balanced parentheses in the URL, e.g. …/wiki/Foo_(bar).
  s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_m, label, url) => {
    tokens.push(url)
    return `${OPEN}A${tokens.length - 1}${CLOSE}${label}${OPEN}/A${CLOSE}`
  })
  s = s.replace(/\bhttps?:\/\/[^\s)]+/g, stash) // bare URLs
  s = s.replace(/\*\*([^*]+)\*\*/g, `${OPEN}B${CLOSE}$1${OPEN}/B${CLOSE}`)
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, `$1${OPEN}I${CLOSE}$2${OPEN}/I${CLOSE}`)
  s = s.replace(/(^|[^_\w])_([^_\s][^_]*)_(?!\w)/g, `$1${OPEN}I${CLOSE}$2${OPEN}/I${CLOSE}`)

  const html = escapeHtml(s)
    .replace(new RegExp(`${OPEN}K(\\d+)${CLOSE}`, 'g'), '<span translate="no" class="notranslate" data-k="$1"></span>')
    .replace(new RegExp(`${OPEN}A(\\d+)${CLOSE}`, 'g'), '<a data-k="$1">')
    .replace(new RegExp(`${OPEN}/A${CLOSE}`, 'g'), '</a>')
    .replace(new RegExp(`${OPEN}B${CLOSE}`, 'g'), '<b>')
    .replace(new RegExp(`${OPEN}/B${CLOSE}`, 'g'), '</b>')
    .replace(new RegExp(`${OPEN}I${CLOSE}`, 'g'), '<i>')
    .replace(new RegExp(`${OPEN}/I${CLOSE}`, 'g'), '</i>')

  return {html, tokens}
}

/** Inverse of protect(); null when any placeholder did not survive exactly once. */
export function restore(html, tokens) {
  const used = new Array(tokens.length).fill(0)
  const mark = (k) => {
    used[Number(k)] += 1
    return `${OPEN}T${k}${CLOSE}`
  }

  // Placeholders become sentinels first, so decoding the translated text can
  // never touch the protected code spans and URLs that go back in afterwards.
  const marked = html
    .replace(/<a\b[^>]*\bdata-k="(\d+)"[^>]*>([\s\S]*?)<\/a>/g, (_m, k, label) => `[${label.trim()}](${mark(k)})`)
    .replace(/<span\b[^>]*\bdata-k="(\d+)"[^>]*>\s*<\/span>/g, (_m, k) => mark(k))
    .replace(/<b>\s*([\s\S]*?)\s*<\/b>/g, '**$1**')
    .replace(/<i>\s*([\s\S]*?)\s*<\/i>/g, '*$1*')

  if (used.some((n) => n !== 1) || /<\/?(?:a|span|b|i)\b/.test(marked)) return null
  return decodeHtml(marked).replace(new RegExp(`${OPEN}T(\\d+)${CLOSE}`, 'g'), (_m, k) => tokens[Number(k)])
}

/** Call the translator in bounded batches; order of results matches sources. */
export async function translateInBatches(sources, translate) {
  const results = []
  let batch = []
  let chars = 0
  const flush = async () => {
    if (!batch.length) return
    results.push(...(await translate(batch)))
    batch = []
    chars = 0
  }
  for (const source of sources) {
    if (batch.length >= MAX_SEGMENTS || chars + source.length > MAX_CHARS) await flush()
    batch.push(source)
    chars += source.length
  }
  await flush()
  return results
}

function collectJobs(lines) {
  const jobs = []
  let inFence = false
  lines.forEach((line, index) => {
    if (FENCE.test(line)) {
      inFence = !inFence
      return
    }
    if (inFence || KEEP_LINE.test(line) || TABLE_SEPARATOR.test(line)) return

    if (TABLE_ROW.test(line)) {
      line.split('|').forEach((cell, cellIndex) => {
        if (HAS_LETTER.test(cell)) jobs.push({index, cellIndex, prefix: '', text: cell.trim(), ...protect(cell.trim())})
      })
      return
    }

    const prefix = LINE_PREFIX.exec(line)[1]
    const trailing = / {2,}$/.exec(line)?.[0] ?? '' // Markdown hard line break
    const text = line.slice(prefix.length, line.length - trailing.length)
    if (HAS_LETTER.test(text)) jobs.push({index, cellIndex: null, prefix, trailing, text, ...protect(text)})
  })
  return jobs
}

/** Translate a Markdown body line by line; returns the new body and how many units stayed untranslated. */
export async function translateMarkdownBody(body, translate) {
  const lines = body.split('\n')
  const jobs = collectJobs(lines)
  const translated = await translateInBatches(jobs.map((job) => job.html), translate)

  const out = [...lines]
  const cells = new Map()
  let keptLines = 0

  jobs.forEach((job, i) => {
    const restored = restore(translated[i], job.tokens)
    if (restored === null) keptLines += 1
    const value = restored === null ? job.text : restored.trim()
    if (job.cellIndex === null) {
      out[job.index] = job.prefix + value + job.trailing
      return
    }
    const row = cells.get(job.index) ?? lines[job.index].split('|')
    cells.set(job.index, row.map((cell, c) => (c === job.cellIndex ? ` ${value} ` : cell)))
  })
  cells.forEach((row, index) => {
    out[index] = row.join('|')
  })

  return {body: out.join('\n'), keptLines}
}

/** Translate a whole post file (front matter + body) and record provenance. */
export async function translatePost(raw, translate, {provider, sourceHash, now}) {
  const {data, body} = splitFrontMatter(raw)
  const head = [String(data.title ?? ''), String(data.description ?? '')].map((value) => ({value, ...protect(value)}))
  const translatedHead = await translate(head.map((h) => h.html))
  const [title, description] = head.map((h, i) => restore(translatedHead[i], h.tokens) ?? h.value)
  const {body: translatedBody, keptLines} = await translateMarkdownBody(body, translate)

  const out = {
    ...data,
    title,
    description,
    machineTranslated: true,
    translatedFrom: 'vi',
    translationProvider: provider,
    sourceHash,
    translatedAt: now
  }
  return {text: joinFrontMatter(out, translatedBody), keptLines}
}

/** Whether a post must be (re)translated, given the existing output (or null) and the source hash. */
export function needsTranslation(existingRaw, sourceHash, force) {
  if (force || existingRaw === null) return true
  return splitFrontMatter(existingRaw).data.sourceHash !== sourceHash
}

/** Parse translate-posts CLI flags. `--only` must name a post; a bare `--only` would otherwise translate (and bill) every post. */
export function parseCliArgs(argv) {
  const onlyAt = argv.indexOf('--only')
  const only = onlyAt >= 0 ? argv[onlyAt + 1] : null
  if (onlyAt >= 0 && (!only || only.startsWith('--'))) {
    throw new Error('--only needs a post name, e.g. --only hello-world')
  }
  return {force: argv.includes('--force'), dryRun: argv.includes('--dry-run'), only}
}
