# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 01 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 35 Achevés & Validés — Score Déterministe 100/100 PASS (0 erreur TS, 0 ESLint warning)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SPRINT 36) │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [-] TASK-AUTH-02        │  │ [ ] Chrome Store Publish│  │     - Sprint 35 (Vitrine│
│     (Inscription, Login │  │ [ ] Advanced Billing    │  │       Dock & Spacing)   │
│      & Admin Seed DB)   │  │ [ ] E2E Playwright Auth │  │     - Sprint 34 (Pnpm)  │
│                         │  │                         │  │     - Sprints 25-33 Arch│
│                         │  │                         │  │     - Sprints 1-24 Arch │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🔐 Sprint 36 : Diagnostic Inscription / Connexion & Initialisation Identifiants Admin DB

- [-] **`TASK-AUTH-02` — Résolution des Échecs d'Inscription/Connexion & Provisioning Admin Sécurisé**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/lib/auth.ts`, `prisma/schema.prisma`, `.env`, `scripts/seed-admin.ts`, `src/app/actions/db/auth-admin.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [ ] `TASK-AUTH-02.01` : Audit et identification de la cause racine de l'échec d'inscription / connexion via Better-Auth (validation schéma MongoDB, hashing, endpoints).
    - [ ] `TASK-AUTH-02.02` : Configuration et documentation des variables d'environnement admin dans `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.) sans jamais écraser ni faire fuiter de secrets.
    - [ ] `TASK-AUTH-02.03` : Script idempotent de seed / provisioning administrateur (`pnpm run db:seed-admin`) pour garantir l'existence du compte admin avec rôle `ADMIN` dans MongoDB.
    - [ ] `TASK-AUTH-02.04` : Test et validation fonctionnelle du flux complet d'inscription (`signUp.email`) et connexion (`signIn.email`).
    - [ ] `TASK-AUTH-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

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

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement 108 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `pnpm exec tsc --noEmit` et `pnpm run lint` à 0 erreur.
