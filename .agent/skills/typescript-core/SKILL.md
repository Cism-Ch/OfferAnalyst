---
name: TypeScript Core Management
description: Specialized skill for maintaining strict TypeScript standards and core application logic patterns (RSC, Zod, Server Actions).
---

# TypeScript Core Management

This skill ensures the codebase follows strict TypeScript standards and modern React patterns integrated into this project.

## Core Principles

### 1. Strict Typing
- **No `any`**: Disallow the use of `any`. Use `unknown` or proper interfaces.
- **Zod Validation**: Always validate external data (API responses, form inputs, server actions) using Zod.
- **Environment Variables**: Use `t3-env` or a similar pattern to validate environment variables at startup.

### 2. React Server Components (RSC)
- **Server by Default**: All components should be Server Components unless interactivity/hooks are required.
- **Client Components**: Mark with `'use client'` strictly when using `useEffect`, `useState`, or browser APIs.
- **Co-location**: Keep components close to the routes or features they belong to.

### 3. Server Actions Pattern
- **Standardized Return**: Use the `{ data, error }` pattern for all Server Actions and API handlers.
- **Revalidation**: Immediately trigger `revalidatePath` or `revalidateTag` after data mutations.
- **Rate Limiting**: Implement rate limiting on sensitive actions (forms, auth).

### 4. Code Hygiene
- **Alias Imports**: Always use `@/*` alias for internal imports.
- **Clean Imports**: Remove unused imports and variables before finalizing a task.
- **Canon Tailwind**: Organize Tailwind classes in a logical order (Layout > Spacing > Typography > Colors).

## Workflow Integration
- **Verification**: Run `npx tsc --noEmit` regularly to detect silent failures.
- **Error Handling**: Never return sensitive data (hashes, stack traces) to the client. Use centralized error handling in `@/lib`.
