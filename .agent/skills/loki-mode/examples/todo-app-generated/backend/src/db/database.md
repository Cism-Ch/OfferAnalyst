# Better-SQLite3 Database Connection

This module provides a singleton database connection using the better-sqlite3 library.

## Features

- Singleton database connection pattern
- Better-sqlite3 for improved performance and synchronous API
- WAL (Write-Ahead Logging) mode enabled for better concurrency
- Automatic database path resolution
- Connection status logging

## Configuration

- **Database Path**: `todos.db` in project root
- **Journal Mode**: WAL (Write-Ahead Logging)
- **Connection**: Lazy initialization (connects on first use)

## Functions

- `getDatabase()`: Returns singleton database instance
- `closeDatabase()`: Closes database connection and resets singleton

## Code

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../todos.db');

// Create database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}
```