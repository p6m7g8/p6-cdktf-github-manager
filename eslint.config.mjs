import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '.github/',
    '.pnpm-store/',
    '.vscode/',
    'conf/',
    '*.md',
    '.mergify.yml',
    'cdktf.json',
    'package.json',
    'setup.js',
    'tsconfig.json',
  ],
  plugins: {
  },
  languageOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-new': 'off',
  },
  settings: {
  },
})
