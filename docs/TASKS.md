# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 28 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 13 Achevé & Validé (Bilinguisme Exhaustif FR/EN 100%) — Sprints 1 à 13 Archivés | Sprint 14 en Préparation

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 14 PRÉPARATION│  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-EXP-01 (PDF/CSV│  │ [ ] SPRINT 15 (Auth RLS)│  │     - Sprint 13 (5)     │
│ [ ] TASK-EXP-02 (Share) │  │                         │  │     - Sprint 12 (4)     │
│ [ ] TASK-EXP-03 (UI/A11y│  │                         │  │     - Sprint 11 (5)     │
│ [ ] TASK-EXP-04 (Eval)  │  │                         │  │     - Sprint 10 (4)     │
│                         │  │                         │  │     - Sprints 1-9 (All) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 14 (En Préparation) — Export PDF / CSV & Partage Collaboratif d'Analyses

- [ ] **`TASK-EXP-01` — Moteur de Génération & Téléchargement de Rapports PDF & CSV d'Analyse**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/export.ts`, `src/app/api/export/route.ts`, `src/components/offers/ResultsSection.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-EXP-01.01` : Moteur d'export CSV structuré incluant scores (Pertinence, Qualité, Tendance) et métadonnées d'offres.
    - [ ] `TASK-EXP-01.02` : Génération PDF mise en page avec résumé exécutif, distribution des notes et justification IA.

- [ ] **`TASK-EXP-02` — Lien de Partage Sécurisé & Consultation Publique en Lecture Seule**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/app/share/[id]/page.tsx`, `src/server/share.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-EXP-02.01` : Génération d'un token d'accès temporaire ou pérenne pour partager une synthèse d'analyse.
    - [ ] `TASK-EXP-02.02` : Vue publique épurée bilingue sans droit de mutation sur le projet d'origine.

- [ ] **`TASK-EXP-03` — Intégration UI & Boutons d'Action Rapide Bilingues**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/components/offers/ResultsSection.tsx`, `src/components/offers/OfferDetailModal.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-EXP-03.01` : Boutons d'export "Télécharger PDF", "Exporter CSV", et "Partager" dans la barre d'outils d'analyse.

- [ ] **`TASK-EXP-04` — Validation Déterministe & Non-Régression**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** [`evals/run_fullstack_eval.py`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/evals/run_fullstack_eval.py)
  - **Critères d'acceptation :**
    - [ ] `TASK-EXP-04.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript, 0 warning ESLint).

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 13 (TASKS_HISTORY_S13_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S13_COMPLETED.md)** — 5 tâches (Dictionnaire Global Symétrique, Shell Applicatif, Pages Workflow Principal, Modules Complémentaires, Validation Déterministe).
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
