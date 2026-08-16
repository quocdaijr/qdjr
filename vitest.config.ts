import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitest/config'

// Deliberately a plain Vitest config rather than @nuxt/test-utils'
// `environment: 'nuxt'`. That environment boots the whole Nuxt app and
// currently dies loading nuxt/dist/app/entry.js under Vite 8 with an opaque
// "Unknown Error: [object Object]".
//
// So the split is: pure logic and stores are unit-tested here under node, with
// the handful of Nuxt/Pinia auto-imports stubbed in test/setup.ts, while
// anything that genuinely needs the Nuxt runtime (rendering, routing, data
// fetching, head management) is covered by the Playwright suite in e2e/.
//
// Revisit `environment: 'nuxt'` when @nuxt/test-utils supports Vite 8.
export default defineConfig({
  // Nuxt replaces import.meta.client/server at build time. Vitest's `define`
  // does not reach them, so substitute them here: without this every
  // client-guarded branch in the stores is unreachable and silently untested.
  plugins: [
    {
      name: 'stub-nuxt-import-meta',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/app/') || !/\.[jt]s$/.test(id)) return null
        if (!code.includes('import.meta.client') && !code.includes('import.meta.server')) {
          return null
        }
        return {
          code: code
            .replace(/import\.meta\.client/g, 'true')
            .replace(/import\.meta\.server/g, 'false'),
          map: null
        }
      }
    }
  ],
  test: {
    include: ['test/**/*.spec.ts'],
    // happy-dom rather than node: the theme store touches document,
    // localStorage and matchMedia.
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Scope coverage to what this layer actually targets. Template-heavy
      // components are covered end-to-end; counting them here would produce a
      // number that flatters the unit suite without adding signal.
      include: ['app/utils/**/*.ts', 'app/stores/**/*.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
      '@@': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})
