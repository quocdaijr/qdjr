#!/usr/bin/env node
// Turns a hand-written trip (trips/sources/<slug>.json) into the data the
// /trips pages render (app/data/trips/<slug>.json), with the pipeline in
// ./trips/planner.mjs (Valhalla, Photon, Overpass), once per vehicle. The
// output is committed, so builds and visitors never call these services.
//
//   npm run trips:build -- sg-dalat        one trip
//   npm run trips:build                    every source
//
// A source lists its stops, the default vehicle and optionally hand-picked
// "sights". Requests go one at a time, a second apart, as the free servers ask.
import {readdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {COSTING, createPlanner} from './trips/planner.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'trips/sources')
const OUT_DIR = path.join(ROOT, 'app/data/trips')
const PAUSE_MS = 1100

const planner = createPlanner({
  throttle: async (task) => {
    await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
    return task()
  },
  warn: (message) => console.warn(`  ${message}`)
})

function validate(source, file) {
  const fail = (why) => {
    throw new Error(`${file}: ${why}`)
  }
  const named = (x) => x?.name?.vi && x?.name?.en && Number.isFinite(x.lat) && Number.isFinite(x.lng)
  if (!/^[a-z0-9-]+$/.test(source.slug ?? '')) fail('slug must be kebab-case')
  if (!source.title?.vi || !source.title?.en) fail('title needs vi and en')
  if (!source.summary?.vi || !source.summary?.en) fail('summary needs vi and en')
  if (!COSTING[source.vehicle]) fail(`vehicle must be one of ${Object.keys(COSTING).join(', ')}`)
  if (!Array.isArray(source.stops) || source.stops.length < 2) fail('needs at least two stops')
  for (const s of source.stops) if (!named(s)) fail(`bad stop ${JSON.stringify(s)}`)
  for (const s of source.sights ?? []) if (!named(s)) fail(`bad sight ${JSON.stringify(s)}`)
}

async function build(file) {
  const source = JSON.parse(await readFile(path.join(SOURCE_DIR, file), 'utf8'))
  validate(source, file)
  console.log(`${source.slug}:`)
  const variants = {}
  for (const vehicle of Object.keys(COSTING)) {
    const v = await planner.variant(source, vehicle)
    variants[vehicle] = v
    const count = (kind) => v.spans.filter((s) => s.kind === kind).length
    console.log(
      `  ${vehicle}: ${v.distanceKm} km, ${Math.round(v.durationMin / 6) / 10} h, max ${Math.max(...v.elevation)} m · ` +
        `${count('motorway')} expressway, ${count('bridge')} bridges, ${count('tunnel')} tunnels, ${count('city')} towns · ` +
        v.places.map((p) => `${p.kind}:${p.name.vi}`).join(', ')
    )
  }
  const routes = Object.values(variants).map((v) => v.route)
  const terrain = await planner.terrainGrid(routes)
  const water = await planner.lakes(routes, source.stops)
  console.log(`  terrain ${terrain.cols}×${terrain.rows}, ${terrain.heights.filter((h) => h < 0).length} sea cells · lakes: ${water.map((l) => l.name).join(', ') || 'none'}`)
  const {slug, title, summary, vehicle, stops} = source
  const trip = {slug, title, summary, vehicle, stops: stops.map(({name, lat, lng}) => ({name, lat, lng})), variants, terrain, lakes: water}
  await writeFile(path.join(OUT_DIR, `${slug}.json`), `${JSON.stringify(trip)}\n`)
}

const only = process.argv[2]
const files = only ? [`${only}.json`] : (await readdir(SOURCE_DIR)).filter((f) => f.endsWith('.json'))
let failed = 0
for (const file of files) {
  try {
    await build(file)
  } catch (error) {
    failed++
    console.error(`✗ ${error.message}`)
  }
}
process.exit(failed ? 1 : 0)
