import {clientIp, createRateLimiter, parsePlanRequest, QueueFull} from '../../utils/tripRequest'
import {isBusy, isPlanned, PlannerBusy, planTrip} from '../../utils/tripPlanner'

// POST /api/trips/plan {stops: [{name, lat, lng}], vehicle} → a trip in the
// shape of app/data/trips. Planning takes from a few seconds (a city trip) to
// a minute (across the country); results are cached for 30 days.
const PLANS_PER_HOUR = 8
const allow = createRateLimiter({limit: PLANS_PER_HOUR, windowMs: 3600 * 1000})

export default defineEventHandler(async (event) => {
  const parsed = parsePlanRequest(await readBody(event).catch(() => null))
  if ('error' in parsed) throw createError({statusCode: 400, statusMessage: parsed.error})
  const busy = () => createError({statusCode: 503, statusMessage: 'busy planning other trips; try again in a minute'})
  if (!(await isPlanned(parsed.value))) {
    if (isBusy(parsed.value)) throw busy() // before the quota: a refused request costs the visitor nothing
    if (!allow(clientIp(getHeader(event, 'x-forwarded-for'), event.node.req.socket?.remoteAddress))) {
      throw createError({statusCode: 429, statusMessage: 'too many trips planned from here; try again in an hour'})
    }
  }
  try {
    const {trip, cached} = await planTrip(parsed.value)
    setHeader(event, 'X-Trip-Cache', cached ? 'hit' : 'miss')
    return trip
  } catch (error) {
    if (error instanceof PlannerBusy || error instanceof QueueFull) throw busy()
    const message = (error as Error).message
    console.error('[trips] plan failed:', message)
    // Valhalla answers 400 when the stops cannot be joined by road (an island, a closed area).
    if (/Valhalla route 400/.test(message)) throw createError({statusCode: 422, statusMessage: 'no road joins these places'})
    throw createError({statusCode: 502, statusMessage: 'the map services did not answer; try again'})
  }
})
