# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 01 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 38 Achevés & Validés — Score Déterministe 100/100 PASS (0 erreur TS, 0 ESLint warning)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SPRINT 39) │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [-] TASK-HISTORY-01     │  │ [ ] Sprint 40: Safe     │  │     - Sprint 38 (Onboard│
│     (History BYOK/Free, │  │     1-Click Capture Ref │  │       Streamline & Admin│
│      NVIDIA Solo & Mod) │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 37 (Doc)   │
│                         │  │ [ ] Chrome Store Publish│  │     - Sprint 36 (Auth)  │
│                         │  │                         │  │     - Sprint 35 (Vitrine│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🔍 Sprint 39 : Historique (Badge BYOK/Free, Modèle NVIDIA Solo & Grand Affichage Détails)

- [-] **`TASK-HISTORY-01` — Badge BYOK/Free, NVIDIA Modèle Gratuit Unique & Vue Détaillée Agrandie**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `prisma/schema.prisma`, `src/types/index.ts`, `src/app/history/page.tsx`, `src/hooks/use-search-history.ts`, `src/app/actions/db/history.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [ ] `TASK-HISTORY-01.01` : Retrait de tous les modèles gratuits non fonctionnels dans `src/lib/ai-models.ts`, ne conservant que NVIDIA (`nvidia/nemotron-3.5-lightning:free`) comme unique modèle gratuit par défaut.
    - [ ] `TASK-HISTORY-01.02` : Persistance et propagation de l'indicateur clé (`isByok: boolean` ou `keyType: 'byok' | 'free'`) dans les modèles Prisma et types TypeScript d'historique.
    - [ ] `TASK-HISTORY-01.03` : Affichage sur la page `/history` d'un badge distinctif et visible indiquant si chaque recherche a été effectuée en "BYOK" ou "Clé Gratuite / Free Key".
    - [ ] `TASK-HISTORY-01.04` : Intégration d'un modal/dialogue grand format (`max-w-4xl` / `max-w-5xl`) pour afficher confortablement les détails complets de la recherche (offres, scores multi-axes, justifications, critères).
    - [ ] `TASK-HISTORY-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🚀 Sprint 38 Achevée : Refonte Onboarding (Retrait Test Fictif) & Visibilité Admin des Raisons d'Inscription

- [x] **`TASK-ONBOARD-01` — Streamlining Onboarding & Reporting Admin des Motifs d'Inscription**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/onboarding/page.tsx`, `src/app/actions/db/admin.ts`, `src/app/admin/page.tsx`, `src/app/api/profile/onboarding/route.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-ONBOARD-01.01` : Retrait de l'étape de test d'analyse fictive/lente (`FirstSearchStep`) de l'onboarding au profit d'un parcours fluide en 4 étapes claires (Bienvenue, Choix du Domaine & Objectifs, Configuration Clés/BYOK, Prêt à Démarrer).
    - [x] `TASK-ONBOARD-01.02` : Persistance fiable du domaine/motif d'inscription (`useCase`) dans le profil MongoDB de l'utilisateur authentifié et en LocalStorage pour les sessions invité.
    - [x] `TASK-ONBOARD-01.03` : Extension de la Server Action `getRecentUsers` et `getSystemStats` pour inclure les motifs d'inscription (`useCase`) réels issus de la base de données.
    - [x] `TASK-ONBOARD-01.04` : Intégration dans le Dashboard Admin (`/admin`) d'un widget analytique visuel des causes d'inscription et affichage de la colonne "Domaine / Motif" dans la table des utilisateurs récents.
    - [x] `TASK-ONBOARD-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 📖 Sprint 37 Achevée : Actualisation Complète du README & de la Documentation Technique

- [x] **`TASK-DOC-01` — Mise à Jour Exhaustive du README et des Guides Techniques (OFFERAN, Stack pnpm, Admin & Features)**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `README.md`, `docs/FEATURES.md`, `docs/QUICKSTART.md`, `docs/DEPLOYMENT.md`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-DOC-01.01` : Mise à jour du `README.md` principal : refonte de l'en-tête (monogramme OFFERAN, version 1.3.7-patch, Next.js 16.4.3 / React 19 / Better-Auth 1.7.13 / Prisma 6.2.1), commandes 100% `pnpm` (`pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run db:seed-admin`).
    - [x] `TASK-DOC-01.02` : Documentation exhaustive des fonctionnalités modernes dans `README.md` et `docs/FEATURES.md` : Page Vitrine SaaS avec Dock Flottant, Navbar 2 lignes, Hub d'Ingestion Multi-Sources (`/data-source`) avec Bookmarklet 1-Clic, Multi-Tenancy B2B (`/dashboard/workspace`), Alertes & Webhooks HMAC, et Provisioning Admin MongoDB.
    - [x] `TASK-DOC-01.03` : Mise à jour de `docs/QUICKSTART.md` et `docs/DEPLOYMENT.md` pour inclure la configuration des identifiants admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) et l'exécution du script `pnpm run db:seed-admin`.
    - [x] `TASK-DOC-01.04` : Vérification déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🔐 Sprint 36 Achevée : Diagnostic Inscription / Connexion & Initialisation Identifiants Admin DB

