# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 19 Achevé & Validé (Container Queries OfferCard, Bottom-sheet fluide, Snap-x Compare, PageContainer unifié, Playwright Responsive 66/66 PASS, 100/100 PASS) — Sprints 1 à 19 Archivés | Sprint 20 Ouvert

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 20 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-DEN-01 (Tables)│  │ [ ] SPRINTS 21-22       │  │     - Sprint 19 (4)     │
│ [ ] TASK-DEN-02 (Keys)  │  │     (Auth, Overlays,    │  │     - Sprint 18 (3)     │
│ [ ] TASK-DEN-03 (Charts)│  │      Motion, Polish)    │  │     - Sprint 17 (3)     │
│ [ ] TASK-VAL-07 (Eval)  │  │                         │  │     - Sprints 1-16 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 20 — Pages Denses (`/admin`, `/dashboard/settings`, `/api-keys`, `/analytics`, `/history`, `/projects`)

- [ ] **`TASK-DEN-01` — Nouveau composant `ResponsiveTable` & Refonte `/admin`**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/ui/responsive-table.tsx`, `src/app/admin/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-DEN-01.01` : Création du composant générique `ResponsiveTable` (tableau standard sur `md+`, liste empilée de cartes clé/valeur accessibles sous `md`).
    - [ ] `TASK-DEN-01.02` : Refonte de la page `/admin` éliminant le scroll horizontal pénible sur mobile (<640px) tout en préservant la complétude des données utilisateurs/logs.

- [ ] **`TASK-DEN-02` — Navigation Compacte dans Settings & Clés API Fluides**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/dashboard/settings/page.tsx`, `src/app/api-keys/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-DEN-02.01` : Onglets de `dashboard/settings` adaptés avec `ScrollArea` horizontal à fondu et `Select` de navigation compact sous `sm`.
    - [ ] `TASK-DEN-02.02` : Clés API fluides en `break-all` (remplacement du `max-w-[220px]` tronquant) et menu d'actions compact sous `sm`.

- [ ] **`TASK-DEN-03` — Calibrage Graphiques Analytics & Flex-wrap History/Projects**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/app/analytics/page.tsx`, `src/app/history/page.tsx`, `src/app/projects/page.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-DEN-03.01` : Graphiques Recharts sur `analytics` calibrés en ratios fluides (R-UI-07) et cartes KPI en `grid-cols-2 lg:grid-cols-4`.
    - [ ] `TASK-DEN-03.02` : Remplacement des hauteurs fixes `h-[200px]` par des hauteurs relatives et filtres en `flex-wrap` sur `history` et `projects`.

- [ ] **`TASK-VAL-07` — Validation Déterministe & Non-Régression Globale**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `tests/e2e/responsive.spec.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-07.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript strict, 0 warning ESLint).
    - [ ] `TASK-VAL-07.02` : Validation de non-régression de la suite E2E Playwright Responsive sur les 5 viewports canoniques.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
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

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement < 85 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
