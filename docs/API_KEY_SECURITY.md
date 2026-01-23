# API Key Security Implementation

## Overview

This document describes the secure API key management system implemented for OfferAnalyst. The system supports two types of users:

1. **Authenticated Users**: Keys are encrypted and stored in MongoDB (persistent)
2. **Unauthenticated Users**: Keys are obfuscated and stored in browser localStorage (temporary, 24h max)

## Security Model

### For Authenticated Users (Persistent Storage)

API keys are stored securely in the MongoDB database with the following security measures:

- **Encryption**: Keys are encrypted using AES-256-GCM before storage
- **Authentication**: Only accessible after user login via Better-Auth
- **Authorization**: Users can only access their own keys
- **Audit Trail**: Usage tracking with lastUsed timestamp and usage count

### For Unauthenticated Users (Temporary Storage)

API keys are stored in browser localStorage with limited security:

- **Obfuscation**: Keys are Base64 encoded (NOT true encryption)
- **Expiration**: Keys automatically expire after 24 hours
- **Browser Fingerprint**: Keys are tied to the specific browser/device
- **Automatic Cleanup**: Expired keys are removed on load

⚠️ **Security Warning**: localStorage keys can be accessed by:
- The user themselves (via browser DevTools)
- Browser extensions
- XSS attacks if present

**Recommendation**: Users should sign up for persistent, encrypted storage.

## Architecture

### Components

#### 1. Database Schema (`prisma/schema.prisma`)

```prisma
model APIKey {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  name         String
  provider     String   // openrouter, google, anthropic, etc.
  keyEncrypted String   // Encrypted with AES-256-GCM
  keyPreview   String   // Last 4 chars for display
  permissions  String[] @default(["READ", "WRITE"])
  lastUsed     DateTime?
  usageCount   Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([provider])
  @@map("api_keys")
}
```

#### 2. Encryption Module (`src/lib/api-key-encryption.ts`)

- Uses Node.js built-in `crypto` module
- Algorithm: AES-256-GCM (authenticated encryption)
- Derives encryption key from `API_KEY_ENCRYPTION_SECRET` or `BETTER_AUTH_SECRET`
- Each encrypted value has unique IV (Initialization Vector)

**Key Functions**:
- `encryptAPIKey(apiKey: string): string` - Encrypts and returns base64 string
- `decryptAPIKey(encryptedData: string): string` - Decrypts base64 string

#### 3. Temporary Storage Hook (`src/hooks/use-temporary-api-keys.ts`)

Client-side hook for managing temporary keys:

```typescript
const tempKeys = useTemporaryApiKeys();

// Add a temporary key
tempKeys.addKey('My OpenRouter Key', 'openrouter', 'sk-or-v1-...');

// Get key for a provider
const key = tempKeys.getKey('openrouter');

// Delete a key
tempKeys.deleteKey(keyId);

// Clear all keys
tempKeys.clearAllKeys();
```

#### 4. Server Actions

**`src/app/actions/db/api-keys.ts`**:
- `getUserAPIKeys(userId)` - List user's keys (metadata only)
- `addAPIKey(userId, name, provider, key)` - Encrypt and store key
- `deleteAPIKey(userId, keyId)` - Remove key
- `getDecryptedAPIKey(userId, provider)` - Retrieve and decrypt key
- `getAPIKeyStats(userId)` - Get usage statistics

**`src/app/actions/shared/api-key-provider.ts`**:
- `getAPIKey(provider, clientApiKey?)` - Get key with priority:
  1. User's BYOK from database (authenticated)
  2. Client-provided temp key (unauthenticated)
  3. Environment variable (fallback)
- `trackBYOKUsage(keyId)` - Track usage statistics

#### 5. UI Components

**`src/app/dashboard/api-keys/page.tsx`**:
- Dual-mode interface for authenticated/unauthenticated users
- Add, view (masked), copy, and delete keys
- Show expiration time for temporary keys
- Usage statistics dashboard

**`src/components/api-keys/AddAPIKeyDialog.tsx`**:
- Modal for adding new API keys
- Provider selection (OpenRouter, OpenAI, Anthropic, Google, Mistral)
- Context-aware messaging based on auth status

## Usage Flow

### For Authenticated Users

1. User logs in via Better-Auth
2. Navigate to `/dashboard/api-keys`
3. Click "Add API Key"
4. Enter key details (name, provider, key)
5. Key is encrypted with AES-256-GCM and stored in MongoDB
6. When using AI features, system automatically retrieves and decrypts key
7. Usage is tracked (lastUsed, usageCount)

### For Unauthenticated Users

