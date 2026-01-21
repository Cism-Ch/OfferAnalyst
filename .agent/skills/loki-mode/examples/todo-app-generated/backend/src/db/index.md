# Database Module Index

This file exports all database-related functions and modules for convenient imports.

## Exports

- From `./database`: `getDatabase`, `closeDatabase`
- From `./migrations`: `runMigrations`, `initializeDatabase`

## Usage

```typescript
import { getDatabase, initializeDatabase } from './db';

// Initialize and use database
initializeDatabase();
const db = getDatabase();
```

## Code

```typescript
export { getDatabase, closeDatabase } from './database';
export { runMigrations, initializeDatabase } from './migrations';
```