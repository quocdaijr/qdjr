# QDJr Blog — Nuxt 4 + TypeScript

A personal blog and portfolio built with **Nuxt 4**, **TypeScript**, **Pinia**, **Tailwind CSS v4**
and **@nuxt/content**.

## 🔧 Technology stack

| | Version | Notes |
|---|---|---|
| Node.js | **24.19.0** | Active LTS — pinned in [`.nvmrc`](./.nvmrc) |
| Nuxt | **4.5.2** | `app/` directory layout |
| Vue | 3.5 | |
| vue-router | 5.x | |
| Vite | 8.x | |
| Pinia | 3.x | |
| Tailwind CSS | **4.x** | CSS-first config via `@tailwindcss/vite` |
| @nuxt/content | 3.x | SQLite-backed, collections in `content.config.ts` |

> **Rendering mode:** the app runs as an SPA (`ssr: false` in `nuxt.config.ts`).
> That is a deliberate, long-standing setting, not an oversight — but it does
> mean no server-rendered HTML, which matters for SEO and for anything that
> assumes prerendering.

## 📋 Requirements

- **Node.js** 24.19.0 — `nvm use` picks it up from `.nvmrc`
  (Nuxt 4.5.2 requires `^22.19.0 || ^24.11.0 || >=26.0.0`)
- **npm** 11+

## 🛠️ Development

