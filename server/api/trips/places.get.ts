import {clientIp, createRateLimiter, QueueFull} from '../../utils/tripRequest'
import {searchPlaces} from '../../utils/tripPlanner'

// GET /api/trips/places?q=…&lang=vi|en → place suggestions (Photon, biased to Vietnam).
const SEARCHES_PER_MINUTE = 40
const ALL_SEARCHES_PER_MINUTE = 120 // whatever the IPs (X-Forwarded-For can be forged when the proxy appends to it)
const QUERY = {min: 2, max: 80}
const CACHE_MAX = 500
const allow = createRateLimiter({limit: SEARCHES_PER_MINUTE, windowMs: 60 * 1000})
const allowAll = createRateLimiter({limit: ALL_SEARCHES_PER_MINUTE, windowMs: 60 * 1000})
const cache = new Map<string, unknown>()

export default defineEventHandler(async (event) => {
  const {q, lang} = getQuery(event)
  const query = typeof q === 'string' ? q.trim() : ''
  if (query.length < QUERY.min || query.length > QUERY.max) throw createError({statusCode: 400, statusMessage: `q: ${QUERY.min} to ${QUERY.max} characters`})
  const language = lang === 'en' ? 'en' : 'default'
  const key = `${language}:${query.toLowerCase()}`
  if (cache.has(key)) return cache.get(key)
  if (!allow(clientIp(getHeader(event, 'x-forwarded-for'), event.node.req.socket?.remoteAddress)) || !allowAll('all')) {
    throw createError({statusCode: 429, statusMessage: 'slow down'})
  }
  try {
    const places = await searchPlaces(query, language)
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!) // oldest first
    cache.set(key, places)
    return places
  } catch (error) {
    if (error instanceof QueueFull) throw createError({statusCode: 503, statusMessage: 'busy; try again'})
    console.error('[trips] search failed:', (error as Error).message)
    throw createError({statusCode: 502, statusMessage: 'place search did not answer'})
  }
})
