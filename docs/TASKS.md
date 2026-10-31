# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 17 Achevé & Validé (E2E Playwright Responsive 47/47 PASS, Tokens dvh, Cibles 44px, 100/100 PASS) — Sprints 1 à 17 Archivés | Sprint 18 Ouvert

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 18 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-SHL-01 (Shell) │  │ [ ] SPRINTS 19-22 (RWD  │  │     - Sprint 17 (3)     │
│ [ ] TASK-SHL-02 (Drawer)│  │     Data & Workflow)    │  │     - Sprint 16 (4)     │
│ [ ] TASK-VAL-05 (Eval)  │  │                         │  │     - Sprint 15 (9)     │
│                         │  │                         │  │     - Sprints 1-14 (All)│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 18 — Shell Applicatif Unifié & Navigation Responsive

- [ ] **`TASK-SHL-01` — Shell Applicatif Unifié & AppShell Navigation Responsive**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/layout/AppShell.tsx`, `src/components/layout/ModernLayout.tsx`, `src/components/layout/SimpleLayout.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-SHL-01.01` : Création du composant d'architecture unifié `AppShell.tsx` fédérant l'en-tête, la barre latérale rétractable (icon rail tablette) et la zone de contenu principal fluide.
    - [ ] `TASK-SHL-01.02` : Factorisation de `ModernLayout` et `SimpleLayout` sur `AppShell` avec persistance de l'état de rétraction et adaptation dynamique de la largeur du viewport.

- [ ] **`TASK-SHL-02` — Header Compact & Drawer Mobile Radix Sheet**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/components/ui/sheet.tsx`
  - **Critères d'acceptation :**
    - [ ] `TASK-SHL-02.01` : Intégration du composant accessible Radix Sheet (`@radix-ui/react-dialog`) pour le drawer mobile avec focus trapping, swipe-to-dismiss et respect des safe-areas.
    - [ ] `TASK-SHL-02.02` : Consolidation du header mobile avec menu déroulant compact pour les sélecteurs secondaires (thème, langue, modèle IA) sur résolutions ultra-étroites (< 360px).

- [ ] **`TASK-VAL-05` — Validation Déterministe & Non-Régression Globale**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `tests/e2e/responsive.spec.ts`
  - **Critères d'acceptation :**
    - [ ] `TASK-VAL-05.01` : Validation binaire avec `npm run eval:quick` (100/100, 0 erreur TypeScript strict, 0 warning ESLint, conformité Prisma MongoDB).
    - [ ] `TASK-VAL-05.02` : Validation de non-régression de la suite E2E Playwright responsive sur les 5 viewports canoniques.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
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
