# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 20 Achevé & Validé (ResponsiveTable, Refonte /admin, Navigation Settings & Clés API fluides, Recharts calibrés R-UI-07, Flex-wrap History/Projects, Playwright Responsive 76/76 PASS, 100/100 PASS) — Sprints 1 à 20 Archivés | Sprint 21 Ouvert

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 21 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-OVL-01 (Auth)  │  │ [ ] SPRINT 22           │  │     - Sprint 20 (4)     │
│ [ ] TASK-OVL-02 (Landing│  │     (Fluidité, Motion,  │  │     - Sprint 19 (4)     │
│ [ ] TASK-OVL-03 (Overly)│  │      CLS, Audit Final)  │  │     - Sprint 18 (3)     │
│ [ ] TASK-VAL-08 (Eval)  │  │                         │  │     - Sprints 1-17 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 21 — Auth, Landing, Onboarding, Dialogs & Bottom-sheets

- [ ] **`TASK-OVL-01` — Formulaires Auth & Clavier Virtuel Adaptatif**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/reset/page.tsx`, `src/app/auth/verify/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-OVL-01.01` : Cartes auth bornées `w-full max-w-md` avec `p-4 sm:p-6` et `min-h-app`.
    - [ ] `TASK-OVL-01.02` : Boutons OAuth en `grid-cols-1 min-[400px]:grid-cols-2` évitant le débordement à 320px.
    - [ ] `TASK-OVL-01.03` : Attributs `autoComplete`, `inputMode` et `enterKeyHint` corrects pour ergonomie mobile et clavier virtuel.

- [ ] **`TASK-OVL-02` — Landing Page Fluide & Typographie Adaptative**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/app/landing/page.tsx`, `src/app/page.tsx`, `src/app/onboarding/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-OVL-02.01` : Typographie hero fluide (`text-fluid-hero`) et rythme vertical `--spacing-section`.
    - [ ] `TASK-OVL-02.02` : Images de présentation avec `sizes` et `aspect-*` explicites pour éliminer tout CLS.
    - [ ] `TASK-OVL-02.03` : Assistant onboarding avec étapes empilées sous `md` et barre de progression compacte.

- [ ] **`TASK-OVL-03` — Dialogs, Bottom-sheets & Cookie Consent Mobile**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/ui/dialog.tsx`, `src/components/api-keys/AddAPIKeyDialog.tsx`, `src/components/api-keys/GuestApiKeyDialog.tsx`, `src/components/layout/AIModelSelector.tsx`, `src/components/layout/CookieConsent.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-OVL-03.01` : Variante bottom-sheet mobile dans `ui/dialog.tsx` (`max-h-[calc(100dvh-1rem)]`, `pb-safe`, coins arrondis supérieurs).
    - [ ] `TASK-OVL-03.02` : Application aux dialogues de clés API et sélecteur de modèle IA évitant le masquage par le clavier virtuel.
    - [ ] `TASK-OVL-03.03` : Bandeau `CookieConsent` adaptatif ne masquant pas les actions critiques sur smartphone.

- [ ] **`TASK-VAL-08` — Validation Déterministe & Non-Régression Globale**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `tests/e2e/responsive.spec.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-08.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript strict, 0 warning ESLint).
    - [ ] `TASK-VAL-08.02` : Validation de non-régression de la suite E2E Playwright Responsive sur les 5 viewports canoniques.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 20 (TASKS_HISTORY_S20_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S20_COMPLETED.md)** — 4 Lots (ResponsiveTable, Refonte /admin, Navigation Settings & Clés API fluides, Recharts calibrés R-UI-07, Flex-wrap History/Projects, Playwright Responsive 76/76 PASS, 100/100 PASS).
- 👉 **[Consulter l'Archive Complète du Sprint 19 (TASKS_HISTORY_S19_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S19_COMPLETED.md)** — 4 Lots (Container Queries OfferCard, Bottom-sheet fluide, Snap-x Compare, PageContainer unifié, Playwright Responsive 66/66 PASS, 100/100 PASS).
- 👉 **[Consulter l'Archive Complète du Sprint 18 (TASKS_HISTORY_S18_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S18_COMPLETED.md)** — 3 Lots (AppShell unifié, Radix Sheet Drawer, Header compact 56px, Playwright Responsive 51/51 PASS, next build 35/35, 100/100 PASS).
- 👉 **[Consulter l'Archive Complète du Sprint 17 (TASKS_HISTORY_S17_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S17_COMPLETED.md)** — 3 Lots (Fondations Viewport & Tokens dvh, Cibles tactiles 44px & Ergonomie Mobile, Playwright Responsive 47/47 PASS, 100/100 PASS).
- 👉 **[Consulter l'Archive Complète du Sprint 16 (TASKS_HISTORY_S16_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S16_COMPLETED.md)** — 4 Lots (E2E Playwright 9/9 PASS, Télémétrie IA & Web Vitals, Fix Next.js 16 Server Actions, 100/100 PASS).
- 👉 **[Consulter l'Archive Complète du Sprint 15 (TASKS_HISTORY_S15_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S15_COMPLETED.md)** — 9 Lots (Better-Auth M1-M4, Quotas 24h, Double Historique, Ops pnpm, Export PDF/CSV & Partage Public).
- 👉 **[Consulter l'Archive Complète du Sprint 14 (TASKS_HISTORY_S14_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S14_COMPLETED.md)** — 4 Lots Multi-Domaines (Sécurité Auth & Anti-IDOR, Continuité Guest User & BYOK, UX/UI Bilingue FR/EN & Sign Out, Méta-Optimisation RSI).
- 👉 **[Consulter l'Archive Complète du Sprint 13 (TASKS_HISTORY_S13_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S13_COMPLETED.md)** — 5 tâches (Bilinguisme Exhaustif FR/EN 100%).
- 👉 **[Consulter l'Archive Complète du Sprint 12 (TASKS_HISTORY_S12_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S12_COMPLETED.md)** — 4 tâches (Modal Détaillé Plein Écran, Redesign Lumineux OfferCard).
- 👉 **[Consulter l'Archive Complète du Sprint 11 (TASKS_HISTORY_S11_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S11_COMPLETED.md)** — 5 tâches (Résolution Erreur Validation Fetch, Better-Auth 503 Fix).
- 👉 **[Consulter l'Archive des Sprints 1 à 10 (TASKS_HISTORY_S10_COMPLETED.md & antérieurs)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**
- 👉 **[Dernier Rapport d'Audit Multi-Domaines (AUDIT_AUTH_GUEST_QUALITY_SPRINT_14.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_AUTH_GUEST_QUALITY_SPRINT_14.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement 88 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
