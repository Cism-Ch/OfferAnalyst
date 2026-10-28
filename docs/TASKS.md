# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 28 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 11 Achevé (Fiabilisation Ultime du Fetch AI & Résolution Erreur Validation) — Sprints 1 à 11 Archivés

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│  🔄 SPRINT ACTIF        │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] En attente cadrage  │  │ [ ] SPRINT 12 (Core V2) │  │     - Sprint 11 (5)     │
│                         │  │                         │  │     - Sprint 10 (4)     │
│                         │  │                         │  │     - Sprint 9 (5)      │
│                         │  │                         │  │     - Sprint 8 (4)      │
│                         │  │                         │  │     - Sprints 1-7 (All) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Aucun (Prêt pour Sprint 12 ou Nouvelle Orientation)

*Toutes les tâches du Sprint 11 sont validées à 100% avec le Juge Déterministe (`eval:quick` PASS 100/100, 0 erreur TypeScript, 0 warning ESLint, handler Better-Auth opérationnel HTTP 200).*

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
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
