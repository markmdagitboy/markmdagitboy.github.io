module.exports = {
  files: ["**/*.{ts,js}"],
  ignores: ["node_modules/**", "dist/**", "coverage/**"],
  languageOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json'
    }
  },
  plugins: {
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    'import': require('eslint-plugin-import')
  },
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
