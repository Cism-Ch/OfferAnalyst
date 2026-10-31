# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 18 Achevé & Validé (AppShell unifié, Radix Sheet Drawer, Header compact 56px, Playwright Responsive 51/51 PASS, next build 35/35, 100/100 PASS) — Sprints 1 à 18 Archivés | Sprint 19 Ouvert

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 19 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-MAI-01 (Cards) │  │ [ ] SPRINTS 20-22       │  │     - Sprint 18 (3)     │
│ [ ] TASK-MAI-02 (Charts)│  │     (Pages denses,      │  │     - Sprint 17 (3)     │
│ [ ] TASK-MAI-03 (Layout)│  │      Auth, Polish)      │  │     - Sprint 16 (4)     │
│ [ ] TASK-VAL-06 (Eval)  │  │                         │  │     - Sprints 1-15 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 19 — Parcours Principal (`/`, `/search-context`, `/data-source`, `/analysis`, `/compare`, `/saved`)

- [ ] **`TASK-MAI-01` — Container Queries sur OfferCard & Disposition Compacte / Étendue**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/offers/OfferCard.tsx`, `src/components/analysis/ResultsSection.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-MAI-01.01` : Configuration de conteneurs `@container` sur la colonne des résultats pour adapter les cartes d'offres à leur largeur propre et non au viewport global.
    - [ ] `TASK-MAI-01.02` : Variante compacte sous 400px de conteneur (empilement vertical propre des métadonnées, scores et actions) et variante étendue au-delà.

- [ ] **`TASK-MAI-02` — Empilement Responsive & Refonte ScoreChart sur Analysis**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/analysis/page.tsx`, `src/components/analysis/ScoreChart.tsx`, `src/components/offers/OfferDetailModal.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-MAI-02.01` : Grille 12 colonnes avec sticky seulement sur `lg+`, empilement naturel sous `lg` sans blocage de scroll.
    - [ ] `TASK-MAI-02.02` : `ScoreChart` calibré en ratio fluide `aspect-[16/10] max-h-64` avec ticks tronqués et minTickGap anti-chevauchement.
    - [ ] `TASK-MAI-02.03` : `OfferDetailModal` optimisé en bottom-sheet plein écran sous 640px avec pied d'actions `pb-safe`.

- [ ] **`TASK-MAI-03` — Snap Columns Compare & Harmonisation PageContainer**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/app/compare/page.tsx`, `src/app/saved/page.tsx`, `src/app/search-context/page.tsx`, `src/app/data-source/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-MAI-03.01` : Retrait du `min-h-screen` imbriqué dans `compare/page.tsx`, disposition `snap-x` sous `md` et tableau côte-à-côte au-delà.
    - [ ] `TASK-MAI-03.02` : Barres d'actions unifiées `flex-col-reverse sm:flex-row` et intégration systématique de `PageContainer`.

- [ ] **`TASK-VAL-06` — Validation Déterministe & Non-Régression Globale**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `tests/e2e/responsive.spec.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-06.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript strict, 0 warning ESLint).
    - [ ] `TASK-VAL-06.02` : Validation de non-régression de la suite E2E Playwright Responsive sur les 5 viewports canoniques.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
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

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement < 85 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
