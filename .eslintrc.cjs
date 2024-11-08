module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:solid/typescript',
    'plugin:import/recommended',
    'plugin:tailwindcss/recommended'
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'solid',
    'import',
    '@stylistic',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/nonblock-statement-body-position': ['error', 'beside'],
    '@stylistic/no-trailing-spaces': ['error', {ignoreComments: true}],
    '@stylistic/no-tabs': ['error', {allowIndentationTabs: false}],
    '@stylistic/no-multiple-empty-lines': ['error', {max: 1, maxEOF: 0}],
    '@stylistic/no-floating-decimal': 'error',
    '@stylistic/no-whitespace-before-property': 'error',
    '@stylistic/no-multi-spaces': 'error',
    '@stylistic/eol-last': ['error', 'always'],
    '@stylistic/object-curly-spacing': ['error', 'never'],
    '@stylistic/type-annotation-spacing': 'error',
    '@stylistic/template-curly-spacing': 'error',
    'no-prototype-builtins': 'off',
    indent: [
      'error',
      2
    ],
    // 'linebreak-style': [
    //     'error',
    //     'windows',
    //     'unix'
    // ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ],
    'import/newline-after-import': ['error', {count: 1, considerComments: true}],
    'import/no-duplicates': ['error', {considerQueryString: true}],
    'import/no-default-export': 'error',
    'import/order': ['error', {
      'newlines-between': 'never',
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      alphabetize: {
        order: 'asc',
        orderImportKind: 'asc'
      }
    }],
    'tailwindcss/classnames-order': ['error', {removeDuplicates: true}],
    'tailwindcss/enforces-negative-arbitrary-values': 'error',
    'tailwindcss/enforces-shorthand': 'error',
    'tailwindcss/no-custom-classname': ['warn', {
      whitelist: ['material-icons', 'resizer', 'row', 'col', 'scrollbar', 'level-item']
    }],
  }
};
