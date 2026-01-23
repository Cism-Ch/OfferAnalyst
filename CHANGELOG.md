# Changelog

All notable changes to OfferAnalyst will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🔐 Security - API Key Management System (January 2026)

#### ⚠️ BREAKING CHANGE: New Secure API Key System

We have completely redesigned our API key management system to address security concerns. **All existing API keys must be re-entered.**

#### What Changed?

**Before:**
- ❌ API keys were visible to all users
- ❌ No authentication required for key management
- ❌ Keys stored with one-way hash (not retrievable for BYOK)

**After:**
- ✅ API keys are private and user-specific
- ✅ Authentication required for persistent storage
- ✅ AES-256-GCM encryption for secure storage and retrieval
- ✅ BYOK (Bring Your Own Key) support enabled

#### For Authenticated Users (Recommended)

**New Features:**
- **Persistent Storage**: Your API keys are encrypted with AES-256-GCM and stored securely in our database
- **Usage Tracking**: Monitor when and how often your keys are used
- **Automatic BYOK**: Your keys are automatically used for AI operations
- **No Expiration**: Keys remain until you delete them

**How to Add Keys:**
1. Log in to your account at `/auth/login`
2. Navigate to `/dashboard/api-keys`
3. Click "Add API Key"
4. Select your provider (OpenRouter, OpenAI, Anthropic, Google, Mistral)
5. Enter your key name and API key
6. Your key is encrypted and stored securely

#### For Unauthenticated Users

**New Features:**
- **Temporary Storage**: Add API keys without creating an account
- **24-Hour Expiration**: Keys automatically expire after 24 hours for security
- **Device-Bound**: Keys are linked to your browser/device
- **Privacy**: Keys stored locally in your browser only

**⚠️ Security Limitations:**
- Keys stored in browser localStorage (accessible via DevTools)
- Base64 obfuscation only (NOT encryption)
- Vulnerable to browser extensions and XSS attacks
- **Recommendation**: Create an account for secure, encrypted storage

**How to Add Temporary Keys:**
1. Visit `/dashboard/api-keys` (you'll see a login page)
2. Or access settings/configuration
3. Add your API key when prompted
4. See expiration warning and encouragement to sign up
5. Use AI features normally for 24 hours

#### Migration Required

**Action Required for Existing Users:**

Due to the encryption upgrade (bcrypt hash → AES-256-GCM), existing API keys cannot be migrated automatically.

**Steps:**
1. Navigate to `/dashboard/api-keys`
2. Delete old API keys (if any are shown)
3. Add your API keys again
4. They will be encrypted with the new secure system

**For Developers:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

#### New Environment Variables

Add to your `.env.local`:

```bash
# Required: Encryption key for API keys (minimum 32 characters)
API_KEY_ENCRYPTION_SECRET="your-secret-32-chars-minimum"

# Generate with: openssl rand -base64 32
```

#### Technical Details

**Encryption:**
- Algorithm: AES-256-GCM (authenticated encryption)
- Key derivation: Scrypt from `API_KEY_ENCRYPTION_SECRET`
- Unique IV per encryption for security

**Access Control:**
- Middleware protection on `/dashboard/*` routes
- User-scoped database queries
- Session-based authentication via Better-Auth

**BYOK Integration:**
- All AI server actions support user keys
- Fallback priority: User BYOK → Temporary key → Environment variable
- Usage tracking for authenticated users

#### Known Limitations

**Temporary Storage (Unauthenticated Users):**
- ⚠️ Base64 obfuscation is NOT encryption
- ⚠️ Accessible via browser DevTools
- ⚠️ Vulnerable to malicious browser extensions
- ⚠️ Susceptible to XSS attacks if present
- ⚠️ 24-hour expiration only
- **Solution**: Sign up for encrypted database storage

**Not Yet Implemented:**
- 🔄 Automatic key rotation
- ⏱️ Rate limiting per API key
- 📅 Custom expiration dates for authenticated users
- 👥 Key sharing between organization members
- 🔔 Alert system for suspicious usage
- 📊 Detailed usage analytics dashboard
- 🔑 Multiple keys per provider
- ↩️ Key versioning and rollback

#### Future Roadmap

**Q1 2026:**
- [ ] Key rotation mechanism for authenticated users
- [ ] Rate limiting per API key
- [ ] Enhanced usage analytics dashboard

**Q2 2026:**
- [ ] Custom expiration dates
- [ ] Organization key sharing
- [ ] Alert system for unusual activity

**Q3 2026:**
- [ ] Multiple keys per provider
- [ ] Key versioning and rollback
- [ ] Advanced security monitoring

#### Documentation

**New Documentation Added:**
- `docs/API_KEY_SECURITY.md` - Complete security architecture and usage guide
- `IMPLEMENTATION_SUMMARY.md` - French user guide
- `.env.example` - Updated with new environment variables

**Key Resources:**
- [Security Architecture](docs/API_KEY_SECURITY.md)
- [Implementation Summary (FR)](IMPLEMENTATION_SUMMARY.md)
- [Environment Setup](.env.example)

#### Security Validation

- ✅ **CodeQL Analysis**: 0 vulnerabilities found
- ✅ **Code Review**: All security concerns addressed
- ✅ **TypeScript Build**: No errors
- ✅ **Encryption**: AES-256-GCM with authenticated tags
- ✅ **Access Controls**: User-scoped, session-based

#### Questions or Issues?

- Check the [Security Documentation](docs/API_KEY_SECURITY.md)
- Review [GitHub Issues](https://github.com/Cism-Ch/OfferAnalyst/issues)
- Create a new issue for support

---

## Previous Versions

For historical changes before the security system redesign, please refer to git commit history.

---

**Note**: This changelog will be updated as new features and fixes are added to the project.
