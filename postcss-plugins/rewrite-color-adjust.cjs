/**
 * Rewrites the deprecated `color-adjust` shorthand to `print-color-adjust`
 * so it doesn't trigger PostCSS deprecation warnings at build time.
 * Needed because prismjs plugin CSS (used by the legacy post detail page)
 * still ships the deprecated form and we can't edit node_modules.
 */
module.exports = () => ({
  postcssPlugin: 'rewrite-color-adjust',
  Declaration(decl) {
    if (decl.prop === 'color-adjust') {
      decl.prop = 'print-color-adjust'
    }
  }
})
module.exports.postcss = true
