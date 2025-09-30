// Clean flat-config export for ESLint v9
module.exports = [
  {
    files: ["**/*.{ts,js}"],
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'import': require('eslint-plugin-import')
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/no-unresolved': 'off'
    }
  },

  // TypeScript files: enable type-aware parsing and rules
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    }
  },

  // JavaScript files: parse with babel parser so TS project is not required
  {
    files: ["**/*.js"],
    languageOptions: {
      parser: require('@babel/eslint-parser'),
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: [] }
      }
    }
  }
];
