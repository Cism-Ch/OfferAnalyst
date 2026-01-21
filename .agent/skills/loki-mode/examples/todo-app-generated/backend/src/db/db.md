# SQLite3 Database Handler (Legacy)

This module provides SQLite3 database connection and schema initialization for the todo application.

**Note**: This appears to be a legacy implementation using the callback-based sqlite3 library.

## Features

- SQLite3 database connection
- Schema initialization with todos table
- Database path resolution
- Connection status logging

## Database Schema

Creates a `todos` table with:
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `title`: TEXT NOT NULL
- `completed`: BOOLEAN DEFAULT 0
- `createdAt`: TEXT DEFAULT CURRENT_TIMESTAMP

## Code

```typescript
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../todos.db');

const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database schema
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database schema initialized');
        resolve();
      }
    });
  });
};

export default db;
```