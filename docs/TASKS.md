# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 21 Achevé & Validé (Auth & Clavier Virtuel, Landing & Typographie Fluide, Onboarding Sans Débordement, Dialogs Bottom-Sheet Native & Cookie Consent Adaptatif, Playwright Responsive 102/102 PASS, 100/100 PASS) — Sprints 1 à 21 Archivés | Sprint 22 Ouvert

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 22 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-MOT-01 (Z-index│  │ [ ] V1.0 Release        │  │     - Sprint 21 (4)     │
│ [ ] TASK-MOT-02 (Motion)│  │     Production Launch   │  │     - Sprint 20 (4)     │
│ [ ] TASK-MOT-03 (CLS)   │  │                         │  │     - Sprint 19 (4)     │
│ [ ] TASK-VAL-09 (Audit) │  │                         │  │     - Sprints 1-18 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 22 — Fluidité, Z-index Unifié, Micro-animations, CLS & Audit Final

- [ ] **`TASK-MOT-01` — Échelle Unifiée de Z-Index & Empilement**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/globals.css`, `src/components/layout/AppShell.tsx`, `src/components/ui/dialog.tsx`, `src/components/CookieConsent.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-MOT-01.01` : Échelle de tokens standardisée (`--z-header: 30`, `--z-drawer: 50`, `--z-dialog: 60`, `--z-toast: 70`) éliminant les `z-*` disparates.
    - [ ] `TASK-MOT-01.02` : Résolution des conflits d'empilement entre CookieConsent, dialogues, filtres et drawer mobile.

- [ ] **`TASK-MOT-02` — Micro-animations Fluides & Prefers-Reduced-Motion**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/lib/motion.ts`, `src/app/globals.css`, composants interactifs
  - **Critères d'acceptation :**
    - [ ] `TASK-MOT-02.01` : Prise en compte globale de `prefers-reduced-motion: reduce` sur toutes les animations Framer Motion.
    - [ ] `TASK-MOT-02.02` : Remplacement des transitions lourdes sur `width` par `transform` et `opacity` matérielles.

- [ ] **`TASK-MOT-03` — CLS, Optimisation du Scroll & Sizing Stricte**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/components/ui/skeleton.tsx`, `src/app/analysis/page.tsx`, `src/app/globals.css`
  - **Critères d'acceptation :**
    - [ ] `TASK-MOT-03.01` : Skeletons à géométrie conforme au contenu final pour un CLS < 0.05.
    - [ ] `TASK-MOT-03.02` : Défilement doux adaptatif et `scroll-padding-top` synchronisé avec la hauteur du header.

- [ ] **`TASK-VAL-09` — Validation Finale Déterministe & Rapport d'Audit**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `tests/e2e/responsive.spec.ts`, `docs/archive/reports/`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-09.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript strict, 0 warning ESLint).
    - [ ] `TASK-VAL-09.02` : Suite de non-régression E2E Playwright Responsive 100/100 PASS sur les 5 viewports canoniques.
    - [ ] `TASK-VAL-09.03` : Production du rapport final de clôture responsive dans `docs/archive/reports/`.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 21 (TASKS_HISTORY_S21_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S21_COMPLETED.md)** — 4 Lots (Auth & Clavier Virtuel, Landing text-fluid-hero, Onboarding sans overflow, Dialogs Bottom-sheet mobile, Playwright Responsive 102/102 PASS, 100/100 PASS).
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
