---
name: API Development Management
description: Specialized skill for building and maintaining high-quality APIs, including REST standards, error handling, security (rate limiting, auth), and documentation.
---

# API Development Management

This skill provides a standardized framework for developing robust, secure, and maintainable APIs within the project's ecosystem.

## Engineering Standards

### 1. Request & Response Lifecycle
- **Unified Response Format**: Adopt the `{ data, error }` pattern for all API responses to ensure consistency across the frontend.
- **HTTP Methods**: Strictly use correct HTTP verbs: `GET` (retrieve), `POST` (create), `PUT/PATCH` (update), `DELETE` (remove).
- **Status Codes**: Return semantic HTTP status codes (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).

### 2. Validation & Security
- **Zod Schema Validation**: Use Zod to validate all incoming request bodies (`JSON`), query parameters, and headers.
- **Authentication**: Enforce session checks in every protected route handler using the global `auth` client.
- **Rate Limiting**: Implement defensive rate limiting on performance-heavy or sensitive endpoints (e.g., AI analysis, authentication).

### 3. Error Management
- **Centralized Handling**: Use a centralized error handler in `@/lib` to process and log server-side errors.
- **Sanitized Outputs**: Never expose internal server details (stack traces, database IDs, sensitive logic) in production error responses.
- **Type-safe Errors**: Provide descriptive error codes or messages to help the frontend provide meaningful user feedback.

## Maintenance & Documentation
- **Self-Documenting Code**: Keep Route Handlers concise and well-commented.
- **API Versioning**: Consider `/api/v1/` patterns if breaking changes are anticipated.
- **Performance Auditing**: Periodically monitor response times and payload sizes.

## Best Practices
- **Payload Minimization**: Return only the data required by the consumer.
- **Asynchronous Processing**: Offload heavy tasks (emails, data batching) to background workers or queues.
- **Idempotency**: Ensure that repeated side-effect causing requests (like POST or PUT) behave predictably.
- **Environment Parity**: Always use environment variables for sensitive API keys and connection strings.
