# Batch Theory Exchange | BTX

- **[Turborepo](https://turbo.build/)** for efficient monorepo management
- **[Next.js](https://nextjs.org/)** for the frontend application
- **[Sanity](https://www.sanity.io/)** for content management
- **[TypeScript](https://www.typescriptlang.org/)** for type safety
- **[Tailwind CSS](https://tailwindcss.com/)** for styling
- Sample blog schemas
- Next.js configured like a sample blog

Scaffolded with `npx create turbo-sanity` [[repo](https://github.com/rcmaples/create-turbo-sanity)]

## Project Structure

```
btx/
├── apps/
│   ├── storefront/           # Next.js application
│   └── studio/               # Sanity Studio CMS
├── packages/
│   ├── eslint-config/        # Shared ESLint configuration
│   └── typescript-config/    # Shared TypeScript configuration
└── package.json              # Root package.json with workspace configuration
```

## Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development servers:**

   ```bash
   pnpm dev
   ```

   This will start:
   - Next.js app at http://localhost:3000
   - Sanity Studio at http://localhost:3333

## Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm format` - Run prettier
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Automatically fix linting issues
- `pnpm typecheck` - Type check all packages
- `pnpm sanity:deploy` - Deploy Sanity Studio
- `pnpm sanity:typegen` - Generate TypeScript types from Sanity schema

## Sanity Configuration

Your Sanity project details:

- **Project ID:** mrsdi6mo
- **Dataset:** btx

## Environment Variables

The following environment variables are configured:

### apps/storefront (.env)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=mrsdi6mo
NEXT_PUBLIC_SANITY_DATASET=btx
SANITY_API_READ_TOKEN=
```

### apps/studio (.env)

```
SANITY_STUDIO_PROJECT_ID=mrsdi6mo
SANITY_STUDIO_DATASET=btx
SANITY_API_READ_TOKEN=
SANITY_STUDIO_HOST=
```

## Learn More

- [Turborepo Documentation](https://turbo.build/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity + Next.js Guide](https://www.sanity.io/docs/next-js)

## Deploy

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Sanity Studio

Deploy your Sanity Studio:

```bash
pnpm sanity:deploy
```

Your studio will be available at `https://btx.sanity.studio`
