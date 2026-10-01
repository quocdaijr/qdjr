#!/usr/bin/env node
// Machine-translates the Vietnamese originals in content/blog/ into English
// in content/en/blog/, using Google Cloud Translation API v2.
//
//   GOOGLE_TRANSLATE_API_KEY=… npm run translate:posts             new or changed posts
//   GOOGLE_TRANSLATE_API_KEY=… npm run translate:posts -- --force  everything
//   npm run translate:posts -- --dry-run                           no network; prints a preview
//   npm run translate:posts -- --only hello-world                  one post
//
// Idempotent: every output records the SHA-256 of its source and is skipped
// while the source is unchanged. Every output is flagged machineTranslated, so
// the site labels it and links back to the original.
import {createHash} from 'node:crypto'
import {existsSync} from 'node:fs'
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {needsTranslation, parseCliArgs, translatePost} from './translate/markdown.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'content/blog')
const TARGET_DIR = path.join(ROOT, 'content/en/blog')
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'
const SOURCE_LANG = 'vi'
const TARGET_LANG = 'en'
const PROVIDER = 'google-translate'
const PREVIEW_LINES = 40

let cli
try {
  cli = parseCliArgs(process.argv.slice(2))
} catch (error) {
  console.error(`translate:posts failed: ${error.message}`)
  process.exit(1)
}
const {force, dryRun, only} = cli

function googleTranslator(apiKey) {
  return async (segments) => {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({q: segments, source: SOURCE_LANG, target: TARGET_LANG, format: 'html'})
    })
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300)
      throw new Error(`Google Translate API ${res.status}: ${detail}`)
    }
    const json = await res.json()
    const out = json?.data?.translations?.map((t) => t.translatedText)
    if (!Array.isArray(out) || out.length !== segments.length) {
      throw new Error('Google Translate API returned an unexpected payload')
    }
    return out
  }
}

const identityTranslator = async (segments) => segments

const sha256 = (text) => createHash('sha256').update(text).digest('hex')

async function isUpToDate(targetPath, hash) {
  const existing = existsSync(targetPath) ? await readFile(targetPath, 'utf8') : null
  return !needsTranslation(existing, hash, force)
}

async function main() {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!dryRun && !apiKey) {
    throw new Error('Set GOOGLE_TRANSLATE_API_KEY (a Google Cloud Translation API key), or pass --dry-run')
  }
  const translate = dryRun ? identityTranslator : googleTranslator(apiKey)

  const files = (await readdir(SOURCE_DIR)).filter((f) => f.endsWith('.md') && (!only || f === `${only}.md`))
  if (!files.length) throw new Error(only ? `No post named ${only}.md in content/blog/` : 'No posts in content/blog/')

  await mkdir(TARGET_DIR, {recursive: true})
  const summary = {translated: 0, skipped: 0, keptLines: 0}

  for (const file of files) {
    const raw = await readFile(path.join(SOURCE_DIR, file), 'utf8')
    const hash = sha256(raw)
    const targetPath = path.join(TARGET_DIR, file)

    if (await isUpToDate(targetPath, hash)) {
      summary.skipped += 1
      console.log(`= ${file} (unchanged)`)
      continue
    }

    const {text, keptLines} = await translatePost(raw, translate, {provider: PROVIDER, sourceHash: hash, now: new Date().toISOString()})
    summary.keptLines += keptLines
    if (keptLines) console.warn(`! ${file}: ${keptLines} line(s) kept in Vietnamese (placeholders did not survive)`)

    if (dryRun) {
      console.log(`--- ${file} (dry run) ---\n${text.split('\n').slice(0, PREVIEW_LINES).join('\n')}\n`)
    } else {
      await writeFile(targetPath, text)
      console.log(`+ ${file}`)
    }
    summary.translated += 1
  }

  console.log(`Done: ${summary.translated} translated, ${summary.skipped} unchanged, ${summary.keptLines} line(s) kept in Vietnamese.`)
}

main().catch((error) => {
  console.error(`translate:posts failed: ${error.message}`)
  process.exitCode = 1
})
