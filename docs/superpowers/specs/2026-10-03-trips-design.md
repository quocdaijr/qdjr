# Trips — cartoon road-trip diorama

## Intent (from the user, 2026-10-03)

A new page that shows itineraries from one place to one or more destinations, passing the
notable places along the way. Shown like the cartoon-vibe train, but with road vehicles
(motorbike, coach, car…). Built with three.js, UI designed with Hallmark.

Decisions taken:

- **Scope C:** phase 1 is a curated showcase (static data fetched at authoring time);
  phase 2 adds a tool where a visitor enters their own trip. Both share one scene engine.
- **Stylised diorama (A):** the real route shape, simplified and fitted to a toy board —
  not a to-scale map.
- **Autoplay:** the vehicle drives slowly on its own; no scroll or click needed.
- **Redraw (same day, after review):** one vehicle for the whole trip, chosen on the page;
  changing it changes the road (a motorbike may not use expressways). The board follows the
  terrain: elevation, passes, bridges over rivers, tunnels through hills, towns. Default trips:
  Sài Gòn → Đà Lạt (coach), Sài Gòn → Phan Thiết (motorbike), Sài Gòn → thôn Trung Xuân, xã
  An Lương (former Phù Mỹ, Bình Định; Gia Lai since 2025) (coach). Routing moved from OSRM to
  Valhalla, which has per-vehicle costing, per-edge attributes and elevation; the places along
  the way now come from the road itself instead of Overpass.
- **Second review (same day):** the reader can pick a stop or place for the vehicle to drive
  to (it parks there until told to drive on); two views, overview and driver's seat; much more
  of the land: real elevation over the whole board (an elevation grid, not just along the
  road), sea and coast, lakes (Overpass), rivers under bridges, zoned vegetation (pines,
  palms, broadleaf, paddies, rocks), guard rails on passes. Da Lat's stop moved to the centre,
  Xuan Huong Lake.
- **Data source: OpenStreetMap, not Google.** Google Maps Platform's free caps (Routes
  10k/month, Places 5k) need a billing account, and its terms forbid showing Routes/Places
  content on a non-Google map and caching it — exactly what a three.js redraw does. OSM data
  (ODbL) can be cached and redrawn with "© OpenStreetMap contributors".
  - Routing, road attributes, elevation: Valhalla public server (`valhalla1.openstreetmap.de`):
    `route` per vehicle (`motorcycle` with `use_highways: 0`, `auto`, `bus`), `trace_attributes`
    (bridge, tunnel, road class, density, names; map-matched in ≤ 150 km stretches, the server's
    limit is 200 km), `height`.
  - Town names: Photon reverse geocoding (hamlet-level answers dropped).
  - Geocoding (phase 2 only): Photon.

## Phase 1 — curated showcase

### Data

- `trips/sources/<slug>.json`, written by hand: titles and summaries (en/vi), ordered stops
  `{name: {en, vi}, lat, lng}`, the default `vehicle`, optional hand-picked `sights`.
- `npm run trips:build [slug]` writes `app/data/trips/<slug>.json` with one variant per vehicle:
  distance, Valhalla's time estimate, where each stop lies, spans (motorway, bridge, tunnel,
  city), places (passes, named tunnels ≥ 300 m, the four longest named bridges ≥ 300 m, towns,
  sights; at most 12, none right at a stop), the road resampled to 300 points and its elevation;
  per trip, an elevation grid of ~6 900 points over every vehicle's road (Valhalla `height`;
  the sea comes back below 0) and up to 8 named lakes near the roads (Overpass, mirrors tried
  in turn; a lake by a stop is always kept; rivers mapped as areas are left out).
  The output is committed: builds and visitors never call these services.

### Scene (`app/scenes/trip/`)

- `board.ts` projects lat/lng onto a 60-unit board (equirectangular) and irons out hairpins
  tighter than the road is wide; `profile.ts` turns elevation into road height (levelled over
  bridges and through tunnels, smoothed); `spans.ts` picks what is drawn specially and stretches
  short named features to a visible length; `terrain.ts` the heightfield; `road.ts` the road,
  expressways, bridges, portals, bores and guard rails; `elevation.ts` reads the grid; `nature.ts`
  vegetation, rocks, paddies and boats; `scenery.ts` towns, cities, pins, labels;
  `timeline.ts` the loop (pure); `vehicles.ts` motorbike, car, coach.
- Reuses the cartoon kit and the layout's single `VibeScene` renderer: a trip page publishes
  `{slug, vehicle, locale}` through `useActiveTrip()`.

### Pages

- `/trips`: list of trips (title, stops, distance, vehicles).
- `/trips/[slug]`: the scene full-screen, a compact panel with the itinerary
  (stop → vehicle → stop), the name of the place currently passed, distance, and the
  OSM attribution. Unknown slug → 404.
- Header link "Trips". en/vi copy; place names come from the data.

### Testing

- Unit (vitest): pipeline (polyline decoding, spans and named features from edges, place
  picking), projection and path smoothing, road profile, visual spans, timeline, and the scene
  for every committed trip and vehicle (a motorbike never takes an expressway).
- e2e (playwright): list, itinerary following the vehicle, vehicle switch, 404, language switch.

## Phase 2 — visitor trips

- **Form** ("Plan your own trip", top of `/trips`, `TripPlanner.vue`): an origin and one to five
  more stops, in order (add, remove, move up/down), each picked from suggestions
  (`PlaceInput.vue`, an ARIA combobox fed by `GET /api/trips/places`, Photon biased to Vietnam),
  and one vehicle. Submitting opens `/trips/plan?stop=lat,lng,name&stop=…&v=car`: the trip lives in
  its URL, so it can be shared, reloaded and edited back ("Edit the trip" refills the form).
- **Result** (`/trips/plan`): the same panel and scene as a curated trip (`TripView.vue`, shared
  with `/trips/[slug]`), a waiting panel with a seconds counter while the road is found, errors
  with a retry (no road, too many plans, busy, services down). Switching vehicle asks for that
  vehicle's road; the panel keeps the last road until it arrives.
- **API** (`POST /api/trips/plan`): validates (2–6 named stops inside Vietnam, ≤ 80-character
  names, a known vehicle), then runs the same pipeline as the build script
  (`scripts/trips/planner.mjs`, shared) for that one vehicle: road, road attributes, elevation
  along it and over the board, towns or landmarks, lakes. Cached on disk 30 days
  (`.data/trips`, keyed by a hash of the request); the same trip asked twice at once is planned
  once. Every Valhalla/Photon call from every visitor goes through one queue, 1.1 s apart, as
  those free servers ask; Overpass is asked in parallel. 8 new plans per hour per IP, at most 4
  plans in flight in all (the IP limit trusts X-Forwarded-For). A city trip takes ~15 s, a long
  one up to a minute.
- **City trips** (under 40 km): the places are landmarks right beside the street (Overpass:
  museums, markets, places of worship, parks, historic sites; one per stretch, those with a
  wikidata entry first) instead of town names; the board turns urban when half the road is in
  town (paved ground, blocks of buildings, few trees, no paddies); the elevation model's noise
  below a few metres is land, not water; unnamed bridges (flyovers) carry no river.
- **Not Google Maps:** its terms forbid showing Routes/Places content on a non-Google map and
  caching it, and it needs a billing account; the whole design (a redrawn cartoon board, cached
  data) rests on OSM's licence.
