# Vite Configuration for Todo App Frontend

This file contains the Vite build configuration for the React frontend of the todo application.

## Configuration Details

- **Plugin**: Uses `@vitejs/plugin-react` for React support
- **Server Port**: Configured to run on port 3000
- **API Proxy**: Forwards `/api` requests to the backend server at `http://localhost:3001`

## Code

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```