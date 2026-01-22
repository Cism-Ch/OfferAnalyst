# Prisma 7 + MongoDB Build Configuration

## Issue

Prisma 7 with MongoDB requires a valid `DATABASE_URL` during the Next.js build process because:
1. Next.js tries to collect page data during build
2. API routes that import Prisma are evaluated
3. Prisma Client instantiation requires a database connection in Prisma 7

## Solutions

### Option 1: Provide DATABASE_URL During Build (Recommended)

On Vercel, ensure the `DATABASE_URL` environment variable is available during build:

1. Go to Vercel Project Settings → Environment Variables
2. Add `DATABASE_URL` to **all environments** (Production, Preview, Development)
3. Vercel will use this during build time

### Option 2: Use Prisma Accelerate

If you're using Prisma Accelerate, provide the `accelerateUrl` instead:

```typescript
// src/lib/prisma.ts
export const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL,
});
```

### Option 3: Conditional Build

For local builds without a database, you can set a dummy URL:

```bash
DATABASE_URL="mongodb://localhost:27017/offeranalyst" npm run build
```

## Current Configuration

The project is configured with:
- **Prisma 7.3.0** with MongoDB provider
- **engineType: "library"** in schema.prisma
- Connection string managed via `prisma.config.ts`

## Why This is Required

Prisma 7 changed how it handles database connections in serverless environments. The "client" engine type (default for some configurations) requires either:
- An `adapter` (driver adapter for specific database)
- An `accelerateUrl` (Prisma Accelerate connection)

MongoDB with Prisma 7 works best when the `DATABASE_URL` is available at build time, even though the actual connection happens at runtime.

## Vercel-Specific Notes

Vercel's build process:
1. Installs dependencies
2. Runs `npx prisma generate` (generates client)
3. Runs `next build` (collects page data - requires DB config)
4. Deploys serverless functions

The `DATABASE_URL` environment variable must be present in step 3 for the build to succeed.

## Future Improvements

Consider these improvements:
1. Use Prisma Accelerate for better serverless performance
2. Implement lazy Prisma client initialization
3. Use separate build and runtime configurations
4. Consider Prisma Data Proxy for edge deployments
