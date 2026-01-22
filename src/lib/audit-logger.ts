/**
 * Audit Logging System
 * 
 * Privacy-first audit logging for security-relevant events
 * Logs are kept locally and can be reviewed by admins
 */

import pino from 'pino';
import { randomUUID, createHash } from 'crypto';

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  AUTH_LOGIN_SUCCESS = 'auth.login.success',
  AUTH_LOGIN_FAILURE = 'auth.login.failure',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_SIGNUP = 'auth.signup',
  AUTH_PASSWORD_RESET = 'auth.password_reset',
  AUTH_EMAIL_VERIFY = 'auth.email_verify',
  
  // API Key events
  API_KEY_CREATE = 'api_key.create',
  API_KEY_DELETE = 'api_key.delete',
  API_KEY_USE = 'api_key.use',
  API_KEY_REVOKE = 'api_key.revoke',
  
  // Data access events
  DATA_READ = 'data.read',
  DATA_CREATE = 'data.create',
  DATA_UPDATE = 'data.update',
  DATA_DELETE = 'data.delete',
  
  // AI workflow events
  AI_FETCH_START = 'ai.fetch.start',
  AI_FETCH_COMPLETE = 'ai.fetch.complete',
  AI_ANALYZE_START = 'ai.analyze.start',
  AI_ANALYZE_COMPLETE = 'ai.analyze.complete',
  
  // Security events
  SECURITY_RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  SECURITY_INVALID_TOKEN = 'security.invalid_token',
  SECURITY_PERMISSION_DENIED = 'security.permission_denied',
  
  // Admin events
  ADMIN_USER_SUSPEND = 'admin.user.suspend',
  ADMIN_USER_REACTIVATE = 'admin.user.reactivate',
  ADMIN_SETTINGS_CHANGE = 'admin.settings.change',
}

/**
 * Audit event data
 */
export interface AuditEvent {
  /**
   * Unique event ID
   */
  id: string;
  
  /**
   * Event type
   */
  type: AuditEventType;
  
  /**
   * Timestamp
   */
  timestamp: Date;
  
  /**
   * User ID (if authenticated)
   */
  userId?: string;
  
  /**
   * User email (if available)
   */
  userEmail?: string;
  
  /**
   * IP address (hashed for privacy)
   */
  ipAddressHash?: string;
  
  /**
   * User agent
   */
  userAgent?: string;
  
  /**
   * Event-specific metadata
   */
  metadata: Record<string, unknown>;
  
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}

/**
 * Create audit logger
 */
const auditLogger = pino({
  name: 'audit',
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

/**
 * Hash IP address for privacy using cryptographic hash
 */
function hashIPAddress(ip: string): string {
  // Use Node.js crypto for production-grade hashing
  if (typeof window === 'undefined') {
    return createHash('sha256').update(ip).digest('hex').slice(0, 16);
  }
  // Fallback for browser (shouldn't be used in practice)
  return Buffer.from(ip).toString('base64').slice(0, 16);
}

/**
 * Log audit event
 */
export function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
  const auditEvent: AuditEvent = {
    ...event,
    id: randomUUID(),
    timestamp: new Date(),
  };

  // Hash IP address if present
  if (event.ipAddressHash) {
    auditEvent.ipAddressHash = hashIPAddress(event.ipAddressHash);
  }

  auditLogger.info(auditEvent);
}

/**
 * Log authentication success
 */
export function logAuthSuccess(
  userId: string,
  userEmail: string,
  ipAddress: string,
  userAgent: string,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type: AuditEventType.AUTH_LOGIN_SUCCESS,
    userId,
    userEmail,
    ipAddressHash: ipAddress,
    userAgent,
    metadata,
    success: true,
  });
}

/**
 * Log authentication failure
 */
export function logAuthFailure(
  email: string,
  ipAddress: string,
  userAgent: string,
  error: string,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type: AuditEventType.AUTH_LOGIN_FAILURE,
    userEmail: email,
    ipAddressHash: ipAddress,
    userAgent,
    metadata,
    success: false,
    error,
  });
}

/**
 * Log API key usage
 */
export function logAPIKeyUsage(
  userId: string,
  apiKeyId: string,
  endpoint: string,
  success: boolean,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type: AuditEventType.API_KEY_USE,
    userId,
    metadata: {
      ...metadata,
      apiKeyId,
      endpoint,
    },
    success,
  });
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type: AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED,
    ipAddressHash: identifier,
    metadata: {
      ...metadata,
      endpoint,
    },
    success: false,
    error: 'Rate limit exceeded',
  });
}

/**
 * Log data access
 */
export function logDataAccess(
  type: AuditEventType,
  userId: string,
  resource: string,
  resourceId: string,
  success: boolean,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type,
    userId,
    metadata: {
      ...metadata,
      resource,
      resourceId,
    },
    success,
  });
}

/**
 * Log admin action
 */
export function logAdminAction(
  type: AuditEventType,
  adminUserId: string,
  targetUserId: string,
  action: string,
  metadata: Record<string, unknown> = {}
): void {
  logAuditEvent({
    type,
    userId: adminUserId,
    metadata: {
      ...metadata,
      targetUserId,
      action,
    },
    success: true,
  });
}
