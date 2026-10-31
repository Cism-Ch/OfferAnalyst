# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 31 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 28 Achevés & Validés — Release V1.3.0 Production Build Validé (0 erreur)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (PRODUCTION)│  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [x] TASK-EXT-01         │  │ [ ] Multi-Tenant DB     │  │     - Sprint 29 (Capture│
│     (Release v1.3.0 &   │  │ [ ] Webhook Alerts      │  │     - Sprint 28 (Cache) │
│     Build 40/40 Validé) │  │                         │  │     - Sprint 27 (Action)│
│                         │  │                         │  │     - Sprint 26 (Ingest)│
│                         │  │                         │  │     - Sprint 25 (Vitrine│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## ⚡ Sprint 29 Achevée : Contournement Anti-Bot & Capture 1-Clic (Bookmarklet & Extension Chrome)

- [x] **`TASK-EXT-01` — Système de Capture 1-Clic Multi-Plateformes (Bookmarklet Universel & Extension Chrome)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/data-source/CaptureAssistantModal.tsx`, `src/components/data-source/UrlImportTab.tsx`, `src/components/data-source/RawTextTab.tsx`, `src/app/data-source/page.tsx`, `extension/*`, `public/extension/*`, `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-EXT-01.01` : Bookmarklet JavaScript universel glisser-déposer (compatible Chrome/Firefox/Safari/Edge/Brave) extrayant le contenu textuel/DOM propre des pages d'offres (LinkedIn, Indeed, WTTJ, etc.) et le transmettant instantanément à l'application.
    - [x] `TASK-EXT-01.02` : Prise en charge des paramètres de capture entrante (`#capture=...` ou `?capture=...`) sur `/data-source` avec bascule automatique sur l'onglet Texte Brut et pré-remplissage immédiat.
    - [x] `TASK-EXT-01.03` : Extension Chrome Manifest V3 complète (`extension/manifest.json`, `content.js`, `popup.html`, `popup.js`, icônes PNG) avec détection automatique de plateforme, envoi en un clic vers OfferAnalyst et zip téléchargeable en un clic (`public/extension/offeranalyst-extension.zip`).
    - [x] `TASK-EXT-01.04` : Modal d'aide et d'accompagnement interactif (`CaptureAssistantModal.tsx`) accessible depuis `/data-source` et `UrlImportTab.tsx`, avec drag-and-drop du bookmarklet et instructions pas à pas de l'extension.
    - [x] `TASK-EXT-01.05` : Bilinguisme FR/EN intégral dans `LanguageContext.tsx` (`captureAssistant`).
    - [x] `TASK-EXT-01.06` : Validation sans faute avec `npm run eval:quick` (100/100 PASS) et `npm run build` (0 erreur, 40 routes compilées).

---

## 🚀 Release V1.3.0 Achevée : Déploiement & Vérification Finale

- [x] **`TASK-REL-01` — Production Release, Next Build & Smoke Tests**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `package.json`, `evals/run_fullstack_eval.py`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-REL-01.01` : Validation du build de production complet (`npm run build`) avec 0 erreur et génération des 40 routes (34 statiques, dynamic endpoints, middleware proxy).
    - [x] `TASK-REL-01.02` : Validation `eval:quick` déterministe (100/100, 0 warning ESLint, 0 erreur TypeScript strict).
    - [x] `TASK-REL-01.03` : Vérification finale des variables d'environnement de production et préparation du tag git release.

---

## ⚡ Sprint 28 Achevée : Chantier 3 — Architecture & Viabilité Technique : Cache Intelligent & Anti-Timeout

- [x] **`TASK-ASYNC-01` — Architecture & Viabilité Technique : Cache Intelligent & Pipeline Anti-Timeout**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/cache.ts`, `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`, `src/app/actions/offers/structure-raw-offers.ts`, `src/components/data-source/UrlImportTab.tsx`, `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-ASYNC-01.01` : Intégration du cache multi-niveaux (`src/lib/cache.ts`) dans `fetchOffersAction`, `analyzeOffersAction` et `structureRawOffersAction` avec empreinte SHA-256 (`generateCacheKey`) pour éliminer la redondance et réduire les coûts de tokens.
    - [x] `TASK-ASYNC-01.02` : Détection et contournement des blocages anti-bots/Cloudflare sur les imports URLs avec suggestions de remédiation claires vers le texte brut.
    - [x] `TASK-ASYNC-01.03` : Pipeline optimisé de traitement pour prévenir les timeouts Vercel (10s Hobby / 60s Pro) par simplification des charges et limitation des tokens inutiles.
    - [x] `TASK-ASYNC-01.04` : Télémétrie et métadonnées de cache (`cached: boolean`) propagées de façon transparente vers l'interface utilisateur.
    - [x] `TASK-ASYNC-01.05` : Validation déterministe intégrale avec `npm run eval:quick` (100/100 PASS, 0 warning ESLint, 0 erreur TypeScript strict).

---

## ⚡ Sprint 27 Achevée : Chantier 4 — Actions & Monétisation Post-Scoring (Négociation & Candidature Sur-Mesure)

- [x] **`TASK-ACTION-01` — Moteur d'Action Post-Scoring (Arguments de Négociation & Candidature Sur-Mesure)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/actions/offers/generate-action-content.ts`, `src/components/offers/NegotiationPitchModal.tsx`, `src/components/offers/TailoredApplicationModal.tsx`, `src/components/offers/OfferCard.tsx`, `src/components/offers/OfferDetailModal.tsx`, `src/components/offers/ResultsSection.tsx`, `src/app/analysis/page.tsx`, `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-ACTION-01.01` : Server Action déterministe `generateOfferActionContentAction` (`negotiation_pitch` et `custom_application`) utilisant le contexte utilisateur et les données multi-axes pour produire des livrables exploitables immédiatement.
    - [x] `TASK-ACTION-01.02` : Modal interactif d'arguments de négociation (`NegotiationPitchModal.tsx`) avec points de levier, contre-propositions de salaire/reste-à-vivre, et script de négociation prêt à copier.
    - [x] `TASK-ACTION-01.03` : Modal de réponse / candidature sur-mesure (`TailoredApplicationModal.tsx`) avec accroche personnalisée, alignement profil-offre et synthèse percutante.
    - [x] `TASK-ACTION-01.04` : Intégration des boutons d'actions directes sur les fiches d'offres (`OfferCard.tsx`), le modal de détail (`OfferDetailModal.tsx`), la section de résultats (`ResultsSection.tsx`) et la colonne latérale d'action (`AnalysisPage.tsx`).
    - [x] `TASK-ACTION-01.05` : Bilinguisme intégral FR/EN dans `LanguageContext.tsx` (`postScoreActions`).
    - [x] `TASK-ACTION-01.06` : Validation sans faute avec `npx tsc --noEmit`, `npm run lint` et `npm run eval:quick` (100/100 PASS).

---

## 📥 Sprint 26 Achevée : Chantier 2 — Ingestion Multi-Sources sans Friction (`/data-source`)

- [x] **`TASK-INGEST-01` — Système d'Ingestion Multi-Sources (Texte Libre, URLs, Fichiers & JSON Développeur)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/actions/offers/structure-raw-offers.ts`, `src/components/data-source/RawTextTab.tsx`, `src/components/data-source/UrlImportTab.tsx`, `src/components/data-source/FileUploadTab.tsx`, `src/components/data-source/JsonInputTab.tsx`, `src/app/data-source/page.tsx`, `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-INGEST-01.01` : Server Action déterministe `structureRawOffersAction` utilisant le modèle LLM rapide pour extraire et structurer du texte libre (copier-coller vrac d'offres) vers le schéma `Offer[]` normalisé.
    - [x] `TASK-INGEST-01.02` : Onglet par défaut Texte Libre (`RawTextTab.tsx`) avec zone de collage simple, détection multi-offres, feedback de structuration IA et prévisualisation directe sous forme de fiches éditables.
    - [x] `TASK-INGEST-01.03` : Onglet Import par Liens/URLs (`UrlImportTab.tsx`) avec validation Zod, garde-fous anti-SSRF et extraction de métadonnées.
    - [x] `TASK-INGEST-01.04` : Onglet Import de Fichiers (`FileUploadTab.tsx`) avec parsing automatique des fichiers CSV (mappage de colonnes intelligent) et fichiers texte.
    - [x] `TASK-INGEST-01.05` : Onglet Avancé / Développeurs (`JsonInputTab.tsx`) pour conserver le mode JSON d'origine pour les flux API sans intimider les utilisateurs ordinaires.
    - [x] `TASK-INGEST-01.06` : Intégration unifiée et responsive dans `src/app/data-source/page.tsx`, bilinguisme FR/EN exhaustif et validation 100/100 (`eval:quick`).

---

## 🎯 Sprint 25 Achevée : Chantier 1 — Page de Présentation SaaS, Démo Interactive 1 Clic & Navigation Cookie Robuste

- [x] **`TASK-PROD-01` — Présentation SaaS Premium, Démo 1 Clic & Système Anti-Bounce par Cookies**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/cookie-nav.ts`, `src/components/landing/InteractiveDemoWidget.tsx`, `src/components/landing/SaaSPresentationView.tsx`, `src/app/page.tsx`, `src/app/landing/page.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/contexts/LanguageContext.tsx`, `middleware.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-PROD-01.01` : Architecture de navigation et persistance des cookies (`offeranalyst_app_mode` = `'app'` | `'vitrine'`) garantissant qu'un rafraîchissement (F5) ou un retour sur l'app ne renvoie jamais l'utilisateur actif vers la vitrine, tout en préservant l'accès explicite à `/landing`.
    - [x] `TASK-PROD-01.02` : Conception par un spécialiste UI/UX du composant de démo interactive en 1 clic (`InteractiveDemoWidget.tsx`) sans login ni friction, chargeant 3 cas concrets réels, simulant l'analyse multi-axes en direct avec barres, radar et citations web anti-hallucination.
    - [x] `TASK-PROD-01.03` : Refonte premium de la Page Vitrine SaaS (`src/components/landing/SaaSPresentationView.tsx` & `/landing`), positionnement B2B/Prosumer (Arbitrage d'opportunités, tech remote, recrutement & sourcing), Bento Grid de différenciation (Citations web prouvées, NVIDIA Nemotron gratuit, BYOK illimité, Sécurité zéro-rétention) et Call-To-Action fluides.
    - [x] `TASK-PROD-01.04` : Intégration unifiée sur la route racine `/` (détection Server/Client du cookie `offeranalyst_app_mode` avec fallback élégant) et liens bidirectionnels (App <-> Vitrine) dans le Header/Sidebar.
    - [x] `TASK-PROD-01.05` : Bilinguisme intégral FR/EN des nouveaux éléments de présentation et de la démo 1 clic.
    - [x] `TASK-PROD-01.06` : Validation sans faute avec `npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` (100/100 PASS) et `npm run build` (0 erreur).

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

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement 133 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
