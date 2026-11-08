// Pushes app/data/profile.* to qdjr-admin so the API and the bundled fallback
// stay identical. Usage: ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run profile:sync
// (runs through jiti, which Nuxt ships, so the extensionless imports in
// app/data resolve).
import {isDeepStrictEqual} from 'node:util'
import {PROFILE_CONTENT} from '../app/data/profile'

const API_URL = (process.env.API_URL ?? 'https://api.qdjr.dev').replace(/\/+$/, '')
const {ADMIN_EMAIL, ADMIN_PASSWORD} = process.env
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (a qdjr-admin user with profile:write).')
  process.exit(2)
}

interface Envelope<T> {
  data: T | null
  error: {code: string; message: string} | null
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {...init, headers: {'content-type': 'application/json', ...(init.headers ?? {})}})
  const text = await res.text()
  let body: Envelope<T>
  try {
    body = JSON.parse(text) as Envelope<T>
  } catch {
    // A proxy error page, for instance: show the status and the first line.
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}, not JSON: ${text.slice(0, 120)}`)
  }
  if (!res.ok || body.error || body.data === null) {
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${body.error?.code ?? ''} ${body.error?.message ?? ''}`)
  }
  return body.data
}

const {access_token: token} = await call<{access_token: string}>('/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({email: ADMIN_EMAIL, password: ADMIN_PASSWORD})
})
await call('/v1/admin/profile', {method: 'PATCH', headers: {authorization: `Bearer ${token}`}, body: JSON.stringify({content: PROFILE_CONTENT})})
const live = await call<{content: unknown}>('/v1/profile', {})
// Deep equality, not string equality: Go and Postgres JSONB reorder object keys.
const same = isDeepStrictEqual(JSON.parse(JSON.stringify(PROFILE_CONTENT)), live.content)
console.log(same ? 'API profile content now matches app/data/profile.*' : 'WARNING: API content differs from the bundled copy after sync')
process.exit(same ? 0 : 1)
