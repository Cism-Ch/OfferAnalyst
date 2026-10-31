# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 24 Achevés & Validés — Système RSI de Versioning Dynamique `vX.X.X-MENTION` Opérationnel

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (RSI / V1.1)│  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [x] TASK-RSI-01 (SemVer │  │ [ ] Multi-Tenant DB     │  │     - Sprint 24 (UI/UX) │
│     vX.X.X-MENTION)     │  │ [ ] Webhook Alerts      │  │     - Sprint 23 (Remed) │
│ [ ] TASK-REL-01 (V1.1.0 │  │ [ ] Chrome Extension    │  │     - Sprints 1-22 (All)│
│     Release & Deploy)   │  │                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🤖 Protocole RSI : Versioning Automatique & Évaluation SemVer

- [x] **`TASK-RSI-01` — Système RSI de Versioning Adaptatif (`vX.X.X-MENTION`)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `evals/version_manager.py`, `evals/rsi_orchestrator.py`, `package.json`, `CHANGELOG.md`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-RSI-01.01` : Parser SemVer tolérant aux préfixes et mentions existantes (`vX.X.X-MENTION`).
    - [x] `TASK-RSI-01.02` : Moteur d'évaluation heuristique des modifications Git (`status`, `diff`) et Changelog pour classification automatique du saut (`patch` vs `minor`) et déduction de la mention (`patch`, `ui-fix`, `mobile-ui`).
    - [x] `TASK-RSI-01.03` : Prise en charge des drapeaux CLI `--bump`, `--mention`, `--auto-mention`, `--dry-run` et génération du tag Git conforme (`vX.X.X-MENTION`).
    - [x] `TASK-RSI-01.04` : Intégration dans `evals/rsi_orchestrator.py` (`--version-eval`, `--version-bump`) et scripts npm (`npm run rsi:version`, `npm run rsi:bump`).
    - [x] `TASK-RSI-01.05` : Documentation de la release sous `## [Unreleased]` dans `CHANGELOG.md` et validation 100/100 (`eval:quick`).

---

## 🎨 Sprint 24 Achevée : Audit & Remédiation UI/UX Mobile & Navbar SaaS Premium

- [x] **`TASK-UI-02` — Audit & Remédiation UI/UX Mobile, Navbar SaaS Premium & Ergonomie Tactile**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/layout/ModernSidebar.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/AIModelSelector.tsx`, `src/components/layout/LanguageToggle.tsx`, `src/components/api-keys/GuestApiKeyDialog.tsx`, `src/components/ui/select.tsx`, `src/lib/ai-models.ts`, `src/app/data-source/page.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-UI-02.01` : Bouton Drawer mobile modernisé (`rounded-full`, micro-glassmorphism, aligné verticalement) et fermeture automatique du sheet lors de l'ouverture du dialogue BYOK pour débloquer les interactions tactiles.
    - [x] `TASK-UI-02.02` : Mention / breadcrumb "Tableau de bord" présentée de façon premium (pill badge sans troncature agressive) et centrage esthétique des titres de page sur mobile.
    - [x] `TASK-UI-02.03` : Boutons Langue & Thème snappés à droite de la navbar, AI Model Selector repositionné avec espacements/marges fluides et ergonomie tactile 44px.
    - [x] `TASK-UI-02.04` : Modèle IA par défaut fixé sur NVIDIA Nemotron 3.5 Lightning (gratuit/inclus).
    - [x] `TASK-UI-02.05` : Résolution complète du bug tactile dans GuestApiKeyDialog (fermeture sheet sous-jacent, élévation `SelectContent` au-dessus de `z-dialog`, cibles tactiles 44px sur tous les inputs et boutons).
    - [x] `TASK-UI-02.06` : Refonte responsive de la page Source de Données (`/data-source`) avec layout adaptatif sans débordement, toggles/badges bien proportionnés et hiérarchie d'actions épurée.
    - [x] `TASK-UI-02.07` : Validation sans faute avec `npm run lint` et `npx tsc --noEmit` (100/100 PASS).

---

## 🚀 Prochain Sprint : Release V1.1.0 — Déploiement & Vérification Finale

- [ ] **`TASK-REL-01` — Production Release, Next Build & Smoke Tests**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `package.json`, `evals/run_fullstack_eval.py`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-REL-01.01` : Validation du build de production complet (`npm run build`) avec 0 erreur et génération des routes statiques/dynamiques (40 routes, 34 statiques).
    - [x] `TASK-REL-01.02` : Validation `eval:quick` déterministe (100/100, 0 warning ESLint, 0 erreur TypeScript strict).
    - [ ] `TASK-REL-01.03` : Vérification finale des variables d'environnement de production et préparation du tag git release `v1.1.0`.

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive Complète du Sprint 23 (TASKS_HISTORY_S23_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S23_COMPLETED.md)** — Remédiation Pré-Release (Clés API .env Only, Purge V2 & Export ambigu, Zod Server Actions, .env.example 9 vars, HTML lang sync, min-h-app, 100/100 PASS, next build 0 err).
- 👉 **[Consulter l'Archive Complète du Sprint 22 (TASKS_HISTORY_S22_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S22_COMPLETED.md)** — 4 Lots (Z-index 20-80 Unifié, Micro-animations 150-250ms, Prefers-Reduced-Motion, Skeletons CLS < 0.05, Scroll-padding 56px/72px, Playwright Responsive 112/112 PASS, 100/100 PASS).
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
- 👉 **[Rapport d'Audit Pré-Release V1.x (AUDIT_PRE_RELEASE_COMPLIANCE_V1.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_PRE_RELEASE_COMPLIANCE_V1.md)**
- 👉 **[Rapport d'Audit Final Responsive & Fluidité (AUDIT_RESPONSIVE_FLUIDITY_SPRINT_22.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_RESPONSIVE_FLUIDITY_SPRINT_22.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement 92 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
