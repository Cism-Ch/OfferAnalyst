# Changelog

All notable changes to OfferAnalyst will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-26

### 🛡️ Audit & Durcissement de Sécurité Fullstack (Sprint 6 - Octobre 2026)

- **Authentification & Contrôle d'Accès** :
  - **Middleware** (`middleware.ts`) : Correction d'une faille critique de contournement (`startsWith('/')` matchant toutes les requêtes) ; protection stricte des routes privées et ajout de `/admin` dans les préfixes protégés.
  - **RBAC Administrateur** (`src/app/actions/db/admin.ts`, `src/app/api/admin/feature-flags/route.ts`) : Vérification systématique du rôle `ADMIN` via session Better-Auth sur les actions de monitoring et de feature flags.
  - **Sécurité Better-Auth** (`src/lib/auth.ts`) : Validation fail-closed stricte de `BETTER_AUTH_SECRET` en production empêchant l'usage de secrets par défaut.

- **Fermeture des Surfaces d'Attaque RPC ('use server') & Secrets** :
  - **Déclassification `api-key-provider.ts`** : Retrait de `'use server'` convertissant la méthode `getAPIKey()` en utilitaire serveur interne hermétique, éliminant la fuite publique de `OPENROUTER_API_KEY`.
  - **Déclassification `email-notifications.ts`** : Retrait de `'use server'` empêchant l'usurpation publique d'envoi d'alertes email par requête HTTP directe.
  - **Élimination de l'action `getDecryptedAPIKey`** : Suppression de l'exposition publique en clair des clés API BYOK utilisateur via Server Action RPC.

- **Protection Anti-IDOR (Insecure Direct Object Reference)** :
  - **Gestion des Clés API** (`src/app/actions/db/api-keys.ts`, `api-key-rotation.ts`) : Écrasement forcé du `userId` fourni par le client par le `session.user.id` authentifié.
  - **Alertes de Sécurité** (`src/app/actions/db/security-alerts.ts`) : Sécurisation de la consultation, lecture, résolution et suppression par session utilisateur.
  - **Analytiques & Métriques** (`src/app/actions/db/analytics.ts`, `api-key-analytics.ts`) : Sécurisation de toutes les requêtes de reporting et métriques d'usage par session.

- **Protection Anti-SSRF & Sécurité des Webhooks** :
  - **Validateur Anti-SSRF** (`src/lib/webhooks.ts`) : Validation préalable de toutes les URLs cibles bloquant les protocoles non HTTP(S), les adresses de boucle locale (`localhost`, `127.0.0.1`), les réseaux privés (RFC 1918) et les métadonnées d'instance cloud (`169.254.169.254`).
  - **Webhook Worker QStash** (`src/app/api/jobs/route.ts`) : Mode fail-closed en production avec rejet HTTP 503 si les clés de signature cryptographique ne sont pas initialisées.

- **Durcissement des En-têtes HTTP (Content-Security-Policy)** :
  - **Next.js Config** (`next.config.ts`) : Ajout de la directive `Content-Security-Policy` avec restriction des sources de scripts, styles, polices et `frame-ancestors 'none'` anti-clickjacking.

### 🧠 Recursive Self-Improvement (RSI) & AI Meta-Governance (Sprint 6 - October 2026)

- **Protocole RSI (Recursive Self-Improvement) & Méta-Gouvernance** :
  - Mise en place de l'arborescence `.agents/rules/` (`system_core.md`, `fullstack_playbook.md`) pour l'apprentissage continu des agents IA.
  - Ajout des prompts spécialisés pour agents autonomes : `worker_fullstack.md` (développeur de bout en bout) et `meta_optimizer.md` (méta-analyste d'échecs et mutation procédurale).
  - Implémentation du Juge Déterministe (`evals/run_fullstack_eval.py`) remplaçant le jugement subjectif par une évaluation binaire (Types, Lint, Prisma MongoDB, Build).
  - Création de l'Orchestrateur de Cycle RSI (`evals/rsi_orchestrator.py`) avec Git guardrail et compaction anti-bloat (< 150 lignes de playbook).
  - Création de l'outil de skill `db_schema_validator.py` pour valider l'intégrité MongoDB Atlas et les singletons Prisma.
  - Définition du workflow exécutable `/rsi-feature` dans `.agents/workflows/rsi-feature.md`.
  - Nouveaux scripts npm dédiés (`eval:fullstack`, `eval:quick`, `rsi:orchestrate`, `rsi:guardrail`, `db:validate`).
  - Documentation officielle mise à jour dans `Agent.md` (Section 12) et `AGENTS.md`.

### ⚡ Infrastructure & Distributed Scalability (Sprint 5 - October 2026)

- **Upstash QStash Async Worker**:
  - Implemented `src/lib/qstash.ts` with singleton client and `Receiver` for cryptographic signature verification (`upstash-signature`).
  - Created `/api/jobs/route.ts` background worker supporting idempotent job handling (`send_email`, `webhook_retry`, `heavy_analysis`).
  - Asynchronously offloaded email notifications in `src/lib/email-notifications.ts` without blocking the HTTP request cycle.

- **Tigris S3 Cloud Object Storage**:
  - Implemented `src/lib/storage.ts` using AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) targeting Tigris Storage.
  - Added `uploadExportDocument` and `getPresignedDownloadUrl` supporting secure 15-minute presigned download URLs.
  - Extended `exportOrganizedOffersAction` in `src/app/actions/organizeV2.ts` with `uploadToCloud: true` support.

- **Automated E2E Testing & CI/CD Pipeline**:
  - Configured Playwright with `playwright.config.ts` and created `tests/e2e/workflow.spec.ts` covering critical user journeys and API security.
  - Added `npm run test:e2e` script to `package.json`.
  - Built GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`) enforcing strict lint, TypeScript compilation (`tsc --noEmit`), and Playwright test validation on every PR.

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
- `docs/archive/reports/IMPLEMENTATION_SUMMARY.md` - French user guide
- `.env.example` - Updated with new environment variables

**Key Resources:**
- [Security Architecture](docs/API_KEY_SECURITY.md)
- [Implementation Summary (FR)](docs/archive/reports/IMPLEMENTATION_SUMMARY.md)
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
