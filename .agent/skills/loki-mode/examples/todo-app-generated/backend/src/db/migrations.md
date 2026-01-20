# Database Migration Handler

This module handles database migrations and schema initialization for the todo application.

## Features

- Runs SQL schema migrations from file
- Reads schema.sql from migrations directory
- Provides initialization wrapper
- Comprehensive error handling and logging

## Functions

- `runMigrations()`: Executes schema SQL file
- `initializeDatabase()`: Convenience function that runs migrations and logs success

## Code

```typescript
import { getDatabase } from './database';
import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, './schema.sql');

export function runMigrations(): void {
  try {
    const db = getDatabase();
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema SQL
    db.exec(schema);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

export function initializeDatabase(): void {
  try {
    runMigrations();
    console.log('Database initialized and ready for use');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
```