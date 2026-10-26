# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche.

**Dernière mise à jour :** 25 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Phase 3 (Stabilisation React 19 & Montée en Puissance Moteur IA)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     🔴 EN COURS         │  │    🟡 SPRINT 1 (ACTIF)  │  │   🟢 SPRINT 2 (SUIVANT) │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-LINT-01        │  │ [ ] TASK-AI-01          │  │ [ ] TASK-DATA-01        │
│     (11 erreurs ESLint) │  │     (Fetch Modernisé)   │  │     (MongoDB Analyses)  │
│                         │  │ [ ] TASK-AI-02          │  │ [ ] TASK-DATA-02        │
│                         │  │     (Cache fetchV2)     │  │     (Webhooks Analyse)  │
│                         │  │ [ ] TASK-AI-03          │  │ [ ] TASK-DATA-03        │
│                         │  │     (Workflow Progress) │  │     (Exports CSV/PDF)   │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif (Priorité Immédiate & Haute)

### 🔴 Qualité & Linter React 19

- [ ] **`TASK-LINT-01` — Résolution des 11 Erreurs ESLint React 19**
  - **Priorité :** 🔴 CRITIQUE (Bloquant pour CI/CD)
  - **Fichiers cibles :**
    - `src/components/theme-toggle.tsx`
    - `src/components/theme-selector.tsx`
    - `src/hooks/use-search-history.ts`
    - `src/hooks/use-temporary-api-keys.ts`
    - `src/components/api-keys/AnalyticsDashboard.tsx`
  - **Description :** Éliminer les violations de `react-hooks/set-state-in-effect` (appels synchrones de setState dans `useEffect`) et réorganiser `saveKeys` avant son utilisation dans `use-temporary-api-keys.ts`.
  - **Critères d'acceptation :**
    - [ ] `npm run lint` s'exécute avec 0 erreur et 0 avertissement.
    - [ ] Aucun flash ou problème d'hydratation côté client.
    - [ ] `npx tsc --noEmit` reste à 0 erreur.

---

### 🟡 Moteur Multi-Agents (Fiabilité & Performance)

- [ ] **`TASK-AI-01` — Modernisation de l'Agent Fetch V1**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/actions/fetch.ts`, `src/app/actions/shared/agent-utils.ts`
  - **Description :** Remplacer le parsing regex artisanal par l'utilitaire éprouvé `parseJSONFromText`. Supprimer tous les fallbacks mockés silencieux (`mock-1`, `mock-2`). Ajouter la validation runtime avec Zod et la gestion des retries avec backoff.
  - **Critères d'acceptation :**
    - [ ] Zéro mock renvoyé en cas d'erreur API ; retour d'un `AgentError` explicite.
    - [ ] Parsing robuste supportant le markdown wrapping (```json).
    - [ ] Validation complète du tableau d'offres via `OfferArraySchema`.

- [ ] **`TASK-AI-02` — Couche de Caching pour `fetchV2.ts`**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/app/actions/fetchV2.ts`, `src/lib/cache.ts` (ou Redis/In-Memory)
  - **Description :** Implémenter un système de cache clé-valeur (clé = hash(domaine + contexte), TTL = 3600s) pour éviter les requêtes API web répétitives.
  - **Critères d'acceptation :**
    - [ ] Les recherches identiques retournent le résultat en cache instantanément (< 50ms).
    - [ ] Métadonnées `cached: true/false` incluses dans `AgentActionResult`.
    - [ ] Réduction mesurable des appels à l'API OpenRouter.

- [ ] **`TASK-AI-03` — Persistance de la Progression du Workflow**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/app/actions/workflow/orchestrator.ts`, `prisma/schema.prisma`
  - **Description :** Implémenter la fonction `getWorkflowProgress(workflowId)` et enregistrer les transitions d'état en base MongoDB (`pending` → `fetching` → `analyzing` → `organizing` → `complete`).
  - **Critères d'acceptation :**
    - [ ] Les étapes et pourcentages sont consultables via ID de workflow.
    - [ ] Support de la reconnexion / polling côté UI sans perte d'état.
    - [ ] Nettoyage automatique des workflows expirés ou terminés.

---

## 📦 Backlog Prochain Sprint (Sprint 2)

### 🟡 Données & Fonctionnalités Avancées

- [ ] **`TASK-DATA-01` — Enregistrement des Analyses en Base de Données**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/app/actions/analyzeV2.ts`, `prisma/schema.prisma`
  - **Description :** Persister les résultats complets d'analyse (`topOffers`, `marketSummary`, scores radar) dans MongoDB associés au compte utilisateur connecté.
  - **Critères d'acceptation :**
    - [ ] Modèle Prisma `AnalysisResult` créé et migré via `prisma db push`.
    - [ ] L'action `analyzeOffersActionV2` sauvegarde les données quand `storeResults: true`.
    - [ ] Route ou action de consultation de l'historique des analyses.

- [ ] **`TASK-DATA-02` — Webhooks de Notification Asynchrones**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/actions/analyzeV2.ts`, `src/lib/webhooks.ts`
  - **Description :** Expédier un payload JSON récapitulatif vers une URL tierce (`webhookUrl`) à l'achèvement d'une analyse longue durée, avec signature de sécurité HMAC.
  - **Critères d'acceptation :**
    - [ ] Retry automatique (3 tentatives avec exponential backoff).
    - [ ] Timeout de 5s pour éviter de bloquer l'action.
    - [ ] Journalisation du statut de délivrance dans `APIKeyUsageLog`.

- [ ] **`TASK-DATA-03` — Modules d'Exportation CSV & PDF**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/actions/organizeV2.ts`, `src/lib/export/`
  - **Description :** Implémenter `convertToCSV(data)` et `preparePDFData(data)` pour exporter les offres filtrées et scorées vers des formats bureautiques.
  - **Critères d'acceptation :**
    - [ ] Export CSV avec en-têtes nettoyés et échappement des caractères spéciaux.
    - [ ] Export PDF avec résumé exécutif, scores et détails des offres.

---

## 🔐 Backlog Sprint 3 : Authentification & Espace Utilisateur

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

## 🎨 Backlog Futur & Améliorations de Confort (Sprint 4+)

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

## ✅ Historique des Tâches Terminées

| Date | ID | Intitulé & Description | Livrables / PR |
| :--- | :--- | :--- | :--- |
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
