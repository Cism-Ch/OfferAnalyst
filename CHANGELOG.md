# Changelog

All notable changes to OfferAnalyst will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0-minor] - 2026-10-31

### 🧩 Contournement Anti-Bot & Capture 1-Clic Multi-Plateformes (Sprint 29)

- **Bookmarklet Universel Glisser-Déposer (`src/components/data-source/CaptureAssistantModal.tsx`)** :
  - Bookmarklet JavaScript universel sans installation, compatible 100% navigateurs (Chrome, Firefox, Safari, Edge, Arc, Brave).
  - Extraction intelligente du DOM (sélecteurs optimisés pour LinkedIn, Indeed, Welcome to the Jungle ou sélection utilisateur directe).
  - Transmission zéro-blocage par fragment d'URL (`#capture=...`) évitant tout rejet HTTP 414 URI Too Long sur serveur.
- **Extension Google Chrome Dédiée Manifest V3 (`extension/*`)** :
  - Extension Chrome complète avec `manifest.json` (V3), scripts de contenu, popup moderne dark mode OfferAnalyst et détection automatique de plateforme.
  - Archive téléchargeable en 1 clic (`public/extension/offeranalyst-extension.zip`) pour installation rapide en mode développeur.
- **Ingestion & Routage Automatisé sur `/data-source`** :
  - Détection automatique des charges capturées (`#capture=` ou `?capture=`), bascule instantanée sur l'onglet *Texte Libre* et pré-remplissage immédiat pour structuration IA.
  - Boutons d'accès direct à l'Assistant de Capture depuis l'en-tête de la page et la notice anti-bot de l'onglet URLs.
  - Bilinguisme intégral FR / EN (`captureAssistant` dans `LanguageContext.tsx`).

## [1.2.3-patch] - 2026-10-31

### ⚡ Chantier 3 : Architecture & Viabilité Technique — Cache Multi-Niveaux & Protection Anti-Timeout (Sprint 28)

- **Cache Multi-Niveaux Déterministe (`src/lib/cache.ts`)** :
  - Implémentation du helper `getOrSetCache` avec calcul d'empreinte SHA-256 (`generateCacheKey`) pour éliminer les appels redondants vers OpenRouter et accélérer les requêtes à < 5ms.
  - Intégration transparente dans `fetchOffersAction`, `analyzeOffersAction` et `structureRawOffersAction` avec TTL paramétrable de 2 heures.
  - Métadonnée `cached: boolean` propagée dans les réponses d'actions serveur.
- **Protection Anti-Bot & Robustesse d'Importation par Liens (`UrlImportTab.tsx`)** :
  - Détection préventive des blocages anti-bots (Cloudflare, CAPTCHAs, 403) sur les plateformes fermées (LinkedIn, Indeed).
  - Bannière de guidage et bascule assistée vers l'onglet Texte Libre (`RawTextTab`) avec instructions claires (Ctrl+A / Ctrl+C).
- **Prévention des Timeouts Vercel** :
  - Troncature et rationalisation des charges utiles pour garantir l'exécution bien sous le seuil serverless (10s Hobby / 60s Pro).

## [1.2.2-patch] - 2026-10-31

### ⚡ Chantier 4 : Moteur d'Action Post-Scoring & Monétisation (Sprint 27)

- **Génération de Livrables Post-Scoring (`generateOfferActionContentAction.ts`)** :
  - Server Action déterministe pour transformer les scores d'excellence (ex. 85%) en résultats concrets :
    - `negotiation_pitch` : Formule des angles stratégiques, des contre-termes cibles (+15%, compensation coût de la vie) et un script complet prêt à copier.
    - `custom_application` : Rédige une accroche non-générique, des arguments d'alignement profil/besoins et un message d'impact prêt à l'envoi.
  - Télémétrie IA et protection des quotas journaliers intégrées avec support BYOK.
