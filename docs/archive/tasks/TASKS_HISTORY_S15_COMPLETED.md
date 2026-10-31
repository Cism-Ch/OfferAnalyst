# ✅ Archive Complète du Sprint 15 — Auth & User Journeys (M1, M2, M3, M4), Ops pnpm & Export / Partage Collaboratif

**Date d'achèvement :** 31 Octobre 2026  
**Statut :** 100% Achevé & Validé (`npx tsc --noEmit` : 0 erreur | `npm run lint` : 0 warning | `npm run eval:quick` : 100/100 | Tests Adversariaux : 12/12 PASS)  

---

## 📋 Récapitulatif des Lots & Tâches Réalisés

### 🔐 Lot 1 : Configuration Better-Auth, Schéma Prisma & Hygiène Outillage (`TASK-AUTH-01`)
- [x] **`TASK-AUTH-01.01`** : Élimination du masquage des identifiants Google OAuth dans `.env.local` sans suppression de variables.
- [x] **`TASK-AUTH-01.02`** : Optimisation ESLint (`docs/**`, `tests/**`, `scripts/**` dans `globalIgnores`, cache activé `eslint --cache`, timeout étendu à 240s dans l'évaluateur).
- [x] **`TASK-AUTH-01.03`** : Alignement schéma Prisma (`User.emailVerified: Boolean`, élimination du risque de collision null MongoDB sur `Account`, unique `[providerId, accountId]`) et régénération du client.
- [x] **`TASK-AUTH-01.04`** : Configuration Better-Auth (`accountLinking: ["google", "github"]`, `onAPIError.errorURL: "/auth/login"`, `google.prompt: "select_account"`, `accessType: "offline"`).
- [x] **`TASK-AUTH-01.05`** : Création de la page de secours défensive `/error/page.tsx` évitant toute erreur 404 en cas d'échec ou d'annulation OAuth.
- [x] **`TASK-AUTH-01.06`** : Validation déterministe avec `npx tsc --noEmit`, `npm run lint` et `npm run eval:quick` (Score 100/100, PASS, 0 erreur).

### 🛡️ Lot 2 : Protection des Routes, Middleware & Expérience Utilisateur OAuth (`TASK-AUTH-02`)
- [x] **`TASK-AUTH-02.01`** : Détection résiliente de cookie de session dans `middleware.ts` pour `offeranalyst.session_token` et `__Secure-offeranalyst.session_token` avec validation de chaîne non-vide (anti-bypass de cookie vide et priorité multi-cookies).
- [x] **`TASK-AUTH-02.02`** : Déverrouillage de la route `/history` pour les invités sans compte, tout en préservant l'URL cible via le paramètre de retour `from`.
- [x] **`TASK-AUTH-02.03`** : Prise en charge du paramètre `from` dans `getCallbackUrl()` de `login/page.tsx` avec assainissement strict anti-open-redirect (`isSafeRelativeUrl`) et transmission de `errorCallbackURL: "/auth/login"` dans `signIn.social`.
- [x] **`TASK-AUTH-02.04`** : Capture des erreurs OAuth (`access_denied`, `account_not_linked`, `OAuthCallbackError`, `configuration`, `verification`) avec affichage bilingue FR/EN (alerte motion + toast) et encapsulation `<Suspense>`.
- [x] **`TASK-AUTH-02.05`** : Création du modal d'authentification fluide `FluidAuthModal.tsx` et intégration dans `ModernSidebar.tsx` pour intercepter les clics invités sur `/saved` et `/projects`.
- [x] **`TASK-AUTH-02.06`** : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests adversariaux M2 100% PASS).

### 🔑 Lot 3 : Parcours Invité, Clé API 24h Chiffrée & Quotas Quotidiens Stricts (`TASK-AUTH-03`)
- [x] **`TASK-AUTH-03.01`** : Actions serveur `guest-api-key.ts` avec chiffrement `AES-256-GCM` et stockage en cookie `offeranalyst.guest_key` HttpOnly/Secure 24h (zéro fuite de clé en clair).
- [x] **`TASK-AUTH-03.02`** : Ordre de résolution strict dans `getAPIKey` (1. DB BYOK -> 2. Cookie Chiffré Invité -> 3. Client Key -> 4. Fallback Env).
- [x] **`TASK-AUTH-03.03`** : Limiteur de quota strict (10 recherches/jour, fenêtre UTC, cookie `offeranalyst.guest_id`, contournement BYOK illimité) et injection dans `fetch` & `analyze`.
- [x] **`TASK-AUTH-03.04`** : Composant modal `GuestApiKeyDialog.tsx` avec compte à rebours 24h, aperçu masqué et révocation immédiate.
- [x] **`TASK-AUTH-03.05`** : Indicateurs de quota en temps réel dans `ModernHeader.tsx` (badge Zap) et widget progress bar dans `ModernSidebar.tsx`.
- [x] **`TASK-AUTH-03.06`** : Intégration sur `/data-source` avec désactivation préventive en cas de quota épuisé et CTA vers clé BYOK ou inscription.
- [x] **`TASK-AUTH-03.07`** : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests empiriques adversariaux M3 100% PASS).

