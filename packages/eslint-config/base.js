// ./packages/eslint-config/base.js
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import onlyWarn from 'eslint-plugin-only-warn'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': [
        'warn',
        {
          cwd: '../../',
          allowList: [
            'NODE_ENV',
            'NEXT_PUBLIC_SANITY_PROJECT_ID',
            'NEXT_PUBLIC_SANITY_DATASET',
            'NEXT_PUBLIC_SANITY_API_VERSION',
            'SANITY_API_READ_TOKEN',
            'SANITY_API_WRITE_TOKEN',
            'SANITY_STUDIO_DATASET',
            'SANITY_STUDIO_HOST',
            'SANITY_STUDIO_PROJECT_ID',
            'CLERK_SECRET_KEY',
            'CLERK_WEBHOOK_SECRET',
            'CLERK_LOCAL_WEBHOOK_SECRET',
            'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
            'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
            'DATABASE_URL',
            'DIRECT_URL',
            'VERCEL_ENV',
          ],
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**', 'node_modules', '.sanity', '**/sanity.types.ts'],
  },
]
