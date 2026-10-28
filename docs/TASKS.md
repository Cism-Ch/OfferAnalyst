# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 28 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 13 Actif (Bilinguisme Exhaustif & Traduction Totale de l'Interface FR/EN) — Sprints 1 à 12 Archivés

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│  🔄 SPRINT 13 ACTIF     │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [-] TASK-I18N-01 (Dict) │  │ [ ] SPRINT 14 (Export)  │  │     - Sprint 12 (4)     │
│ [-] TASK-I18N-02 (Shell)│  │                         │  │     - Sprint 11 (5)     │
│ [-] TASK-I18N-03 (Core) │  │                         │  │     - Sprint 10 (4)     │
│ [-] TASK-I18N-04 (Extra)│  │                         │  │     - Sprint 9 (5)      │
│ [-] TASK-I18N-05 (Eval) │  │                         │  │     - Sprints 1-8 (All) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 13 — Bilinguisme Exhaustif & Traduction Totale de l'Interface (FR / EN)

- [-] **`TASK-I18N-01` — Enrichissement Exhaustif du Dictionnaire Global (`LanguageContext.tsx`)**
  - **Priorité :** 🔴 CRITIQUE (Fondation)
  - **Fichiers cibles :** [`src/contexts/LanguageContext.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/contexts/LanguageContext.tsx)
  - **Critères d'acceptation :**
    - [ ] `TASK-I18N-01.01` : Ajouter les entrées FR/EN pour toutes les pages : Accueil/Workflow, Search Context, Data Source, Saved Offers, Comparateur, Layout et Breadcrumbs.

- [-] **`TASK-I18N-02` — Internationalisation du Shell Applicatif (`ModernSidebar.tsx` & `ModernHeader.tsx`)**
  - **Priorité :** 🔴 CRITIQUE (Navigation Globale)
  - **Fichiers cibles :** [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx), [`src/components/layout/ModernHeader.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernHeader.tsx)
  - **Critères d'acceptation :**
    - [ ] `TASK-I18N-02.01` : Dynamiser tous les items de navigation de la sidebar via le dictionnaire actif (`t.nav.*`).
    - [ ] `TASK-I18N-02.02` : Adapter les titres, descriptions et fils d'Ariane (breadcrumbs) du header selon la langue active.

- [-] **`TASK-I18N-03` — Bilinguisme des Pages du Parcours Principal (`Home`, `SearchContext`, `DataSource`)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx), [`src/app/search-context/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/search-context/page.tsx), [`src/app/data-source/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/data-source/page.tsx)
  - **Critères d'acceptation :**
    - [ ] `TASK-I18N-03.01` : Remplacer les textes anglais en dur sur la page d'accueil (titres de bienvenue, étapes 1-2-3, cartes de fonctionnalités, boutons).
    - [ ] `TASK-I18N-03.02` : Remplacer les textes anglais en dur sur `search-context/page.tsx` (bannières, libellés, placeholders, presets bilingues).
    - [ ] `TASK-I18N-03.03` : Remplacer les textes anglais en dur sur `data-source/page.tsx` (options de scraping auto, saisie JSON, boutons d'action).

- [-] **`TASK-I18N-04` — Bilinguisme des Modules Complémentaires (`SavedOffersPage`, `ComparePage`)**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx), [`src/app/compare/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/compare/page.tsx)
  - **Critères d'acceptation :**
    - [ ] `TASK-I18N-04.01` : Dynamiser les boutons d'actions groupées, sélections, onglets et états vides dans `saved/page.tsx`.
    - [ ] `TASK-I18N-04.02` : Dynamiser les colonnes de comparaison, métriques et libellés dans `compare/page.tsx`.

- [-] **`TASK-I18N-05` — Validation Déterministe & Zéro Régression**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** [`evals/run_fullstack_eval.py`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/evals/run_fullstack_eval.py)
  - **Critères d'acceptation :**
    - [ ] `TASK-I18N-05.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript, 0 warning ESLint).
    - [ ] `TASK-I18N-05.02` : Vérification du basculement instantané 1-clic FR ↔ EN sans rechargement de page.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 12 (TASKS_HISTORY_S12_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S12_COMPLETED.md)** — 4 tâches (Modal Détaillé Plein Écran, Redesign Lumineux OfferCard, Layout 12 Cols, Bascule Grille/Liste).
- 👉 **[Consulter l'Archive Complète du Sprint 11 (TASKS_HISTORY_S11_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S11_COMPLETED.md)** — 5 tâches (Résolution Erreur Validation Fetch, Extraction Universelle, Better-Auth 503 Fix).
- 👉 **[Consulter l'Archive Complète du Sprint 10 (TASKS_HISTORY_S10_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)** — 4 tâches (Bilinguisme FR/EN, Alert).
- 👉 **[Consulter l'Archive Complète du Sprint 9 (TASKS_HISTORY_S9_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S9_COMPLETED.md)** — 5 tâches (Transparence IA, Multi-thèmes, Zéro-warning).
- 👉 **[Consulter l'Archive Complète du Sprint 8 (TASKS_HISTORY_S8_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S8_COMPLETED.md)** — 4 tâches Lot 1 (Settings, Confirm Dialogs, A11y, Toast).
- 👉 **[Consulter l'Archive des Sprints 1 à 7 (TASKS_HISTORY_S1_S5.md & S6, S7)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S7_COMPLETED.md)**
- 👉 **[Dernier Rapport d'Audit & Polish (AUDIT_CODE_QUALITY_ITERATION_21.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_CODE_QUALITY_ITERATION_21.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement < 100 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