- **Modaux d'Action Haute-Conversion** :
  - **`NegotiationPitchModal.tsx`** : Modal interactif avec badges de leviers, boîte de termes cibles suggérés, script formatté et bouton de copie 1-clic.
  - **`TailoredApplicationModal.tsx`** : Modal de candidature sur-mesure avec accroche à fort impact, points d'alignement et lettre de motivation optimisée.
- **Intégration UI Omniprésente** :
  - Raccourcis directs sur chaque fiche d'offre (`OfferCard.tsx`).
  - Bloc d'action dédié dans le modal d'exploration approfondie (`OfferDetailModal.tsx`).
  - Carte latérale d'action prioritaire sur l'offre #1 sur la page d'analyse (`src/app/analysis/page.tsx`).
  - Prise en charge complète dans `ResultsSection.tsx`.
- **Bilinguisme Intégral FR/EN** :
  - Ajout des dictionnaires `postScoreActions` dans `LanguageContext.tsx`.

## [1.2.1-multi-ingest] - 2026-10-31

### 📥 Chantier 2 : Ingestion Multi-Sources sans Friction & Masquage de la Complexité JSON (Sprint 26)

- **Hub d'Ingestion Multi-Sources (`src/app/data-source/page.tsx`)** :
  - **Onglet Texte Libre par Défaut (`RawTextTab.tsx`)** : Permet le copier-coller en vrac de descriptions brutes issues de LinkedIn, Indeed ou d'emails sans aucune compétence technique.
  - **Extraction & Normalisation IA Déterministe (`structureRawOffersAction.ts`)** : Pipeline d'extraction propulsé par NVIDIA Nemotron 3.5 Lightning, normalisant le texte en objets `Offer[]` avec détection des salaires, localisations et exigences.
  - **Onglet Import par Liens/URLs (`UrlImportTab.tsx`)** : Interface d'import d'annonces par URL avec validation stricte, garde-fous anti-SSRF et extraction assistée.
  - **Onglet Fichiers (`FileUploadTab.tsx`)** : Prise en charge des fichiers CSV avec détection automatique des en-têtes et fichiers textes.
  - **Onglet Développeurs Découplé (`JsonInputTab.tsx`)** : Déplacement de la saisie JSON dans un onglet dédié pour préserver l'accès API pour les profils techniques sans intimider 98% des utilisateurs.
  - **Bilinguisme FR/EN Exhaustif** : Tous les onglets et libellés traduits dans `LanguageContext.tsx`.

## [1.2.0-saas-vitrine] - 2026-10-31

### 🌟 Chantier 1 : Page de Présentation SaaS, Démo Interactive 1 Clic & Navigation Anti-Bounce par Cookies (Sprint 25)

- **Architecture de Navigation & Persistance des Cookies (`offeranalyst_app_mode`)** :
  - **Protection Anti-Bounce** : Implémentation du cookie `offeranalyst_app_mode` (`'app'` | `'vitrine'`) avec persistance 30 jours, garantissant qu'un rafraîchissement de page (F5) ou un retour sur l'application ne renvoie jamais un utilisateur actif vers la page vitrine.
  - **Contrôleur Dynamique Racine (`/`)** : Détection instantanée côté serveur via `next/headers` : les visiteurs découvrent la vitrine avec la démo interactive, tandis que les utilisateurs actifs atterrissent directement sur le tableau de bord de travail sans scintillement ni redirection HTTP superflue.
  - **Middleware Unifié** : Configuration du cookie dans `middleware.ts` lors de l'accès à toute route du parcours applicatif (`/search-context`, `/data-source`, `/analysis`, etc.) et support du paramètre explicite `?view=vitrine` ou `?view=app`.
