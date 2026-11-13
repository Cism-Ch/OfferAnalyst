# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 13 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 54 Achevé (Audit & Renforcement Sécurité) — Prêt pour Sprint 55

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SP 55)     │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ (Prêt pour prochain sp) │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 54 (Secur) │
│                         │  │ [ ] Chrome Store Publish│  │     - Sprint 53 (RSI v3 │
│                         │  │ [ ] Export PDF / CSV    │  │       Observabilité)    │
│                         │  │                         │  │     - Sprint 52 (Supab) │
│                         │  │                         │  │     - Sprints 1 à 51    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## ⚡ Sprint 54 Achevé : Audit de Sécurité & Renforcement Identité / Accès (Better-Auth, APIs, Headers & RLS)

- [x] **`TASK-SEC-03` - Audit Complet de Sécurité & Renforcement Identité / Accès**
  - **Priority:** CRITICAL
  - **Target files:** `src/lib/auth.ts`, `src/lib/webhooks.ts`, `src/app/api/**`, `src/app/actions/**`, `next.config.*`, `evals/security_audit.py`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-SEC-03.01`: Auditer Better-Auth (`src/lib/auth.ts`), cookies (`HttpOnly`, `SameSite`, `Secure`), `trustedOrigins`, Open Redirects et synchronisation schéma PostgreSQL.
    - [x] `TASK-SEC-03.02`: Auditer toutes les routes API (`/api/*`) et Server Actions (`actions/*`) : suppression de fuite d'énumération (`resend-verification`), ajout Rate Limiting (`verify-email`, `onboarding`), compatibilité CUID (`export/route.ts`).
    - [x] `TASK-SEC-03.03`: Auditer les en-têtes HTTP (CSP, HSTS, X-Frame-Options), renforcement Anti-SSRF IPv6 (`webhooks.ts`) et audit des dépendances (`pnpm audit`).
    - [x] `TASK-SEC-03.04`: Valider l'ensemble des correctifs avec le juge déterministe complet `python evals/run_fullstack_eval.py` (100/100 PASS).

---

## ⚡ Sprint 53 Achevée : Initialisation & Déploiement du Protocole RSI v3 (Observabilité Cognitive, Scope Guard & SemVer)

- [x] **`TASK-RSI-04` - Initialisation du Protocole RSI v3, Observabilité Cognitive & Scope Guard**
  - **Priority:** HIGH
  - **Target files:** `evals/*`, `evals/**/*`, `.agents/*`, `.agents/**/*`, `.gitignore`, `AGENTS.md`, `VERSION`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-RSI-04.01`: Intégration du cockpit 1-commande `python evals/rsi_orchestrator.py --pulse` et des gardes d'intégrité `--guardrail` et `--scope`.
    - [x] `TASK-RSI-04.02`: Optimisation de `evals/security_audit.py` avec `os.walk` et exclusion des faux positifs sur `.env` et placeholders de doc.
    - [x] `TASK-RSI-04.03`: Mise en place de l'observabilité cognitive automatique via `evals/telemetry_hook.py` vers `.agents/telemetry/cognitive_state.json`.
    - [x] `TASK-RSI-04.04`: Validation déterministe avec `python evals/run_fullstack_eval.py --quick` (100/100 PASS, 0 TS error, 0 lint warning, security_audit PASSED).

---

## ⚡ Sprint 52 Achevée : Migration Complète vers Supabase (PostgreSQL), Dépréciation MongoDB & Refonte Prisma ORM

- [x] **`TASK-DB-01` — Migration vers Supabase (PostgreSQL), Dépréciation du Driver MongoDB & Refonte Prisma ORM**
  - **Priorité :** 🔴 CRITIQUE
  - **Critères d'acceptation :** Conversion Prisma PostgreSQL CUID, adaptateur Better-Auth PostgreSQL, sonde `SELECT 1`, validation 100/100 PASS.

---

## ⚡ Sprint 51 Achevée : Neutralisation Définitive des Fuites de Clés & Intégration Better-Auth Dash

- [x] **`TASK-SEC-02` — Élimination Intégrale des Fuites de Clés & Bouclier Déterministe Anti-Leak**
  - **Priorité :** 🔴 CRITIQUE
  - **Critères d'acceptation :** Mocks synthétiques factices, check bloquant `secret_leak_guard` dans `evals/run_fullstack_eval.py`, règle R-SEC-09 validée.

---

## ⚡ Sprint 50 Achevée : Déduplication API Quota, Verrou Anti-Concurrence IA & Badge Workspace Responsive

- [x] **`TASK-PERF-01` — Déduplication des Requêtes Quota & Verrou Anti-Concurrence Analyse IA**
  - **Priorité :** 🔴 HAUTE
  - **Critères d'acceptation :** Hook singleton `useDailyQuota`, élimination des `useEffect` redondants, verrouillage strict anti-concurrence dans `AnalysisContext.tsx`.

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

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement ~100 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans validation du juge déterministe.
