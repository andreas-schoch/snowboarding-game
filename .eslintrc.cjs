module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:solid/typescript',
    'plugin:import/recommended'
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
  'overrides': [
    {
      'env': {
        'node': true
      },
      'files': [
        '.eslintrc.{js,cjs}'
      ],
      'parserOptions': {
        'sourceType': 'script'
      }
    }
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint',
    'solid',
    'import'
  ],
  'rules': {
    'object-curly-spacing': ['error', 'never'],
    'no-prototype-builtins': 'off',
    'indent': [
      'error',
      2
    ],
    // 'linebreak-style': [
    //     'error',
    //     'windows',
    //     'unix'
    // ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'import/newline-after-import': ['error', { 'count': 1, 'considerComments': true }],
    'import/no-duplicates': ['error', {'considerQueryString': true}],
    'import/no-default-export': 'error',
    'import/order': ['error', {
      'newlines-between': 'never',
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      alphabetize: {
        order: 'asc',
        orderImportKind: 'asc'
      }
    }],
  }
};