- **Démo Interactive en 1 Clic (`InteractiveDemoWidget`)** :
  - **Zéro Friction** : Accessible immédiatement sans inscription ni carte bancaire, permettant d'exécuter une simulation de scan multi-axes en 1 seconde.
  - **3 Scénarios d'Arbitrage Réels** : Pré-configurations concrètes (Tech Expat & Remote, Recrutement & Sourcing B2B, Arbitrage Immobilier Professionnel).
  - **Preuves Anti-Hallucination & Citations Web** : Décomposition des scores sur 4 axes, synthèse déterministe par l'IA et citations web vérifiées en direct (levels.fyi, Glassdoor, accords d'entreprise).
- **Refonte de la Vitrine SaaS (`SaaSPresentationView` & `/landing`)** :
  - **Positionnement B2B / Prosumer** : Hero orienté sur l'arbitrage d'opportunités à fort enjeu (tech expatriés/remote, recruteurs, investisseurs) et le calcul du vrai reste-à-vivre.
  - **Bento Grid Décisif** : 4 piliers de différenciation (Citations web prouvées, modèle NVIDIA Nemotron inclus, BYOK illimité sans marge, sécurité et zéro rétention de données).
  - **Grille Tarifaire Transparente** : Formule Découverte gratuite (10 recherches/jour) vs Pro BYOK illimité.
- **Bilinguisme & Intégration Shell** :
  - Traduction intégrale FR/EN dans `LanguageContext.tsx`.
  - Liens bidirectionnels fluides ajoutés dans la barre latérale (`ModernSidebar`) et l'en-tête (`ModernHeader`).

### 📥 Chantier 2 : Ingestion Multi-Sources sans Friction (`/data-source`) (Sprint 26)

- **Suppression Définitive de la Barrière JSON** :
  - **Onglet Texte Libre (Par Défaut)** : Permet de coller du texte en vrac (copier-coller de LinkedIn, Indeed, emails) et le structure en un clic via l'agent serveur `structureRawOffersAction` propulsé par NVIDIA Nemotron.
  - **Onglet Liens / URLs** : Saisie et validation Zod de 1 à 10 URLs d'offres web avec contrôles de sécurité.
  - **Onglet Import Fichiers** : Détection et parsing automatique des fichiers CSV (mappage intelligent des colonnes titre, entreprise, salaire, localisation et description), JSON et TXT.
  - **Onglet Mode Développeur / JSON API** : Préservation du mode JSON historique pour les intégrations d'API et les utilisateurs techniques.
- **Expérience Utilisateur & Intégration Unifiée** :
  - Compteur d'offres prêtes en temps réel (`X offres prêtes`).
  - Prévisualisation directe sous forme de fiches éditables et suppression unitaire en 1 clic.
  - Bilinguisme intégral FR/EN dans `src/contexts/LanguageContext.tsx`.

## [1.1.1-patch] - 2026-10-31

### 🎨 UI/UX Mobile & Navbar SaaS Premium (Sprint 24)

- **Navbar & Navigation Mobile SaaS Premium** :
  - **Bouton Drawer Arrondi** : Transformation en pastille circulaire `rounded-full` avec micro-glassmorphism (`bg-background/80 backdrop-blur-md`), bordure discrète et centrage vertical dans les 56px du header.
  - **Fil d'Ariane & Titres** : Remplacement du fil d'Ariane brut par un Pill Badge unifié évitant les coupures sur petits écrans, et centrage esthétique des titres de pages sur mobile.
  - **Alignement Snappé à Droite** : Regroupement et ancrage à l'extrémité droite (`ml-auto`) du sélecteur de langue et du sélecteur de thèmes avec bordures coordonnées.
  - **Sélecteur de Modèle IA & NVIDIA par Défaut** : Modèle d'inférence par défaut fixé sur `nvidia/nemotron-3.5-lightning:free` avec padding tactile confortable (`px-2.5 sm:px-3`) et affichage réactif à partir de 480px.
  - **Correctif Tactile Dialogue Clé API Invité** : Fermeture automatique du sheet sous-jacent lors de l'ouverture du dialog pour libérer le focus-trap Radix, élévation du z-index du composant `SelectContent` (`z-[70]`), et calibration des cibles tactiles à la norme WCAG 44px (`touch-manipulation`).
  - **Refonte Responsive de `/data-source`** : Header de carte flexible (`flex-col sm:flex-row`), switch d'extraction automatique isolé sans rétrécissement, bannières quota/BYOK adaptatives et boutons d'action épurés.

