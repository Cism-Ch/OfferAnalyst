# Express Server Entry Point

This is main entry point for the Express.js backend server of the todo application.

## Features

- Express server setup with TypeScript support
- CORS middleware for cross-origin requests
- JSON parsing middleware
- Database initialization on startup
- Route mounting for API endpoints
- Health check endpoint
- Graceful shutdown handling

## Configuration

- **Default Port**: 3001 (configurable via PORT environment variable)
- **Routes**: Mounts todo router at '/api' prefix
- **Health Check**: GET /health returns server status

## Code

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './db';
import todosRouter from './routes/todos';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Routes
app.use('/api', todosRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  closeDatabase();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
```