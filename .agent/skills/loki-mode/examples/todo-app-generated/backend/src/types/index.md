# Backend Type Definitions

This file contains TypeScript type definitions for the backend API and database models.

## Types Overview

### Data Models
- **Todo**: Main todo item structure with all fields
- **ApiResponse**: Standardized API response wrapper
- **CreateTodoRequest**: Request body for creating todos
- **UpdateTodoRequest**: Request body for updating todos
- **DatabaseConfig**: Database connection configuration

### API Response Structure
All API responses follow the `ApiResponse<T>` pattern for consistency:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Code

```typescript
// Todo item types
export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request body types
export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

// Database types
export interface DatabaseConfig {
  path: string;
  readonly?: boolean;
}
```