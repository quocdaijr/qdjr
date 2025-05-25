module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    'prettier'
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'vue/no-v-html': 0,
    'no-unused-vars': 'off', // Disable for migration phase
    'no-undef': 'off' // Disable for migration phase - Nuxt 3 auto-imports
  }
}
