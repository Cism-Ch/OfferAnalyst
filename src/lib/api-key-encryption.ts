/**
 * API Key Encryption Utilities
 * 
 * Provides encryption/decryption for API keys stored in the database.
 * Uses AES-256-GCM for authenticated encryption.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * This should be a secure random string stored in environment variables
 */
function getEncryptionKey(): Buffer {
    const secret = process.env.API_KEY_ENCRYPTION_SECRET || process.env.BETTER_AUTH_SECRET;
    
    if (!secret || secret.length < 32) {
        throw new Error('API_KEY_ENCRYPTION_SECRET must be at least 32 characters long');
    }
    
    // Use a fixed but application-specific salt for consistency
    // Note: This is acceptable for key derivation from a strong secret
    // Each encryption still uses a unique IV for security
    const salt = Buffer.from('offeranalyst-api-keys-v1', 'utf-8');
    return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypt an API key for storage
 * Returns a base64-encoded string containing: iv + tag + ciphertext
 * Each encryption uses a unique random IV for security
 */
export function encryptAPIKey(apiKey: string): string {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + encrypted data
    const combined = Buffer.concat([
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
}

/**
 * Decrypt an API key from storage
 * Expects a base64-encoded string containing: iv + tag + ciphertext
 */
export function decryptAPIKey(encryptedData: string): string {
    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encryptedData, 'base64');
        
        // Extract iv, tag, and encrypted data
        const iv = combined.subarray(0, IV_LENGTH);
        const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
        const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
        
        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Failed to decrypt API key:', error);
        throw new Error('Failed to decrypt API key');
    }
}

/**
 * Validate that encryption/decryption is working correctly
 */
export function testEncryption(): boolean {
    try {
        const testKey = 'sk-test-1234567890abcdef';
        const encrypted = encryptAPIKey(testKey);
        const decrypted = decryptAPIKey(encrypted);
        return testKey === decrypted;
    } catch {
        return false;
    }
}
