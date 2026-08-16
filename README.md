# QDJr Blog - Nuxt 3 + TypeScript

A modern blog application built with **Nuxt 3**, **TypeScript**, **Pinia**, and **Tailwind CSS**.

## 🚀 Features

- ⚡ **Nuxt 3** - The latest Vue.js framework
- 🔷 **TypeScript** - Full type safety
- 🍍 **Pinia** - Modern state management
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔍 **Prism.js** - Syntax highlighting
- 📱 **PWA** - Progressive Web App support
- 🎬 **Video.js** - Video player integration
- ✨ **Particles** - Interactive background effects

## 📋 Requirements

- **Node.js** 24.19.0 (see [`.nvmrc`](./.nvmrc) — run `nvm use`)
- **npm** 11+

## 🛠️ Development Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Prepare Nuxt
npm run postinstall

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Build Commands

```bash
# Type checking
npm run typecheck

# Production build
npm run build

# Static site generation
npm run generate

# Preview production build
npm run preview
```

## ✅ Tests

```bash
npm test              # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npm run test:coverage # unit tests + coverage (80% threshold)
npm run test:e2e      # Playwright, mobile + desktop projects
npm run lint          # eslint + stylelint
npm run typecheck     # vue-tsc via nuxt typecheck
```

Two layers, split by what each can actually verify:

- **`test/`** — Vitest, plain node/happy-dom. Pure logic (`app/utils/`) and the
  Pinia stores. Deliberately not `@nuxt/test-utils`' `environment: 'nuxt'`,
  which currently fails to boot under Vite 8; see the note in
  `vitest.config.ts`.
- **`e2e/`** — Playwright. Anything needing the real Nuxt runtime: rendering,
  routing, data fetching, head management, and the Tailwind-dependent layout
  assertions that only reproduce at desktop widths.

## 📚 Documentation
- **Nuxt 3 Docs**: [https://nuxt.com/](https://nuxt.com/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

## 📁 Project Structure

Nuxt 4 sources live under `app/` (`srcDir`); everything else stays at the repo root.

```text
├── app/                       # srcDir — all application source
│   ├── app.vue               # Root component (NuxtLayout > NuxtPage)
│   ├── error.vue             # Error page (root-level, not layouts/)
│   ├── assets/               # Uncompiled assets (SASS, CSS, images)
│   ├── components/           # Vue components (auto-imported)
│   ├── layouts/              # Application layouts
│   ├── pages/                # Application routes (file-based routing)
│   ├── plugins/              # Plugins (auto-scanned, no config array)
│   │   ├── api.ts            # API client with $fetch
│   │   ├── click-outside.client.ts # Vue 3 directive
│   │   ├── gtag.client.ts    # Google Analytics
│   │   ├── prism.client.ts   # Syntax highlighting
│   │   ├── resize.client.ts  # URL resize utility
│   │   ├── theme.client.ts   # Dark/light mode bootstrap
│   │   ├── videojs.client.ts # Video player
│   │   └── vue-particles.client.ts # Particle effects
│   └── stores/               # Pinia stores (TypeScript)
├── content/                   # Markdown blog posts (@nuxt/content v3)
├── public/                    # Static files (served at root)
├── e2e/                       # Playwright specs
├── content.config.ts          # Content collections + Zod schema
├── nuxt.config.ts             # Nuxt configuration
└── tailwind.config.ts         # Tailwind CSS configuration
```

Note that `~` and `@` alias `srcDir`, so `~/components/...` resolves to
`app/components/...` — imports did not need rewriting for the move.

## 🔧 Technology Stack

- **Framework**: Nuxt 3.17.4
- **Language**: TypeScript
- **Vue**: Vue 3.5
- **State Management**: Pinia 3.0
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Vite 6.3
- **Package Manager**: npm with legacy peer deps

## 🚀 Deployment

### Static Hosting (Recommended)

```bash
npm run generate
# Deploy .output/public to Netlify, Vercel, etc.
```

### Server-Side Rendering

```bash
npm run build
# Deploy .output/server for Node.js hosting
```

## 📝 License

This project is licensed under the MIT License.

---

**Migrated from Nuxt 2 to Nuxt 3 + TypeScript** ✨
