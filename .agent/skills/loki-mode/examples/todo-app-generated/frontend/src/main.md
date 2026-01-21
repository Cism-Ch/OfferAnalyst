# React Application Entry Point

This is the main entry point for the React todo application frontend.

## Purpose

This file initializes the React application by:
- Importing the main React dependencies
- Rendering the `App` component into the DOM root element
- Enabling React's Strict Mode for development warnings

## Code

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```