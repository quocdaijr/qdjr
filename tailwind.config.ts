import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'

export default <Config>{
  darkMode: 'class',
  // Rewritten for the Nuxt 4 app/ directory. These are root-relative (not `~`
  // aliased), so unlike the rest of the codebase they did have to change.
  content: [
    './app/**/*.{vue,js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      }
    }
  },
  plugins: [typography],
}
