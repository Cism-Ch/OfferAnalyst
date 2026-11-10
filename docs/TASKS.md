# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 10 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 52 Achevés & Validés — Score Déterministe 100/100 PASS (0 erreur TS, 0 ESLint warning, Build Next.js 16 validé)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SPRINT 53) │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] Prochain sprint     │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 52 (Supab- │
│     à définir           │  │ [ ] Chrome Store Publish│  │       ase PostgreSQL)   │
│                         │  │ [ ] Export PDF / CSV    │  │     - Sprint 51 (Anti-  │
│                         │  │                         │  │       Leak & BA Dash)   │
│                         │  │                         │  │     - Sprints 1 à 50    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## ⚡ Sprint 52 Achevée : Migration Complète vers Supabase (PostgreSQL), Dépréciation MongoDB & Refonte Prisma ORM

- [x] **`TASK-DB-01` — Migration vers Supabase (PostgreSQL), Dépréciation du Driver MongoDB & Refonte Prisma ORM**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `prisma/schema.prisma`, `src/lib/auth.ts`, `scripts/seed-admin.mjs`, `src/app/actions/db/service-health.ts`, `src/app/actions/db/api-key-analytics.ts`, `src/server/share.ts`, `package.json`, `.agents/skills/db_schema_validator.py`, `.agents/rules/modules/db.md`, `.agents/rules/system_core.md`, `.env.example`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-DB-01.01` : Conversion du schéma Prisma (`prisma/schema.prisma`) vers `provider = "postgresql"` avec `directUrl = env("DIRECT_URL")`, conversion de toutes les clés primaires vers `@id @default(cuid())`, élimination de `@db.ObjectId` et conversion des champs textuels volumineux en `@db.Text`.
    - [x] `TASK-DB-01.02` : Mise à jour de l'adaptateur Better-Auth dans `src/lib/auth.ts` et `scripts/seed-admin.mjs` vers `provider: "postgresql"`.
    - [x] `TASK-DB-01.03` : Refonte de la sonde d'infrastructure dans `src/app/actions/db/service-health.ts` avec la commande PostgreSQL native `prisma.$queryRaw\`SELECT 1\`` et libellé Supabase PostgreSQL.
    - [x] `TASK-DB-01.04` : Généralisation de la validation d'identifiant dans `src/app/actions/db/api-key-analytics.ts` et assainissement des filtres dans `src/server/share.ts`.
    - [x] `TASK-DB-01.05` : Désinstallation du driver `mongodb` dans `package.json` et mise à jour de l'auditeur RSI `.agents/skills/db_schema_validator.py` pour le standard PostgreSQL.
    - [x] `TASK-DB-01.06` : Documentation des variables d'environnement (`DATABASE_URL`, `DIRECT_URL`) et validation déterministe avec `python evals/run_fullstack_eval.py` (100/100 PASS, 0 TS error, 0 ESLint warning, 34/34 pages buildées).

---

## ⚡ Sprint 51 Achevée : Neutralisation Définitive des Fuites de Clés & Intégration Better-Auth Dash

- [x] **`TASK-SEC-02` — Élimination Intégrale des Fuites de Clés & Bouclier Déterministe Anti-Leak**
  - **Priorité :** 🔴 CRITIQUE
  - **Critères d'acceptation :** Mocks synthétiques factices, check bloquant `secret_leak_guard` dans `evals/run_fullstack_eval.py`, règle R-SEC-09 validée.

- [x] **`TASK-AUTH-03` — Intégration du Plugin Better-Auth Dash (`@better-auth/infra`) pour Vérification d'Ownership**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** `@better-auth/infra` installé, plugin `dash()` configuré dans `src/lib/auth.ts`, validation déterministe 100/100 PASS.

---

## ⚡ Sprint 50 Achevée : Déduplication API Quota, Verrou Anti-Concurrence IA & Badge Workspace Responsive

- [x] **`TASK-PERF-01` — Déduplication des Requêtes Quota & Verrou Anti-Concurrence Analyse IA**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** Hook singleton `useDailyQuota`, élimination des `useEffect` redondants, verrouillage strict anti-concurrence dans `AnalysisContext.tsx`.

- [x] **`TASK-UI-WORKSPACE-02` — Badge Workspace Responsive : Mobile 2e ligne avec Wrap & Masquage sur Grand Écran (`lg:hidden`)**
  - **Priorité :** 🟡 MOYENNE
  - **Critères d'acceptation :** Cycle de vie sécurisé avec Skeleton shadcn, responsive wrap sans débordement, déplacement ligne 2 mobile et masquage desktop `lg:hidden`.

---

## ⚡ Sprint 49 Achevée : Intégration Mémoire Artefacts IDE & Cadence des Tests Anti-Saturation

- [x] **`TASK-RSI-03` — Intégration du Suivi par Artefacts IDE & Cadence Déterministe des Tests Anti-Saturation**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** Séparation Mémoire Épisodique vs Procédurale, cadence de tests 3 niveaux dans `system_core.md`, limitation des sorties d'erreur à 10 lignes.

---

## 🧠 Sprint 48 Achevée : Protocole RSI v2 (Mémoire Modulaire Dynamique, Juge Adaptatif & Auditeur MCP/Skills)

- [x] **`TASK-RSI-02` — Refonte du Protocole RSI v2 (Mémoire Modulaire, Juge Adaptatif & Auditeur MCP/Skills)**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** Auditeur de stack `stack_inspector.py`, moteur modulaire `memory_engine.py`, juge déterministe adaptatif `run_fullstack_eval.py`.

---

## 🏢 Sprint 47 Achevée : Badge Workspace Actif (Header & Sidebar) & Modernisation Complète du Changelog (v1.4.5)

- [x] **`TASK-WORKSPACE-01` — Badge Workspace Actif Partout (Header & Sidebar) & Modernisation du Changelog (v1.4.5)**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** Composant `WorkspaceActiveBadge`, intégration Header/Sidebar, refonte moderne timeline shadcn sans emoji sur `/changelog`.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive des Sprints 38 à 46 (TASKS_HISTORY_S38_S46_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S38_S46_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 34 à 37 (TASKS_HISTORY_S34_S36_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S34_S36_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 25 à 33 (TASKS_HISTORY_S25_S33_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S25_S33_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 1 à 24 (TASKS_HISTORY_S10_COMPLETED.md & suivants)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement ~105 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans validation du juge déterministe.