```bash
nvm use          # Node 24.19.0
npm install      # no --legacy-peer-deps needed
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

Optional environment (`npm run copy:env` seeds `.env` from `.env.example`):

| Variable | Purpose |
|---|---|
| `APP_URL` | Canonical base URL used for `og:*` tags |
| `API_URL` | Legacy blog backend — **unset by default**, see below |
| `GOOGLE_ANALYTICS_ID` | GA measurement ID |

## 🎨 Vibes

The site has three switchable looks — **terminal**, **cartoon** and **galaxy** —
picked from the header button or the control on the home page and remembered in
`localStorage.vibe`. Each vibe sets its own fonts and OKLCH palette
(`app/assets/css/tokens.css`) and renders a three.js scene behind `/` and `/about`
(`app/scenes/*`, mounted lazily by `app/components/VibeScene.vue`).

Light/dark is not a toggle: it follows the clock in **UTC+7** (dark from 18:00
to 06:00 Vietnam time, `app/utils/vnTime.ts`). To preview the other mode locally,
run `document.documentElement.classList.toggle('dark')` in the console.

`/about` is a scroll journey: 17 full-height stops (one per project) drive the scene camera
through `useJourney()`; the content lives in `app/data/profile.ts`. The locked
design system is documented in [`design.md`](./design.md).

## 🏗️ Build

```bash
npm run build     # production build -> .output/
npm start         # serve the build (node .output/server/index.mjs)
npm run preview   # Nuxt's own preview server
npm run generate  # static output -> .output/public/
```

Note that `npm run generate` emits an SPA shell rather than prerendered HTML,
because `ssr: false` is set. Nuxt prints a warning to that effect.

## ✅ Quality gates

```bash
npm test              # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npm run test:coverage # unit tests + coverage (80% threshold, enforced)
npm run test:e2e      # Playwright — mobile + desktop projects
npm run typecheck     # vue-tsc via nuxt typecheck
npm run lint          # eslint (flat config) + stylelint
```

Two test layers, split by what each can actually verify:

- **`test/`** — Vitest under plain node/happy-dom. Pure logic (`app/utils/`) and
  the Pinia stores. Deliberately *not* `@nuxt/test-utils`' `environment: 'nuxt'`,
  which currently fails to boot under Vite 8; the reasoning is documented in
  [`vitest.config.ts`](./vitest.config.ts).
- **`e2e/`** — Playwright. Anything needing the real Nuxt runtime: rendering,
  routing, data fetching, head management, and the Tailwind-dependent layout
  assertions that only reproduce at desktop widths.

Playwright starts and stops its own dev server (see `webServer` in
`playwright.config.ts`), so nothing stays listening on port 3000 after a run.


> **Run `npm run typecheck` with the dev server stopped.** `nuxt typecheck`
> regenerates `.nuxt/` in prepare mode, and `@nuxt/content` skips content
> processing in that mode, so it writes an empty content dump into the same
> `.nuxt/` that a running `nuxt dev` serves. The blog then shows "No posts"
> until the dev server restarts. Production builds are not affected.

## 📁 Project structure

Nuxt 4 sources live under `app/` (`srcDir`); everything else stays at the repo root.

```text
├── app/                        # srcDir — all application source
│   ├── app.vue                 # Root component (NuxtLayout > NuxtPage)
│   ├── error.vue               # Error page (root-level, not layouts/)
│   ├── assets/css/main.css     # Tailwind v4 entry + CSS-first config
│   ├── components/             # Vue components (auto-imported)
│   ├── composables/            # useLegacyResource, ...
│   ├── layouts/                # Application layouts
│   ├── pages/                  # File-based routing
│   ├── plugins/                # Auto-scanned; no config array
│   │   ├── api.ts              # $fetch client for the legacy API
│   │   ├── click-outside.client.ts
│   │   ├── dayjs.ts            # provides $dayjs (+ relativeTime)
│   │   ├── gtag.client.ts      # Google Analytics
│   │   ├── prism.client.ts     # Syntax highlighting (legacy pages only)
│   │   ├── resize.client.ts    # URL resize helper
│   │   ├── theme.client.ts     # Dark/light bootstrap
│   │   ├── videojs.client.ts   # Video player (legacy pages only)
│   │   └── vue-particles.client.ts
│   ├── stores/                 # Pinia stores
│   └── utils/                  # Pure, unit-tested helpers
├── content/blog/               # Markdown posts (@nuxt/content v3)
├── public/                     # Static files served at root
├── e2e/                        # Playwright specs
├── test/                       # Vitest specs
├── docker/nuxt/Dockerfile      # node:24.19.0-bookworm
├── postcss-plugins/            # Local PostCSS plugin (color-adjust rewrite)
├── content.config.ts           # Content collections + Zod schema
├── nuxt.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

`~` and `@` alias **`srcDir`**, so `~/components/...` resolves to
`app/components/...`. There is no `tailwind.config.ts` — Tailwind v4 is
configured in CSS, in `app/assets/css/main.css`.

## 🎨 Styling

Tailwind v4 via the official `@tailwindcss/vite` plugin (the `@nuxtjs/tailwindcss`
module is pinned to Tailwind v3 and is not used). Configuration is CSS-first in
`app/assets/css/main.css`:

- `@plugin "@tailwindcss/typography"` for `prose`
- `@custom-variant dark` — dark mode is a `.dark` class on `<html>`, driven by
  `app/stores/theme.ts` and persisted to `localStorage`
- `@theme` for the font stack
- an `@layer base` block restoring Tailwind v3's default border colour, since v4
  changed it from `gray-200` to `currentColor`

## 🗄️ Legacy blog

`/legacy-blogs/*` is an archived surface backed by `api.qdjr.me`, which no longer
resolves. `API_URL` is therefore **empty by default**, which makes every API call
short-circuit: those routes render an "archive offline" panel at HTTP 200 and
issue no network requests at all.

Set `API_URL` to a live host to bring the surface back — the code is fully
ported and will work as soon as a backend answers.

## 🚀 Deployment

The project deploys as a Node server behind PM2, built in Docker.

```bash
cp pm2.config.js.example pm2.config.js   # or: npm run copy:pm2.config
npm run build
pm2 reload all                            # runs `npm start`
```

`docker/nuxt/Dockerfile` (`node:24.19.0-bookworm`) and `docker-compose.yml` build
the same thing for a container host. The `bookworm` base is intentional:
`better-sqlite3`, required by `@nuxt/content`, needs `python3`/`make`/`g++` when
no prebuilt binary matches.

Static hosting is also possible via `npm run generate` (deploy `.output/public`),
with the SPA-shell caveat noted above.

## 📚 Documentation

- **Nuxt**: [nuxt.com](https://nuxt.com/)
- **Nuxt Content**: [content.nuxt.com](https://content.nuxt.com/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

## 📝 License

MIT — see [LICENSE](./LICENSE).
