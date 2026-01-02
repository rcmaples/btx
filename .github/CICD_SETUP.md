# CI/CD Setup Guide

This document explains how to configure the CI/CD pipeline for this repository using GitHub Actions and Vercel.

## Overview

The CI/CD pipeline consists of:

1. **CI Workflow** (`ci.yml`) - Runs tests, linting, type checking, and build validation
2. **Vercel Check Workflow** (`vercel-check.yml`) - Waits for and verifies Vercel preview deployments
3. **Branch Protection Rules** - Requires all checks to pass before merging to `main`

## Required Setup Steps

### 1. Configure GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions → Secrets** in your GitHub repository and add:

**Required Secrets:**
- `SANITY_API_READ_TOKEN` - Sanity API token with read permissions
- `DATABASE_URL` - PostgreSQL connection string (from Prisma/Supabase)
- `CLERK_SECRET_KEY` - Clerk authentication secret key

**Optional Secrets (if needed for build):**
- `SANITY_API_WRITE_TOKEN` - If write operations are needed during build
- `DIRECT_URL` - Direct database connection URL (for Prisma)
- `STRIPE_SECRET_KEY` - If Stripe integration is used during build

### 2. Configure GitHub Variables

Navigate to **Settings → Secrets and variables → Actions → Variables** and add:

**Required Variables:**
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Your Sanity dataset name (e.g., `production`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

### 3. Configure Vercel Integration

1. **Install Vercel GitHub App** (if not already installed):
   - Go to [Vercel's GitHub integration page](https://vercel.com/docs/concepts/git/vercel-for-github)
   - Install the app and connect it to your repository

2. **Configure Vercel Project**:
   - Ensure your project is linked to the GitHub repository
   - Set the production branch to `main`
   - Enable automatic deployments for pull requests

3. **Set Vercel Environment Variables**:
   - Add all required environment variables in Vercel dashboard
   - Ensure preview deployments have access to necessary environment variables

### 4. Enable Branch Protection Rules

Navigate to **Settings → Branches → Branch protection rules** and add a rule for `main`:

#### Required Status Checks:
Enable **"Require status checks to pass before merging"** and select:
- ✅ `CI Success` (from ci.yml workflow)
- ✅ `Wait for Vercel Preview` (from vercel-check.yml workflow)
- ✅ `Vercel` (automatically provided by Vercel GitHub integration)

#### Additional Recommended Settings:
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging (at least 1 approval)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require conversation resolution before merging
- ⚠️ Do not allow bypassing the above settings (optional, for stricter enforcement)

### 5. Verify Setup

Create a test pull request to verify:

1. ✅ All CI checks run automatically
2. ✅ Vercel preview deployment is created
3. ✅ All status checks must pass before merge button is enabled
4. ✅ PR comment is added with Vercel preview URL

## Workflow Details

### CI Workflow (`ci.yml`)

Runs on every pull request to `main` and includes:

- **Lint & Type Check**: Validates code style and TypeScript types
- **Test**: Runs all tests across the monorepo using Vitest
- **Build Check**: Verifies that all packages build successfully
- **CI Success**: Final gate that requires all previous jobs to pass

**Triggers:**
- Pull requests targeting `main`
- Direct pushes to `main` (for validation)

**Concurrency:** Automatically cancels in-progress runs when new commits are pushed

### Vercel Check Workflow (`vercel-check.yml`)

Waits for Vercel preview deployment and verifies success:

- **Wait for Vercel Deployment**: Polls for up to 10 minutes
- **Verify Deployment Success**: Ensures deployment completed successfully
- **Comment PR**: Posts preview URL to pull request

**Triggers:**
- Pull requests targeting `main`

## Troubleshooting

### CI Checks Failing

**Lint/Type Check Failures:**
```bash
# Run locally to debug
pnpm lint
pnpm typecheck
```

**Test Failures:**
```bash
# Run locally to debug
pnpm test
```

**Build Failures:**
```bash
# Run locally to debug
pnpm build
```

### Vercel Deployment Issues

**Deployment Not Starting:**
- Verify Vercel GitHub app is installed and has access to the repository
- Check Vercel project settings to ensure automatic deployments are enabled

**Deployment Failing:**
- Check Vercel deployment logs in the Vercel dashboard
- Verify all required environment variables are set in Vercel
- Ensure build command is correct in Vercel project settings

**Workflow Timing Out:**
- Increase `max_timeout` in `vercel-check.yml` if deployments take longer than 10 minutes
- Check for stuck deployments in Vercel dashboard

### Missing Environment Variables

If builds fail due to missing environment variables:

1. Check GitHub Secrets and Variables are correctly set
2. Verify variable names match exactly (case-sensitive)
3. Ensure Vercel environment variables are configured for preview deployments
4. Review `turbo.json` for any additional required environment variables

## Maintenance

### Updating Node.js Version

Update the `node-version` in both workflow files:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Update this version
```

### Updating pnpm Version

Update the `version` in the pnpm setup step:

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10  # Update this version
```

## Security Notes

- Never commit secrets to the repository
- Rotate secrets regularly
- Use GitHub's secret scanning to detect accidentally committed secrets
- Review environment variable access in Vercel (production vs preview)
- Limit access to repository settings to trusted team members

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
