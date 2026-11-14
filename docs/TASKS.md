# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 13 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 58 En Cours — Cohérence Avancée API Tavily + OpenRouter (`TASK-AGT-02`)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SP 58)     │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [-] TASK-AGT-02         │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 56 (Maint) │
│     (Cohérence Tavily + │  │ [ ] Chrome Store Publish│  │     - Sprint 55 (Agents)│
│      Intention Métier)  │  │ [ ] Export PDF / CSV    │  │     - Sprint 54 (Secur) │
│ [-] TASK-UI-01          │  │                         │  │     - Sprint 53 (RSI v3 │
│     (Carte @mapcn/map)  │  │                         │  │       Observabilité)    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## Active Sprint 58: Cohérence Avancée API Tavily + OpenRouter (Emploi, Gros, Immo, Freelance)

- [-] **`TASK-AGT-02` - Moteur d'Intention Métier, Cache Tavily, Enrichissement URL & Rebond UX International** *(bloqué en clôture uniquement par `security_audit` sur `README.md:146-197` non-ASCII)*
  - **Priority:** CRITICAL
  - **Target files:** `src/lib/search-intent.ts`, `src/lib/geo.ts`, `src/lib/tavily.ts`, `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`, `src/app/actions/offers/generate-action-content.ts`, `src/app/search-context/page.tsx`, `src/contexts/AnalysisContext.tsx`, `src/components/offers/ProviderErrorPanel.tsx`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-AGT-02.01`: Créer `src/lib/search-intent.ts` (`classifyOfferIntent`, `detectQueryLanguage`, `buildTavilyFetchQuery`, `buildTavilyBenchmarkQuery`) et compléter `tavilyLanguage` dans `src/lib/geo.ts`.
    - [x] `TASK-AGT-02.02`: Ajouter le cache Upstash Redis dans `searchWebOffers` (`src/lib/tavily.ts`), `chunksPerSource: 3`, `excludeDomains` optionnel, et langue pilotée par la requête.
    - [x] `TASK-AGT-02.03`: Aligner `fetchOffersAction`, `analyzeOffersAction` et `generateOfferActionContentAction` sur l'intention détectée + enrichissement sélectif `extractUrlsContent` sur snippets courts.
    - [x] `TASK-AGT-02.04`: Ajouter le preset **Commerce de Gros / Sourcing** (`src/app/search-context/page.tsx`) et le rebond 1-clic vers `🌍 International` sur `EMPTY_OFFERS` (`AnalysisContext.tsx` + `ProviderErrorPanel.tsx`).
    - [x] `TASK-AGT-02.05`: Valider `tsc --noEmit`, `pnpm run lint`, `pnpm run build` et tests unitaires d'intention.

---

## Active Sprint 57: Carte du Monde Interactive `@mapcn/map` (MapLibre GL)

- [-] **`TASK-UI-01` - Remplacement de la carte SVG manuelle par le composant shadcn `@mapcn/map` (MapLibre GL)**
  - **Priority:** MEDIUM
  - **Target files:** `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `src/components/ui/map.tsx`, `src/components/admin/UserWorldMapCard.tsx`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-UI-01.01`: Installer `@mapcn/map` via `pnpm dlx shadcn@latest add @mapcn/map` (`maplibre-gl` + `src/components/ui/map.tsx`).
    - [x] `TASK-UI-01.02`: Adapter la CSP dans `next.config.ts` pour autoriser les Web Workers MapLibre GL (`worker-src 'self' blob: https://unpkg.com;`).
    - [x] `TASK-UI-01.03`: Refondre `src/components/admin/UserWorldMapCard.tsx` avec `<Map>`, `<MapControls>`, `<MapMarker>`, `<MarkerContent>`, `<MarkerTooltip>` et `<MarkerPopup>`.
    - [ ] `TASK-UI-01.04`: Valider `typecheck`, `lint`, `prod_build` via `python evals/run_fullstack_eval.py` (bloqué par `security_audit` sur `README.md` non-ASCII).

---