1. User visits site without logging in
2. Navigate to `/dashboard/api-keys` (redirected to login by middleware)
3. OR directly add key via Settings
4. Click "Add API Key"
5. See warning about temporary storage (24h expiration)
6. Enter key details - stored in localStorage with browser fingerprint
7. When using AI features, key is passed from client to server action
8. Key expires after 24 hours and is automatically removed

### Server Actions Integration

All AI server actions (`fetch.ts`, `analyze.ts`, `organize.ts`) support BYOK:

```typescript
// Server action signature
export async function fetchOffersAction(
    domain: string,
    context: string,
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string // For temporary keys
): Promise<AgentActionResult<Offer[]>> {
    // Get API key with priority: BYOK > temp > env
    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    
    // Use the key...
    const openrouter = new OpenRouter({ apiKey: apiKeyResult.key });
    
    // Track usage if BYOK
    if (apiKeyResult.keyId) {
        await trackBYOKUsage(apiKeyResult.keyId);
    }
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Required for encryption (minimum 32 characters)
API_KEY_ENCRYPTION_SECRET="your-secret-key-here-at-least-32-chars"

# Or fallback to existing secret
BETTER_AUTH_SECRET="your-auth-secret-here-at-least-32-chars"

# Optional: Default API key for unauthenticated users
OPENROUTER_API_KEY="sk-or-v1-..."
```

Generate secrets:
```bash
openssl rand -base64 32
```

## Middleware Protection

The `/dashboard/*` routes are protected by middleware:

```typescript
// middleware.ts
const protectedRoutes = [
  "/dashboard",  // Added - protects all dashboard routes
  // ... other protected routes
];
```

Unauthenticated users are redirected to `/auth/login?from=/dashboard/api-keys`

## Migration from Hashed to Encrypted Storage

⚠️ **Breaking Change**: Existing API keys using `keyHash` are incompatible.

**Migration steps**:

1. **Option A - Database Migration** (recommended for production):
   ```javascript
   // Run this script to migrate existing keys
   // Users will need to re-enter their API keys
   db.api_keys.updateMany({}, {
     $set: { keyEncrypted: "" },
     $unset: { keyHash: "" }
   });
   ```

2. **Option B - Fresh Start** (for development):
   ```bash
   # Drop the api_keys collection
   # Users will need to re-add their keys
   npx prisma db push --force-reset
   ```

## Testing

### Unit Tests

```bash
# Test encryption/decryption
node -e "require('./src/lib/api-key-encryption').testEncryption()"
```

### Manual Testing

1. **Test Authenticated Flow**:
   - Sign up and log in
   - Add an API key
   - Verify it appears in the list
   - Use AI features to confirm BYOK works
   - Check usage stats update

2. **Test Unauthenticated Flow**:
   - Clear browser storage
   - Visit site without logging in
   - Add temporary key
   - Verify expiration warning shows
   - Use AI features
   - Wait 24h and verify key expires

3. **Test Security**:
   - Verify keys are encrypted in DB
   - Verify users can't access others' keys
   - Verify middleware redirects work
   - Verify CodeQL shows no vulnerabilities

## Security Considerations

### Strengths

✅ AES-256-GCM authenticated encryption for persistent keys
✅ Separate encryption key from auth secrets
✅ User-scoped access controls
✅ Automatic expiration for temporary keys
✅ Browser fingerprinting for temp keys
✅ No security vulnerabilities (CodeQL verified)
✅ Usage tracking and audit trail

### Limitations

⚠️ Temporary keys in localStorage are not truly secure
⚠️ Server-side encryption key must be protected
⚠️ No key rotation mechanism (yet)
⚠️ No rate limiting on API key operations
⚠️ Browser fingerprinting is bypassable

### Best Practices

1. **Use Strong Secrets**: Generate with `openssl rand -base64 32`
2. **Rotate Secrets**: Plan for key rotation in production
3. **Monitor Usage**: Set up alerts for unusual API key usage
4. **Educate Users**: Encourage sign-up for persistent storage
5. **Rate Limiting**: Add rate limiting for key operations
6. **Audit Logs**: Consider logging all key access

## Future Enhancements

- [ ] Key rotation mechanism
- [ ] Rate limiting per key
- [ ] Key expiration dates for authenticated users
- [ ] Key sharing within organizations
- [ ] Detailed usage analytics
- [ ] Alert system for suspicious activity
- [ ] Support for multiple keys per provider
- [ ] Key versioning and rollback

## Support

For issues or questions:
- Check GitHub Issues: [OfferAnalyst Issues](https://github.com/Cism-Ch/OfferAnalyst/issues)
- Review docs: `/docs/` directory
- Contact: Via GitHub

## License

Same as OfferAnalyst project license.
