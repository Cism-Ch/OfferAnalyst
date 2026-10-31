# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 15 Achevé & Validé (Auth, Quotas, Historique, Export & Partage — 100/100, Tests Adversariaux 17/17) — Sprints 1 à 15 Archivés | Sprint 16 en Cours

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 16 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-E2E-01 (Playw) │  │ [ ] SPRINTS 17-22 (RWD  │  │     - Sprint 15 (9)     │
│ [ ] TASK-OBS-02 (Telemet│  │     & Fluidité UI/UX)   │  │     - Sprint 14 (4)     │
│ [ ] TASK-VAL-03 (Eval)  │  │                         │  │     - Sprint 13 (5)     │
│                         │  │                         │  │     - Sprint 12 (4)     │
│                         │  │                         │  │     - Sprints 1-11 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 16 — E2E Playwright & Observabilité IA

- [ ] **`TASK-E2E-01` — Tests E2E Playwright des Parcours Utilisateurs & Partage Public**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `tests/e2e/workflow.spec.ts`, `playwright.config.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-E2E-01.01` : Couverture E2E du parcours complet recherche, scoring IA, export PDF/CSV et ouverture du modal de détail.
    - [ ] `TASK-E2E-01.02` : Couverture E2E du flux de partage public (`/share/[id]`), affichage en lecture seule et interdiction de mutation.

- [ ] **`TASK-OBS-02` — Télémétrie d'Usage IA & Observabilité Web Vitals**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/app/actions/shared/api-key-provider.ts`, `src/app/api/analytics/web-vitals/route.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-OBS-02.01` : Traçabilité détaillée des requêtes OpenRouter (tokens consommés, latence en ms, modèle) avec journalisation sans fuite de secrets.
    - [ ] `TASK-OBS-02.02` : Métriques Web Vitals (INP, LCP, CLS, FCP) capturées et journalisées de façon non bloquante.

- [ ] **`TASK-VAL-03` — Validation Déterministe & Non-Régression Globale**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-03.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript, 0 warning ESLint, conformité Prisma MongoDB).

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 15 (TASKS_HISTORY_S15_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S15_COMPLETED.md)** — 9 Lots (Better-Auth M1-M4, Quotas 24h, Double Historique, Ops pnpm, Export PDF/CSV & Partage Public).
- 👉 **[Consulter l'Archive Complète du Sprint 14 (TASKS_HISTORY_S14_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S14_COMPLETED.md)** — 4 Lots Multi-Domaines (Sécurité Auth & Anti-IDOR, Continuité Guest User & BYOK, UX/UI Bilingue FR/EN & Sign Out, Méta-Optimisation RSI).
- 👉 **[Consulter l'Archive Complète du Sprint 13 (TASKS_HISTORY_S13_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S13_COMPLETED.md)** — 5 tâches (Bilinguisme Exhaustif FR/EN 100%).
- 👉 **[Consulter l'Archive Complète du Sprint 12 (TASKS_HISTORY_S12_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S12_COMPLETED.md)** — 4 tâches (Modal Détaillé Plein Écran, Redesign Lumineux OfferCard).
- 👉 **[Consulter l'Archive Complète du Sprint 11 (TASKS_HISTORY_S11_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S11_COMPLETED.md)** — 5 tâches (Résolution Erreur Validation Fetch, Better-Auth 503 Fix).
- 👉 **[Consulter l'Archive des Sprints 1 à 10 (TASKS_HISTORY_S10_COMPLETED.md & antérieurs)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**
- 👉 **[Dernier Rapport d'Audit Multi-Domaines (AUDIT_AUTH_GUEST_QUALITY_SPRINT_14.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_AUTH_GUEST_QUALITY_SPRINT_14.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement < 80 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