## ⚡ Sprint 56 Achevé : Modernisation des Dépendances, Abandon `bcryptjs`, Prisma 7 (Supabase) & TypeScript

- [x] **`TASK-MAINT-01` - Suppression totale de `bcryptjs`, Migration Prisma `7.10.1` (`@prisma/adapter-pg`), TypeScript `6.0.3` & Dépendances Stables**
  - **Priority:** HIGH
  - **Target files:** `package.json`, `pnpm-lock.yaml`, `prisma.config.ts`, `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/lib/platform-config.ts`, `src/lib/platform-config-shared.ts`, `src/lib/api-key-manager.ts`, `src/app/actions/db/profile.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/help/page.tsx`, `src/app/admin/page.tsx`, `scripts/seed-admin.mjs`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-MAINT-01.01`: Supprimer `bcryptjs` et `@types/bcryptjs` ; migrer le hachage vers `crypto.scrypt` / `better-auth/crypto` et mettre à jour `src/app/help/page.tsx`.
    - [x] `TASK-MAINT-01.02`: Migrer Prisma `6.2.1` → `7.10.1` avec `prisma.config.ts`, `@prisma/adapter-pg` + `pg`, `src/lib/prisma.ts` et `scripts/seed-admin.mjs` (compatible Supabase Pooler).
    - [x] `TASK-MAINT-01.03`: Mettre à jour les paquets mineurs/patch (`next@16.4.6`, `better-auth@1.7.22`, SDKs, Tailwind, UI) et valider `typescript@6.0.3` (TS `7.0.2` bloqué par `typescript-eslint@8.72.0`).
    - [x] `TASK-MAINT-01.04`: Vérifier `prisma validate`, `prisma generate`, `prisma db push`, `db_schema_validator.py` et `pnpm run build`.
    - [x] `TASK-MAINT-01.05`: Valider 100/100 PASS via `python evals/run_fullstack_eval.py`.

---

## ⚡ Sprint 55 Achevé : Agents v2 (Tavily Search/Extract, Géolocalisation, Quota Dynamique & Carte Mondiale Admin)

- [x] **`TASK-AGT-01` - Architecture Agent v2 (Tavily Search/Extract, Géolocalisation, Quota Dynamique, FinOps & Carte Mondiale Admin)**
  - **Priority:** CRITICAL
  - **Target files:** `package.json`, `pnpm-lock.yaml`, `.env.example`, `prisma/schema.prisma`, `src/types/index.ts`, `src/lib/**`, `src/app/api/**`, `src/app/actions/**`, `src/contexts/**`, `src/hooks/**`, `src/components/**`, `src/app/**`, `docs/TASKS.md`
  - **Acceptance criteria:**
    - [x] `TASK-AGT-01.01`: Installer `@tavily/core` + Tavily Agent Skills, documenter `.env.example` et synchroniser `prisma/schema.prisma` (`Profile.country`, `SearchHistory.country`, `SystemConfig`).
    - [x] `TASK-AGT-01.02`: Implémenter la géolocalisation RGPD (`src/lib/geo.ts`, `/api/geo/detect`), le cache distribué Upstash Redis (`src/lib/cache.ts`) et le client Tavily multi-clés avec failover & Anti-SSRF (`src/lib/tavily.ts`).
    - [x] `TASK-AGT-01.03`: Refondre `fetchOffersAction`, `analyzeOffersAction` (`searchSources` + benchmark marché localisé), `structureRawOffersAction` (extraction URL) et `generateOfferActionContentAction` (adapté à la nature réelle de l'offre).
    - [x] `TASK-AGT-01.04`: Implémenter le quota Free Tier dynamique (5/j par défaut, bannière UI, BYOK Tavily), le onboarding/sélecteur pays + International, le suivi FinOps User & Admin, et la carte du monde interactive RGPD (`UserWorldMapCard`).
    - [x] `TASK-AGT-01.05`: Valider le build et l'intégrité via `pnpm exec prisma generate` et `python evals/run_fullstack_eval.py` (100/100 PASS).

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