### 🕒 Lot 4 : Double Stockage de l'Historique de Recherche & Rétention Cloud (`TASK-AUTH-04`)
- [x] **`TASK-AUTH-04.01`** : Actions serveur `src/app/actions/db/history.ts` avec validation Zod, protection IDOR stricte (confinement au `session.user.id`) et pattern `{ success, data, error }`.
- [x] **`TASK-AUTH-04.02`** : Hook unifié `use-search-history.ts` avec double stockage : localStorage avec TTL 7 jours (`offeranalyst_guest_search_history`, purge auto) pour les invités vs persistance MongoDB Atlas pour les connectés.
- [x] **`TASK-AUTH-04.03`** : Migration automatique de l'historique invité local vers MongoDB Atlas lors de la connexion/inscription (`migrateGuestSearchesAction`) avec déduplication et nettoyage localStorage.
- [x] **`TASK-AUTH-04.04`** : Endpoint CRON de rétention `/api/cron/cleanup-history` (GET/POST) avec authentification `CRON_SECRET` / QStash, supprimant les recherches non épinglées > 90 jours tout en préservant indéfiniment les recherches épinglées.
- [x] **`TASK-AUTH-04.05`** : Intégration transparente dans l'interface `/history` (bannière de statut dual-storage, badges d'expiration TTL 7j, restauration sécurisée) et dans `AnalysisContext.tsx`.
- [x] **`TASK-AUTH-04.06`** : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests adversariaux M4 100% PASS).

### 🧹 Lot 5 : Nettoyage de l'Empreinte Mémoire du Repo & Standardisation `pnpm` (`TASK-OPS-01`)
- [x] **`TASK-OPS-01.01`** : Suppression de `package-lock.json` du suivi Git, blocage dans `.gitignore` et déclaration de `"packageManager": "pnpm@12.15.0"` dans `package.json`.
- [x] **`TASK-OPS-01.02`** : Purge des artefacts lourds (`.next`, `tsconfig.tsbuildinfo`, `.eslintcache`) et nettoyage complet de `node_modules` (passage de 3,93 Go à 791 Mo).
- [x] **`TASK-OPS-01.03`** : Compactage de la base d'objets Git (`git gc --prune=now`) pour éliminer les objets libres (passage de 13,36 Mo à 8,61 Mo).
- [x] **`TASK-OPS-01.04`** : Fusion et migration du pipeline GitHub Actions unique dans `.github/workflows/ci-cd.yml` (`pnpm/action-setup@v4`, `pnpm install --frozen-lockfile`).
- [x] **`TASK-OPS-01.05`** : Élagage de `.agents/skills/` (conservation des 22 skills propres à la stack OfferAnalyst et de `db_schema_validator.py`, suppression des 146 skills hors-sujet : passage de 19,4 Mo à 762 Ko).
- [x] **`TASK-OPS-01.06`** : Suppression de la dépendance inutilisée `@google/genai` et de ses 36 sous-paquets.
- [x] **`TASK-OPS-01.07`** : Suppression du dossier `pictures/` non référencé et de 46 archives intermédiaires obsolètes dans `docs/archive/`.
- [x] **`TASK-OPS-01.08`** : Purge du cache global `npm`, `pnpm store prune` (-2,06 Go au total) et re-compactage Git.

### 📊 Lot 6 : Export PDF/CSV & Partage Collaboratif Public (`TASK-EXP-01` à `TASK-EXP-04`)
- [x] **`TASK-EXP-01.01`** : Moteur d'export CSV structuré (`src/lib/export.ts`) avec encodage UTF-8 BOM, échappement strict des guillemets et séparateurs, en-têtes bilingues FR/EN, synthèse du marché et répartition pondérée des scores (Pertinence 50%, Qualité 30%, Tendance 20%).
- [x] **`TASK-EXP-01.02`** : Générateur de rapports PDF 1.4 binaire en pur TypeScript (`src/lib/export.ts`) sans dépendance lourde externe, incluant bandeau de marque, synthèse exécutive, badges de notes et justifications IA multi-pages.
- [x] **`TASK-EXP-02.01`** : Modèle Prisma MongoDB `SharedAnalysis` (`prisma/schema.prisma`), Server Actions (`src/server/share.ts`) générant des jetons crypto-sécurisés (`sh_...`) avec expiration TTL, compteur de vues et compatibilité invité & authentifié.
- [x] **`TASK-EXP-02.02`** : Page de consultation publique en lecture seule (`src/app/share/[id]/page.tsx`), React Server Component (RSC) bilingue, génération dynamique des métadonnées OpenGraph, zéro droit de mutation et toolbar client (`SharedViewToolbar.tsx`).
- [x] **`TASK-EXP-03.01`** : Intégration de la toolbar d'actions rapides bilingues dans `ResultsSection.tsx` (Télécharger PDF, Exporter CSV, Partager) et composant modal de partage `ShareAnalysisModal.tsx`, plus bouton de copie/partage dans `OfferDetailModal.tsx`.
- [x] **`TASK-EXP-04.01`** : Validation déterministe intégrale avec `tests/adversarial_sprint15_export_share.mjs` (12/12 PASS), `npm run eval:quick` (100/100, 0 erreur TypeScript, 0 warning ESLint, conformité Prisma MongoDB).
