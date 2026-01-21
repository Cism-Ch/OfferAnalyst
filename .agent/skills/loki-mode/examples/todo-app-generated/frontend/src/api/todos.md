# Todo API Client

This module provides API client functions for todo CRUD operations.

## Features

- Complete CRUD operations for todos
- Type-safe interfaces and function signatures
- Proper error handling with descriptive messages
- Uses the Fetch API for HTTP requests
- Base URL configuration for easy API endpoint management

## Types

```typescript
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
}
```

## API Functions

- `fetchTodos()`: Get all todos
- `createTodo(title)`: Create a new todo
- `updateTodo(id, completed)`: Update todo completion status
- `deleteTodo(id)`: Delete a todo

## Code

```typescript
const API_BASE = '/api';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
}

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${API_BASE}/todos`);
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
};

export const createTodo = async (title: string): Promise<Todo> => {
  const response = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to create todo');
  }
  return response.json();
};

export const updateTodo = async (id: number, completed: boolean): Promise<Todo> => {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  return response.json();
};

export const deleteTodo = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
};
```