## [1.1.0] - 2026-10-31

### 🚀 Responsive Design, Fluidité UI/UX, Z-Index Unifié & Remédiation Pré-Release (Sprints 7 à 23)

- **Audit Pré-Release & Sécurité (Sprint 23)** :
  - **Gestion stricte des Clés API** : Les clés vivent exclusivement dans `.env`. Clés de test remplacées par des fixtures synthétiques pour les suites d'intégrité et de résistance cryptographique.
  - **Assainissement des Endpoints** : `POST /api/analytics/event` protégé par rate limiting (60 req/min/IP), validation stricte par schéma Zod (bornes de taille 16KB max) et suppression de la route modèle `/api/example`.
  - **Purge de la Pile V2 Morte** : Élimination complète des actions orphelines `analyzeV2.ts`, `fetchV2.ts`, `organizeV2.ts` et du dossier obsolète `src/lib/export/`. Standardisation sur le moteur unifié `src/lib/export.ts` (anti-CWE-1236 et PDF binaire 1.4).
  - **Validation Zod Binaire** : Protection des Server Actions `fetchOffersAction`, `analyzeOffersAction`, `organizeOffersAction` avec bornes strictes sur la taille des textes, du nombre d'offres (max 100) et des paramètres.
  - **Hygiène HTML & Accessibilité** : Ajout de `data-scroll-behavior="smooth"` sur `<html>`, synchronisation réactive de `document.documentElement.lang` avec la langue active, et substitution des `min-h-screen` par `min-h-app`.
  - **Documentation des Variables d'Environnement** : Complétion de `.env.example` avec les 9 variables de production et de test requises.

- **Design System & Fluidité UI/UX (Sprints 17 à 22)** :
  - **Architecture Responsive & Viewport** : Introduction des jetons de hauteur dynamique `100dvh` (`min-h-app`), prise en compte des encoches `viewport-fit=cover` et calibration des cibles tactiles mobiles à la norme W3C 44px (`h-11 md:h-9`).
  - **AppShell & Navigation Adaptative** : Sidebar unifiée avec mode "icon rail" sur tablette (768-1023px) et tiroir mobile animé via Radix Sheet. Header compact 56px sur mobile avec safe area padding.
  - **Container Queries & Grilles Fluides** : Grille d'offres `OfferCard` avec `@container` (passage compact/étendu selon la largeur réelle), table responsive générique (`ResponsiveTable`), snap scrolling horizontal sur la page `/compare`.
  - **Système de Z-Index & Motion Unifiés** : Normalisation des calques d'empilement `--z-*` (20-80), `MotionProvider` respectant `prefers-reduced-motion` avec accélération matérielle GPU (`transform, opacity`), et squelettes de chargement limitant le CLS.

- **Exportations Sécurisées & Partage Public (Sprint 15)** :
  - **Moteur PDF 1.4 Binaire** : Génération de rapports exécutifs haute fidélité en pur TypeScript, multi-pages, sans dépendance tierce.
  - **Export CSV RFC 4180** : Échappement anti-injection de formules tableurs (CWE-1236) avec BOM UTF-8 et en-têtes bilingues FR/EN.
  - **Partage Sécurisé & Masquage** : Jeton cryptographique `shareToken`, routes publiques `/share/[id]` anonymisées et isolation stricte des données sensibles.

- **Bilinguisme Intégral FR / EN (Sprints 13 & 14)** :
  - Traduction réactive à 100% de l'interface (tableaux de bord, formulaires, dialogue d'ajout de clés, bannières d'alerte, erreurs) synchronisée via `LanguageContext`.

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

**Note**: This changelog will be updated as new features and fixes a