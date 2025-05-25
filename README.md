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

- **Node.js** 18+
- **npm** 8+

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

## 📚 Documentation

- **Migration Guide**: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete migration details
- **Nuxt 3 Docs**: [https://nuxt.com/](https://nuxt.com/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

## 📁 Project Structure

```text
├── assets/                    # Uncompiled assets (SASS, CSS, images)
├── components/                # Vue.js components (auto-imported)
├── layouts/                   # Application layouts
├── pages/                     # Application routes (file-based routing)
├── plugins/                   # TypeScript plugins
│   ├── api.ts                # API client with $fetch
│   ├── click-outside.client.ts # Vue 3 directive
│   ├── gtag.client.ts        # Google Analytics
│   ├── prism.client.ts       # Syntax highlighting
│   ├── resize.client.ts      # URL resize utility
│   ├── videojs.client.ts     # Video player
│   └── vue-particles.client.ts # Particle effects
├── public/                    # Static files (served at root)
├── stores/                    # Pinia stores (TypeScript)
│   ├── categories.ts         # Categories management
│   ├── posts.ts             # Posts management
│   └── tags.ts              # Tags management
├── nuxt.config.ts            # Nuxt configuration
└── tailwind.config.ts        # Tailwind CSS configuration
```

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
