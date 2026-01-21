---
name: Infrastructure & Async Workflows
description: Specialized skill for managing distributed infrastructure, background jobs (QStash), caching (Redis), and reliable third-party integrations.
---

# Infrastructure & Async Workflows

This skill ensures the reliability and scalability of the application's background processing and infrastructure integrations.

## Core Infrastructure

### 1. Asynchronous Task Management (QStash)
- **Offloading**: Move heavy or non-immediate tasks (PDF generation, email sending, complex AI analysis) to Upstash QStash.
- **Webhook Security**: Always verify the signature of incoming webhooks using the `Receiver` from `@upstash/qstash`.
- **Idempotency**: Design background functions to be safe for retries. Check for existing records before performing side effects.

### 2. Caching & Rate Limiting (Redis)
- **Performance Caching**: Cache expensive database queries or API results with appropriate TTLs.
- **Defensive Rate Limiting**: Implement rate limiting on sensitive or costly endpoints (Auth, AI) using `@upstash/ratelimit`.
- **Atomic Operations**: Use Redis for distributed locks or counters when needed to prevent race conditions.

### 3. Messaging & Communication (Resend)
- **React Email**: Use React Email for type-safe, maintainable email templates.
- **Async Delivery**: Never send emails synchronously within a request handler; queue them via QStash.

## Storage & Search (Tigris/Supabase)
- **Object Storage**: Use signed URLs for secure file uploads and downloads.
- **Search Sync**: Ensure that data mutations in the primary DB (MongoDB) are eventually updated in the search index (Tigris).
- **Blob Management**: Implement cleanup jobs for orphaned or deleted files.

## Best Practices
- **Graceful Degradation**: Handle downtime of third-party services with proper fallbacks or retry logic.
- **Monitoring**: Log the status of background job executions and infrastructure health.
- **Environment Parity**: maintain consistent configuration between development, staging, and production environments.
