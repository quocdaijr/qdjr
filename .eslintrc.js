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
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'vue/no-v-html': 0,
    'no-unused-vars': 'off', // Disable for migration phase
    'no-undef': 'off' // Disable for migration phase - Nuxt 3 auto-imports
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        '@nuxtjs/eslint-config-typescript'
      ]
    }
  ]
}
