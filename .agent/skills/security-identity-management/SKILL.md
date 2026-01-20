---
name: Security & Identity Management
description: Specialized skill for Better-Auth synchronization, Supabase RLS policies, and sensitive data protection audits.
---

# Security & Identity Management

This skill provides the security framework required to protect user data and ensure the integrity of the application's identity layer.

## Identity & Authentication

### 1. Better-Auth Mastery
- **Session Lifecycle**: Manage session creation, rotation, and revocation securely.
- **Prisma Sync**: Ensure the `User`, `Session`, and `Account` models in Prisma stay perfectly synchronized with the Better-Auth configuration.
- **Social Auth**: Securely handle OAuth callbacks and profile merging.

### 2. Authorization & Access Control
- **Database Security (RLS)**: Configure Row Level Security on Supabase to ensure users can only access their own data at the database level.
- **Policy Auditing**: Regularly review security policies to prevent over-privileged access.
- **Server Action Protection**: Verify identity and ownership for every data-mutating Server Action.

## Data Protection

### 1. Sensitive Data Handling
- **Non-Exposure**: Never return password hashes, internal tokens, or PII (Personally Identifiable Information) in client-side responses.
- **Encryption**: Use industry-standard encryption for sensitive data at rest and in transit.
- **Input Sanitization**: Use Zod and other libraries to prevent XSS and Injection attacks.

### 2. Auditing & Compliance
- **Security Logs**: Maintain logs of critical events (login failures, permission changes).
- **Dependency Scanning**: Use tools to identify and fix vulnerabilities in third-party packages.
- **Environment Security**: Audit `.env` files to ensure no sensitive keys are committed to version control.

## Best Practices
- **Principle of Least Privilege**: Grant only the minimum permissions necessary for any service or user.
- **Secure Cookies**: Use `HttpOnly`, `Secure`, and `SameSite` flags for all authentication cookies.
- **CSRF Protection**: Ensure all state-changing requests are protected against Cross-Site Request Forgery.
