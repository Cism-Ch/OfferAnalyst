# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche.

**Dernière mise à jour :** 26 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Phase 5 (Sprints 1, 2, 3 & 4 Complétés — Plateforme Intégrale Prête pour Production)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     🔴 SPRINT ACTIF     │  │   🟢 PROCHAIN SPRINT    │  │       ✅ TERMINÉ        │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] MAINTENANCE & CI/CD │  │ [ ] EXTENSION CHROME    │  │ [x] TASK-LINT-01 (React)│
│     (Tests E2E & Perf)  │  │     (Manifest V3)       │  │ [x] TASK-AI-01 (Fetch)  │
│ [ ] MONITORING QSTASH   │  │ [ ] EXPORTS S3 TIGRIS   │  │ [x] TASK-AI-02 (Cache)  │
│     (Jobs asynchrones)  │  │     (Presigned URLs)    │  │ [x] TASK-AI-03 (Workflow)│
│                         │  │                         │  │ [x] TASK-DATA-01(MongoDB│
│                         │  │                         │  │ [x] TASK-DATA-02(Webhook│
│                         │  │                         │  │ [x] TASK-DATA-03(Exports│
│                         │  │                         │  │ [x] TASK-AUTH-01(Verify)│
│                         │  │                         │  │ [x] TASK-AUTH-02(Reset) │
│                         │  │                         │  │ [x] TASK-AUTH-03(Onboard│
│                         │  │                         │  │ [x] TASK-ADMIN-01(Flags)│
│                         │  │                         │  │ [x] TASK-UI-01 (Analytics│
│                         │  │                         │  │ [x] TASK-UI-02 (Workspac│
│                         │  │                         │  │ [x] TASK-UI-03 (Themes) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🛠️ Tâches Récemment Complétées

### 🔐 Authentification & Espace Utilisateur (Sprint 3)

- [x] **`TASK-AUTH-01` — Vérification des Adresses Email (Resend)**
  - **Fichiers cibles :** `src/app/auth/verify/page.tsx`, `src/app/api/auth/verify-email/route.ts`, `src/app/api/auth/resend-verification/route.ts`
  - **Critères d'acceptation :**
    - [x] Token vérifié et invalidé après usage (expiration 24h).
    - [x] Bouton de réexpédition avec cooldown de 60s et rate limiting (3 requêtes / 15 min).
    - [x] Prise en charge des emails Resend et logs de développement.

- [x] **`TASK-AUTH-02` — Réinitialisation de Mot de Passe**
  - **Fichiers cibles :** `src/app/auth/reset/page.tsx`, `src/app/api/auth/reset-password/route.ts`
  - **Critères d'acceptation :**
    - [x] Token cryptographiquement sécurisé à usage unique (durée 1h).
    - [x] Mise à jour sécurisée du hash avec `bcryptjs` dans MongoDB / Prisma.
    - [x] Interface 2-étapes (demande de lien + nouveau mot de passe avec confirmation).
    - [x] Protection contre l'énumération d'adresses email.

- [x] **`TASK-AUTH-03` — Persistance du Profil Onboarding**
  - **Fichiers cibles :** `src/app/onboarding/page.tsx`, `src/app/api/profile/onboarding/route.ts`
  - **Critères d'acceptation :**
    - [x] Sauvegarde du cas d'usage dans `Profile` avec `onboardingComplete: true`.
    - [x] Chiffrement AES-256-GCM des clés BYOK fournies lors de l'onboarding.
    - [x] Support transparent du mode invité (guest session).

### 🎨 Administration & Améliorations de Confort (Sprint 4)

- [x] **`TASK-ADMIN-01` — API de Gestion Dynamique des Feature Flags**
  - **Fichiers :** `src/app/admin/page.tsx`, `src/lib/feature-flags.ts`, `src/app/api/admin/feature-flags/route.ts`
  - **Critères d'acceptation :**
    - [x] Module `feature-flags.ts` avec support de `fetchV2`, `organizeV2`, `dualWorkflow`, `newAnalytics`, `enableWebhooks`, `enableCache`.
    - [x] Endpoints `GET` et `POST` `/api/admin/feature-flags`.
    - [x] Console admin interactive avec interrupteurs dynamiques et mise à jour temps réel.

- [x] **`TASK-UI-01` — Dashboard Analytics Dédié (`/dashboard/analytics`)**
  - **Fichiers :** `src/app/dashboard/analytics/page.tsx`
  - **Critères d'acceptation :**
    - [x] KPI cards (recherches totales, résultats trouvés, score moyen, offres sauvegardées).
    - [x] Graphiques Recharts complets (LineChart, BarChart, PieChart, score distribution).

- [x] **`TASK-UI-02` — Paramètres d'Espace de Travail (`/dashboard/workspace`)**
  - **Fichiers :** `src/app/dashboard/workspace/page.tsx`
  - **Critères d'acceptation :**
    - [x] Gestion des membres d'équipe, rôles (Admin, Editor, Viewer), et préférences régionales.

- [x] **`TASK-UI-03` — Thèmes Visuels Étendus**
  - **Fichiers :** `src/components/theme-selector.tsx`
  - **Critères d'acceptation :**
    - [x] Palette complète (Light, Dark, Gold Luxury, Ocean Blue, Forest Green, Sunset Orange, Midnight Purple).
    - [x] Synchronisation fluide sans hydration mismatch via `useSyncExternalStore`.

---

## 🛠️ Tâches Complétées (Sprint 1 & Sprint 2)

### 🔴 Qualité & Linter React 19 (Sprint 1)
- [x] **`TASK-LINT-01`** — 11 Erreurs ESLint React 19 résolues (hooks & hydratation).
- [x] **`TASK-AI-01`** — Modernisation Fetch Agent V1 (Zod, zéro mock, retries).
- [x] **`TASK-AI-02`** — Couche de Caching TTL 3600s pour Fetch V2.
- [x] **`TASK-AI-03`** — Persistance et Polling temps réel du workflow IA.

### 🟡 Données & Fonctionnalités Avancées (Sprint 2)
- [x] **`TASK-DATA-01`** — Enregistrement des Analyses en Base de Données MongoDB (modèle `AnalysisResult` et actions CRUD).
- [x] **`TASK-DATA-02`** — Webhooks de Notification Asynchrones (HMAC SHA-256 et backoff exponentiel).
- [x] **`TASK-DATA-03`** — Modules d'Exportation CSV (RFC 4180) & PDF structuré.

---

## ✅ Historique des Tâches Terminées

| Date | ID | Intitulé & Description | Livrables / PR |
| :--- | :--- | :--- | :--- |
| **2026-10-26** | `TASK-ADMIN-01` | API de feature flags dynamiques et console admin connectée | `src/lib/feature-flags.ts`, `/api/admin/feature-flags`, `src/app/admin/page.tsx` |
| **2026-10-26** | `TASK-AUTH-03` | Route de persistance du profil onboarding et chiffrement BYOK | `src/app/api/profile/onboarding/route.ts`, `src/app/onboarding/page.tsx` |
| **2026-10-26** | `TASK-AUTH-02` | Endpoint et page de réinitialisation de mot de passe (token 1h, bcryptjs) | `src/app/api/auth/reset-password/route.ts`, `src/app/auth/reset/page.tsx` |
| **2026-10-26** | `TASK-AUTH-01` | Handlers de vérification d'email et réexpédition avec cooldown | `src/app/api/auth/verify-email/route.ts`, `src/app/api/auth/resend-verification/route.ts`, `src/app/auth/verify/page.tsx` |
| **2026-10-26** | `TASK-DATA-03` | Modules d'export CSV RFC 4180 et PDF structuré avec server action | `src/lib/export/csv.ts`, `src/lib/export/pdf.ts`, `src/app/actions/organizeV2.ts` |
| **2026-10-26** | `TASK-DATA-02` | Système de webhooks asynchrones avec HMAC SHA-256 et backoff | `src/lib/webhooks.ts`, `src/app/actions/analyzeV2.ts` |
| **2026-10-26** | `TASK-DATA-01` | Modèle Prisma `AnalysisResult` et actions CRUD d'historique MongoDB | `prisma/schema.prisma`, `src/app/actions/analyzeV2.ts` |
| **2026-10-26** | `TASK-AI-03` | Persistance et polling temps réel de progression du workflow IA | `src/app/actions/workflow/orchestrator.ts` |
| **2026-10-26** | `TASK-AI-02` | Couche de cache in-memory avec TTL et hash déterministe pour Fetch V2 | `src/lib/cache.ts`, `src/app/actions/fetchV2.ts` |
| **2026-10-26** | `TASK-AI-01` | Modernisation de l'Agent Fetch V1 (Zod, zéro mock, retries) | `src/app/actions/fetch.ts` |
| **2026-10-26** | `TASK-LINT-01` | Résolution complète des 11 erreurs ESLint React 19 (hooks & hydration) | 8 composants & hooks nettoyés |
| **2026-10-25** | `TASK-SYS-01` | Création de `Agent.md` et `AGENTS.md` pour l'encadrement des agents IA | [Agent.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/Agent.md) |
| **2026-01-23** | `TASK-SEC-01` | Refonte de la sécurité BYOK avec chiffrement AES-256-GCM et alertes | `src/lib/api-key-encryption.ts`, `docs/API_KEY_SECURITY.md` |
| **2026-01-22** | `TASK-DEP-01` | Correction de la configuration de déploiement Vercel (suppression secrets syntax) | `vercel.json`, `DEPLOYMENT_FIX_SUMMARY.md` |
| **2026-01-20** | `TASK-UI-TOAST` | Intégration des notifications Toast Sonner pour les actions clés API | `src/components/ui/sonner.tsx` |

---

## 📜 Protocole de Mise à Jour pour les Agents IA

Tout agent intervenant sur le repository **DOIT SUIVRE CE RITUEL** :

1. **Avant d'intervenir :**
   - Consulter `docs/TASKS.md` pour identifier l'ID de la tâche et ses critères d'acceptation.
   - Si la tâche n'existe pas, l'ajouter dans la section appropriée avec un ID formaté (`TASK-DOMAIN-XX`).
2. **Pendant l'intervention :**
   - Marquer la tâche avec `[-]` (En cours) si l'exécution implique plusieurs étapes documentées.
3. **Après validation technique (`tsc --noEmit` & `npm run lint`) :**
   - Cocher les critères d'acceptation et marquer `[x]`.
   - Transférer la tâche dans le tableau **Historique des Tâches Terminées** en spécifiant la date et les fichiers livrés.
   - Ne créer **AUCUN nouveau document de suivi séparé** : TOUT centraliser dans `docs/TASKS.md` !
 à Jour pour les Agents IA

Tout agent intervenant sur le repository **DOIT SUIVRE CE RITUEL** :

1. **Avant d'intervenir :**
   - Consulter `docs/TASKS.md` pour identifier l'ID de la tâche et ses critères d'acceptation.
   - Si la tâche n'existe pas, l'ajouter dans la section appropriée avec un ID formaté (`TASK-DOMAIN-XX`).
2. **Pendant l'intervention :**
   - Marquer la tâche avec `[-]` (En cours) si l'exécution implique plusieurs étapes documentées.
3. **Après validation technique (`tsc --noEmit` & `npm run lint`) :**
   - Cocher les critères d'acceptation et marquer `[x]`.
   - Transférer la tâche dans le tableau **Historique des Tâches Terminées** en spécifiant la date et les fichiers livrés.
   - Ne créer **AUCUN nouveau document de suivi séparé** : TOUT centraliser dans `docs/TASKS.md` !

