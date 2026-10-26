# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche.

**Dernière mise à jour :** 26 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Phase 4 (Sprints 1 & 2 Complétés — Moteur Multi-Agents, Données & Exports Validés)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     🔴 SPRINT 3 (ACTIF) │  │   🟢 SPRINT 4 (SUIVANT) │  │       ✅ TERMINÉ        │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-AUTH-01        │  │ [ ] TASK-ADMIN-01       │  │ [x] TASK-LINT-01 (React)│
│     (Verify Email)      │  │     (Feature Flags API) │  │ [x] TASK-AI-01 (Fetch)  │
│ [ ] TASK-AUTH-02        │  │ [ ] TASK-UI-01          │  │ [x] TASK-AI-02 (Cache)  │
│     (Password Reset)    │  │     (Analytics Dashboard│  │ [x] TASK-AI-03 (Workflow)│
│ [ ] TASK-AUTH-03        │  │ [ ] TASK-UI-02          │  │ [x] TASK-DATA-01(MongoDB│
│     (Onboarding Profile)│  │     (Workspace Settings)│  │ [x] TASK-DATA-02(Webhook│
│                         │  │                         │  │ [x] TASK-DATA-03(Exports│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif (Priorité Immédiate & Haute)

### 🔐 Authentification & Espace Utilisateur (Sprint 3)

- [ ] **`TASK-AUTH-01` — Vérification des Adresses Email (Resend)**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/auth/verify/page.tsx`, `src/app/api/auth/verify-email/route.ts`
  - **Description :** Finaliser le handler `/api/auth/verify-email` pour valider le token et basculer `emailVerified` dans Better-Auth / Prisma.
  - **Critères d'acceptation :**
    - [ ] Token vérifié et invalidé après usage (expiration 24h).
    - [ ] Bouton de réexpédition avec cooldown de 5 minutes.

- [ ] **`TASK-AUTH-02` — Réinitialisation de Mot de Passe**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/auth/reset/page.tsx`, `src/app/api/auth/reset-password/route.ts`
  - **Description :** Formulaire de demande et réinitialisation avec envoi de mail typé via Resend et rate limiting (3 requêtes/heure/IP).
  - **Critères d'acceptation :**
    - [ ] Token cryptographiquement sécurisé à usage unique (durée 1h).
    - [ ] Mise à jour sécurisée du hash dans Better-Auth.

- [ ] **`TASK-AUTH-03` — Persistance du Profil Onboarding**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/onboarding/page.tsx`, `src/app/api/profile/onboarding/route.ts`
  - **Description :** Sauvegarder les choix initiaux (domaine de prédilection, critères par défaut) dans le modèle `Profile` et marquer `onboardingComplete: true`.

---

## 📦 Backlog Sprint Suivant (Sprint 4)

### 🎨 Administration & Améliorations de Confort

- [ ] **`TASK-ADMIN-01` — API de Gestion Dynamique des Feature Flags**
  - **Fichiers :** `src/app/admin/page.tsx`, `src/lib/feature-flags.ts`
  - **Description :** Piloter à chaud l'activation de `fetchV2`, du cache et des webhooks.
- [ ] **`TASK-UI-01` — Dashboard Analytics Dédié (`/dashboard/analytics`)**
  - **Fichiers :** `src/app/dashboard/analytics/page.tsx`, composants Recharts
  - **Description :** Visualisation des KPI (recherches totales, score moyen, modèles les plus utilisés).
- [ ] **`TASK-UI-02` — Paramètres d'Espace de Travail (`/dashboard/workspace`)**
  - **Description :** Configuration de l'organisation, métadonnées de projet, gestion multi-sources.
- [ ] **`TASK-UI-03` — Thèmes Visuels Étendus**
  - **Description :** Ajout de thèmes alternatifs (Ocean Blue, Sunset Orange, Midnight Purple).

---

## 🛠️ Tâches Récemment Complétées (Sprint 1 & Sprint 2)

### 🔴 Qualité & Linter React 19 (Sprint 1)

- [x] **`TASK-LINT-01` — Résolution des 11 Erreurs ESLint React 19**
  - **Fichiers cibles :** 8 composants & hooks
  - **Critères d'acceptation :**
    - [x] `npm run lint` s'exécute avec 0 erreur et 0 avertissement.
    - [x] Aucun flash ou problème d'hydratation côté client (`useSyncExternalStore` et timers asynchrones).
    - [x] `npx tsc --noEmit` reste à 0 erreur.

### 🟡 Moteur Multi-Agents (Fiabilité & Performance — Sprint 1)

- [x] **`TASK-AI-01` — Modernisation de l'Agent Fetch V1**
  - **Fichiers cibles :** `src/app/actions/fetch.ts`, `src/app/actions/shared/agent-utils.ts`
  - **Critères d'acceptation :**
    - [x] Zéro mock renvoyé en cas d'erreur API ; retour d'un `AgentError` explicite.
    - [x] Parsing robuste supportant le markdown wrapping (```json).
    - [x] Validation complète du tableau d'offres via `OfferArraySchema`.

- [x] **`TASK-AI-02` — Couche de Caching pour `fetchV2.ts`**
  - **Fichiers cibles :** `src/app/actions/fetchV2.ts`, `src/lib/cache.ts`
  - **Critères d'acceptation :**
    - [x] Les recherches identiques retournent le résultat en cache instantanément (< 50ms).
    - [x] Métadonnées `cached: true/false` incluses dans `AgentActionResult`.
    - [x] Support BYOK et hash déterministe.

- [x] **`TASK-AI-03` — Persistance de la Progression du Workflow**
  - **Fichiers cibles :** `src/app/actions/workflow/orchestrator.ts`, `src/lib/cache.ts`
  - **Critères d'acceptation :**
    - [x] Les étapes et pourcentages sont consultables via ID de workflow (`getWorkflowProgress`).
    - [x] Support de la reconnexion / polling côté UI sans perte d'état (`getWorkflowProgressHistory`).
    - [x] Nettoyage automatique des workflows expirés (TTL 15 min).

### 🟡 Données & Fonctionnalités Avancées (Sprint 2)

- [x] **`TASK-DATA-01` — Enregistrement des Analyses en Base de Données**
  - **Fichiers cibles :** `src/app/actions/analyzeV2.ts`, `prisma/schema.prisma`
  - **Critères d'acceptation :**
    - [x] Modèle Prisma `AnalysisResult` créé et généré via `npx prisma generate`.
    - [x] L'action `analyzeOffersActionV2` sauvegarde les données quand `storeResults: true`.
    - [x] Server Actions de consultation de l'historique : `getUserAnalysisHistory`, `getAnalysisResultById`, `deleteAnalysisResult`.

- [x] **`TASK-DATA-02` — Webhooks de Notification Asynchrones**
  - **Fichiers cibles :** `src/app/actions/analyzeV2.ts`, `src/lib/webhooks.ts`
  - **Critères d'acceptation :**
    - [x] Retry automatique (3 tentatives avec exponential backoff).
    - [x] Timeout de 5s via AbortController pour ne jamais bloquer l'action.
    - [x] Signature HMAC SHA-256 (`X-OfferAnalyst-Signature`).
    - [x] Journalisation structurée via `@/lib/logger`.

- [x] **`TASK-DATA-03` — Modules d'Exportation CSV & PDF**
  - **Fichiers cibles :** `src/app/actions/organizeV2.ts`, `src/lib/export/csv.ts`, `src/lib/export/pdf.ts`
  - **Critères d'acceptation :**
    - [x] Export CSV conforme RFC 4180 avec échappement des guillemets et caractères spéciaux.
    - [x] Export PDF structuré avec synthèse exécutive, métadonnées, scores radar et offres groupées.
    - [x] Server Action `exportOrganizedOffersAction` avec retour `{ success: true, data } | { success: false, error }`.

---

## ✅ Historique des Tâches Terminées

| Date | ID | Intitulé & Description | Livrables / PR |
| :--- | :--- | :--- | :--- |
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

