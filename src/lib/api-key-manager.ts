/**
 * API Key Management
 * 
 * Secure API key generation, hashing, and validation
 */

import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Generate a secure random API key
 * Format: oak_<random_string> (oak = OfferAnalyst Key)
 */
export function generateAPIKey(): string {
  const randomString = randomBytes(32).toString('base64url');
  return `oak_${randomString}`;
}

/**
 * Hash an API key for storage
 * @param apiKey - The plain text API key
 * @returns Hashed API key
 */
export async function hashAPIKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify an API key against its hash
 * @param apiKey - The plain text API key
 * @param hashedKey - The hashed API key from database
 * @returns True if valid, false otherwise
 */
export async function verifyAPIKey(
  apiKey: string,
  hashedKey: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(apiKey, hashedKey);
  } catch {
    return false;
  }
}

/**
 * Mask an API key for display (show only last 4 characters)
 * @param apiKey - The API key to mask
 * @returns Masked API key
 */
export function maskAPIKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '****';
  }
  return `${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.slice(-4)}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns True if format is valid
 */
export function isValidAPIKeyFormat(apiKey: string): boolean {
  // Check if it starts with oak_ and has minimum length
  return apiKey.startsWith('oak_') && apiKey.length >= 40;
}

/**
 * API Key metadata
 */
export interface APIKeyMetadata {
  id: string;
  name: string;
  hashedKey: string;
  permissions: APIKeyPermission[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

/**
 * API Key permissions
 */
export type APIKeyPermission = 'read' | 'write' | 'admin';

/**
 * Create API key metadata
 */
export function createAPIKeyMetadata(
  id: string,
  name: string,
  hashedKey: string,
  permissions: APIKeyPermission[] = ['read'],
  expiresAt: Date | null = null
): APIKeyMetadata {
  return {
    id,
    name,
    hashedKey,
    permissions,
    createdAt: new Date(),
    lastUsedAt: null,
    expiresAt,
  };
}

/**
 * Check if API key has expired
 */
export function isAPIKeyExpired(metadata: APIKeyMetadata): boolean {
  if (!metadata.expiresAt) return false;
  return metadata.expiresAt < new Date();
}

/**
 * Check if API key has specific permission
 */
export function hasPermission(
  metadata: APIKeyMetadata,
  permission: APIKeyPermission
): boolean {
  return metadata.permissions.includes(permission) || 
         metadata.permissions.includes('admin');
}
