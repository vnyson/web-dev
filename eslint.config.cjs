const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['sites/**/js/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        document: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.yarn/**',
      '**/js/bundle.js',
      '**/js/bundle.css',
      '.pnp.cjs',
    ],
  },
];
