module.exports = {
  extends: ['stylelint-config-standard'],

  // stylelint 16 needs an explicit custom syntax to see <style> blocks inside
  // .vue files at all. stylelint 13 silently skipped them, which is why this
  // project reported zero .vue errors despite having @apply rules.
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],

  // Vendored third-party stylesheets (TinyMCE editor CSS and Prism themes).
  // Not ours to lint, and the source of all 64 pre-existing errors.
  ignoreFiles: [
    '**/assets/css/content.css',
    '**/assets/css/prism.css'
  ],

  rules: {
    // Tailwind v4 CSS-first directives, plus the v3 ones still in use.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'plugin',
          'custom-variant',
          'utility',
          'variant',
          'source',
          'reference',
          'config',
          'apply',
          'layer',
          'tailwind',
          'screen',
          'responsive'
        ]
      }
    ],

    // `@import "tailwindcss"` is a bare string, not a url().
    'import-notation': null
  }
}
