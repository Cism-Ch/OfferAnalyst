# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 03 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 41 Achevés & Validés — Score Déterministe 100/100 PASS (0 erreur TS, 0 ESLint warning)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS             │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] Tous Sprints Validés│  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 41 (Modèles│
│     Prêt pour nouveau   │  │ [ ] Chrome Store Publish│  │       2/struct, Offline)│
│     jalon / sprint      │  │ [ ] Export PDF / CSV    │  │     - Sprint 40 (Safe   │
│                         │  │                         │  │       1-Click Bookmarklet│
│                         │  │                         │  │     - Sprints 1 à 39    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🤖 Sprint 41 Achevée : Modèles IA Modernisés (2 par Structure), Détection Hors-Ligne Admin/Sélecteur, Espacements UI & Modèle sur Recherche

- [x] **`TASK-MODEL-02` — Modernisation Modèles IA (2/Structure, GPT-6.1/o3/4o, Nemotron), Détection Offline, Calibrage UI & Affichage Modèle Utilisé**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `src/app/actions/models.ts`, `src/app/actions/analyze.ts`, `src/components/layout/AIModelSelector.tsx`, `src/app/admin/page.tsx`, `src/components/offers/ResultsSection.tsx`, `src/app/history/page.tsx`, `src/types/index.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-MODEL-02.01` : Structuration stricte des modèles IA dans `src/lib/ai-models.ts` : 2 modèles par provider (NVIDIA : Nemotron 3.5 Lightning & Nemotron 3 Ultra 550B, pas de Gemma ; OpenAI : GPT-6.1 Terra, o3, GPT-4o ; Anthropic : Claude 5.5 Sonnet & Haiku ; DeepSeek : V3 & R1-0528 ; Google : Gemini 3.8 Flash & 2.5 Pro ; Mistral : Large & Small).
    - [x] `TASK-MODEL-02.02` : Service de détection en temps réel de disponibilité / statut hors-ligne des modèles via l'API OpenRouter avec cache résilient (`src/app/actions/models.ts`).
    - [x] `TASK-MODEL-02.03` : Signalisation visuelle des modèles hors-ligne / indisponibles dans l'interface de sélection (`AIModelSelector`) et dans le tableau de bord Admin (`/admin`).
    - [x] `TASK-MODEL-02.04` : Correction des espacements du footer de `AIModelSelector` et augmentation des marges horizontales des cartes de sélection (`px-4 sm:px-5 sm:py-4`).
    - [x] `TASK-MODEL-02.05` : Affichage proéminent et systématique du modèle d'IA utilisé sur les résultats de recherche (`ResultsSection`) et sur l'historique (`/history`).
    - [x] `TASK-MODEL-02.06` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🛡️ Sprint 40 Achevée : Sécurisation Native & Fiabilisation du Bookmarklet de Capture 1-Clic

- [x] **`TASK-CAPTURE-02` — Sécurisation Native du Bookmarklet 1-Clic (Bypass React 19 Sanitizer & Zero-Leak)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/data-source/CaptureAssistantModal.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-CAPTURE-02.01` : Élimination du blocage React 19 sur `javascript:` URLs via rattachement dynamique par ref native DOM (`bookmarkletAnchorRef.current.setAttribute('href', bookmarkletCode)`).
    - [x] `TASK-CAPTURE-02.02` : Support complet du Drag & Drop vers la barre de favoris du navigateur avec `dataTransfer.setData('text/uri-list', ...)` et `dataTransfer.setData('text/plain', ...)`.
    - [x] `TASK-CAPTURE-02.03` : Sécurité stricte du code bookmarklet : exécution purement locale dans le navigateur du client, extraction ciblée des annonces sans cookies ni transmission distante de tokens.
    - [x] `TASK-CAPTURE-02.04` : Notification toast guidance au clic direct pour assister l'utilisateur à glisser le bouton dans ses favoris (raccourci Ctrl+Shift+B).
    - [x] `TASK-CAPTURE-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🔍 Sprint 39 Achevée : Historique (Badge BYOK/Free, Modèle NVIDIA Solo & Grand Affichage Détails)

- [x] **`TASK-HISTORY-01` — Badge BYOK/Free, NVIDIA Modèle Gratuit Unique & Vue Détaillée Agrandie**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `prisma/schema.prisma`, `src/types/index.ts`, `src/app/history/page.tsx`, `src/hooks/use-search-history.ts`, `src/app/actions/db/history.ts`, `src/contexts/AnalysisContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-HISTORY-01.01` : Retrait de tous les modèles gratuits non fonctionnels dans `src/lib/ai-models.ts`, ne conservant que NVIDIA (`nvidia/nemotron-3.5-lightning:free`) comme unique modèle gratuit par défaut.
    - [x] `TASK-HISTORY-01.02` : Persistance et propagation de l'indicateur clé (`isByok: boolean`, `keyType: 'byok' | 'free'`) dans les modèles Prisma, types TypeScript et actions MongoDB Atlas.
    - [x] `TASK-HISTORY-01.03` : Affichage sur chaque carte `/history` d'un badge distinctif et visible indiquant si la recherche a été effectuée en "BYOK" ou "Free Key".
    - [x] `TASK-HISTORY-01.04` : Intégration d'un modal/dialogue grand format (`max-w-4xl max-h-[85vh]`) pour afficher confortablement les détails complets de la recherche (critères, contexte, synthèse marché, offres, scores multi-axes, justifications).
    - [x] `TASK-HISTORY-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🚀 Sprint 38 Achevée : Refonte Onboarding (Retrait Test Fictif) & Visibilité Admin des Raisons d'Inscription

- [x] **`TASK-ONBOARD-01` — Streamlining Onboarding & Reporting Admin des Motifs d'Inscription**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/onboarding/page.tsx`, `src/app/actions/db/admin.ts`, `src/app/admin/page.tsx`, `src/app/api/profile/onboarding/route.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-ONBOARD-01.01` : Retrait de l'étape de test d'analyse fictive/lente (`FirstSearchStep`) de l'onboarding au profit d'un parcours fluide en 4 étapes claires.
    - [x] `TASK-ONBOARD-01.02` : Persistance fiable du motif d'inscription (`useCase`) dans le profil MongoDB de l'utilisateur authentifié et en LocalStorage pour les sessions invité.
    - [x] `TASK-ONBOARD-01.03` : Extension de la Server Action `getRecentUsers` et `getSystemStats` pour inclure les motifs d'inscription (`useCase`) réels issus de la base de données.
    - [x] `TASK-ONBOARD-01.04` : Intégration dans le Dashboard Admin (`/admin`) d'un widget analytique visuel des causes d'inscription et affichage de la colonne "Domaine / Motif" dans la table des utilisateurs récents.
    - [x] `TASK-ONBOARD-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 📖 Sprint 37 Achevée : Actualisation Complète du README & de la Documentation Technique

- [x] **`TASK-DOC-01` — Mise à Jour Exhaustive du README et des Guides Techniques (OFFERAN, Stack pnpm, Admin & Features)**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `README.md`, `docs/FEATURES.md`, `docs/QUICKSTART.md`, `docs/DEPLOYMENT.md`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-DOC-01.01` : Refonte README (monogramme OFFERAN, v1.4.0, Next.js 16.4.3 / React 19 / Better-Auth 1.7.13 / Prisma 6.2.1, commandes 100% `pnpm`).
    - [x] `TASK-DOC-01.02` : Documentation exhaustive des fonctionnalités modernes : Dock Flottant, Navbar 2L, Hub `/data-source` Bookmarklet 1-Clic, Multi-Tenancy B2B, Alertes & Webhooks.
    - [x] `TASK-DOC-01.03` : Mise à jour de `docs/QUICKSTART.md` et `docs/DEPLOYMENT.md` pour inclure la configuration admin et `pnpm run db:seed-admin`.
    - [x] `TASK-DOC-01.04` : Vérification déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive des Sprints 34 à 36 (TASKS_HISTORY_S34_S36_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S34_S36_COMPLETED.md)** — Sprints 34 (`pnpm`), 35 (Vitrine & Spacing Navbar), 36 (Auth MongoDB & Seed Admin).
- 👉 **[Consulter l'Archive des Sprints 25 à 33 (TASKS_HISTORY_S25_S33_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S25_S33_COMPLETED.md)** — Sprints 25 à 33.
- 👉 **[Consulter l'Archive des Sprints 1 à 24 (TASKS_HISTORY_S10_COMPLETED.md & suivants)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement ~120 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `pnpm exec tsc --noEmit` et `pnpm run lint` à 0 erreur.