- [x] **`TASK-AUTH-02` — Résolution des Échecs d'Inscription/Connexion & Provisioning Admin Sécurisé**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/lib/auth.ts`, `prisma/schema.prisma`, `.env.example`, `scripts/seed-admin.mjs`, `package.json`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-02.01` : Audit et identification de la cause racine de l'échec d'inscription / connexion via Better-Auth (fix `advanced.database.generateId: false` et retrait de l'index unique duplicate `sessions_sessionToken_key`).
    - [x] `TASK-AUTH-02.02` : Configuration et documentation des variables d'environnement admin dans `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.) sans jamais écraser ni faire fuiter de secrets.
    - [x] `TASK-AUTH-02.03` : Script idempotent de seed / provisioning administrateur (`pnpm run db:seed-admin`) pour garantir l'existence du compte admin avec rôle `ADMIN` dans MongoDB.
    - [x] `TASK-AUTH-02.04` : Test et validation fonctionnelle du flux complet d'inscription (`signUp.email`, status 200) et connexion (`signIn.email`, session active avec rôle ADMIN).
    - [x] `TASK-AUTH-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🎨 Sprint 35 Achevée : Remédiation UI/UX — Page Vitrine (Boutons Flottants, Navbar 2L) & Spacing Dashboard Header

- [x] **`TASK-UI-05` — Page Vitrine (Dock Flottant, Navbar 2 Lignes) & Dashboard Navbar (Espacements & Alignements)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/landing/SaaSPresentationView.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/AIModelSelector.tsx`, `src/components/layout/LanguageToggle.tsx`, `src/components/theme-selector.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-UI-05.01` : Page Vitrine : Déportation des sélecteurs de langue et de thème en dock flottant ergonomique (`fixed bottom-5 right-5 z-50`).
    - [x] `TASK-UI-05.02` : Page Vitrine : Structuration de la navbar mobile en 2 lignes distinctes (`h-12` logo + `h-8` CTAs à 50% flex) sans débordement à 320px.
    - [x] `TASK-UI-05.03` : Dashboard Navbar : Rétablissement des règles d'espacement et paddings verticaux (`py-2` et `py-1.5`) pour que les composants ne touchent plus les bords supérieur et inférieur.
    - [x] `TASK-UI-05.04` : Dashboard Navbar : Calibration responsive et alignement aux normes de tous les contrôles (modèle IA, BYOK, quota, thème, langue) sur 320px -> 4K avec mode compact.
    - [x] `TASK-UI-05.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## ⚡ Sprint 34 Achevée : Migration Complète vers `pnpm` Natif pour la Validation & les Tests

- [x] **`TASK-TOOL-01` — Migration Complète de la Suite de Validation et des Tests vers `pnpm` Natif**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `.agents/skills/db_schema_validator.py`, `playwright.config.ts`, `AGENTS.md`, `Agent.md`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-TOOL-01.01` : Mise à jour du juge déterministe `evals/run_fullstack_eval.py` pour exécuter `pnpm exec tsc --noEmit`, `pnpm run lint` et `pnpm run build`.
    - [x] `TASK-TOOL-01.02` : Mise à jour de `.agents/skills/db_schema_validator.py` pour utiliser `pnpm exec prisma validate`.
    - [x] `TASK-TOOL-01.03` : Mise à jour de `playwright.config.ts` (`webServer.command`) pour utiliser `pnpm run start` / `pnpm run dev`.
    - [x] `TASK-TOOL-01.04` : Harmonisation des règles inviolables dans `AGENTS.md` et `Agent.md` pour refléter la stack officielle `pnpm@12.15.0`.
    - [x] `TASK-TOOL-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète des Sprints 25 à 33 (TASKS_HISTORY_S25_S33_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S25_S33_COMPLETED.md)** — Sprints 25 (Vitrine), 26 (Ingestion), 27 (Actions), 28 (Cache), 29 (Capture), 30 (Alertes), 31 (Tenancy), 32 (Navbar), 33 (OFFERAN & Drawer).
- 👉 **[Consulter l'Archive Complète du Sprint 23 (TASKS_HISTORY_S23_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S23_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 22 (TASKS_HISTORY_S22_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S22_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 21 (TASKS_HISTORY_S21_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S21_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 20 (TASKS_HISTORY_S20_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S20_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 19 (TASKS_HISTORY_S19_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S19_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 18 (TASKS_HISTORY_S18_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S18_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 17 (TASKS_HISTORY_S17_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S17_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 16 (TASKS_HISTORY_S16_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S16_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 15 (TASKS_HISTORY_S15_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S15_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 14 (TASKS_HISTORY_S14_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S14_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 13 (TASKS_HISTORY_S13_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S13_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 12 (TASKS_HISTORY_S12_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S12_COMPLETED.md)**
- 👉 **[Consulter l'Archive Complète du Sprint 11 (TASKS_HISTORY_S11_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S11_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 1 à 10 (TASKS_HISTORY_S10_COMPLETED.md & antérieurs)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement 132 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `pnpm exec tsc --noEmit` et `pnpm run lint` à 0 erreur.
