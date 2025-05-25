module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    requireConfigFile: false,
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  // add your custom rules here
  rules: {
    'vue/no-v-html': 0,
    'no-unused-vars': 'off', // Disable for migration phase
    'no-undef': 'off', // Disable for migration phase - Nuxt 3 auto-imports
    '@typescript-eslint/no-unused-vars': 'off', // Disable for migration phase
    '@typescript-eslint/no-explicit-any': 'off', // Allow any during migration
    'vue/multi-word-component-names': 'off', // Allow single word component names
    'vue/no-multiple-template-root': 'off', // Vue 3 allows multiple root elements
    '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore during migration
    'vue/require-default-prop': 'off', // Not required in Vue 3 with TypeScript
    'vue/no-setup-props-destructure': 'off' // Allow props destructuring in setup
  }
}
