# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 03 Novembre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprints 1 à 42 Achevés & Validés — Score Déterministe 100/100 PASS (0 erreur TS, 0 ESLint warning)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🚀 EN COURS (SPRINT 51) │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] Prochain sprint     │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 50 (Dédup  │
│     à définir           │  │ [ ] Chrome Store Publish│  │       API, Verrou, UI)  │
│                         │  │ [ ] Export PDF / CSV    │  │     - Sprint 49 (Artef.)│
│                         │  │                         │  │     - Sprints 1 à 48    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## ⚡ Sprint 50 Achevée : Déduplication API Quota, Verrou Anti-Concurrence IA & Badge Workspace Responsive

- [x] **`TASK-PERF-01` — Déduplication des Requêtes Quota & Verrou Anti-Concurrence Analyse IA**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/hooks/use-daily-quota.ts`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/app/data-source/page.tsx`, `src/contexts/AnalysisContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-PERF-01.01` : Création du hook singleton `useDailyQuota` avec déduplication de promesse en vol, cache partagé et écouteur unique de l'événement `offeranalyst:quota_updated`.
    - [x] `TASK-PERF-01.02` : Remplacement des `useEffect` redondants dans `ModernHeader.tsx`, `ModernSidebar.tsx` et `src/app/data-source/page.tsx` pour éliminer les 2-3 requêtes parallèles.
    - [x] `TASK-PERF-01.03` : Verrouillage strict anti-concurrence dans `AnalysisContext.tsx` (`executeAnalysis`) pour interdire toute double exécution accidentelle d'analyse IA.

- [x] **`TASK-UI-WORKSPACE-02` — Badge Workspace Responsive : Mobile 2e ligne avec Wrap & Masquage sur Grand Écran (`lg:hidden`)**
  - **Priorité :** 🟡 MOYENNE
  - **Fichiers cibles :** `src/components/workspace/WorkspaceActiveBadge.tsx`, `src/components/layout/ModernHeader.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-UI-WORKSPACE-02.01` : Sécurisation du cycle de vie de `WorkspaceActiveBadge` (protection contre les fuites au démontage `isMounted`, intégration du Skeleton officiel shadcn).
    - [x] `TASK-UI-WORKSPACE-02.02` : Rendre le badge flexible avec support du text wrap et contraintes de largeur adaptatives sans débordement horizontal.
    - [x] `TASK-UI-WORKSPACE-02.03` : Sur mobile (< sm), déplacer le badge workspace dans la deuxième ligne de la navbar pour aérer la ligne 1 (fil d'Ariane et quota).
    - [x] `TASK-UI-WORKSPACE-02.04` : Sur grand écran (`lg:`), masquer le badge de workspace dans la navbar (`lg:hidden`) car déjà visible dans la sidebar latérale.

---

## ⚡ Sprint 49 Achevée : Intégration Mémoire Artefacts IDE & Cadence des Tests Anti-Saturation

- [x] **`TASK-RSI-03` — Intégration du Suivi par Artefacts IDE & Cadence Déterministe des Tests Anti-Saturation**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `.agents/workflows/rsi-feature.md`, `.agents/rules/system_core.md`, `evals/run_fullstack_eval.py`, `evals/rsi_orchestrator.py`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-RSI-03.01` : Formalisation de la séparation Mémoire Épisodique (Artefacts IDE hors contexte conversationnel) vs Mémoire Procédurale (`.agents/rules/modules/`) dans le workflow `/rsi-feature`.
    - [x] `TASK-RSI-03.02` : Formalisation de la cadence de tests à 3 niveaux (Local/Micro-édition sans exécution globale -> Jalon/Composant avec `eval:quick` compacté -> Clôture avec `eval:fullstack`) dans `.agents/rules/system_core.md`.
    - [x] `TASK-RSI-03.03` : Ajout du filtrage de sortie d'erreur tronqué dans `evals/run_fullstack_eval.py` (max 10 lignes signifiantes) pour garantir qu'aucune stack trace volumineuse ne pollue le contexte lors d'un échec.
    - [x] `TASK-RSI-03.04` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🧠 Sprint 48 Achevée : Protocole RSI v2 (Mémoire Modulaire Dynamique, Juge Adaptatif & Auditeur MCP/Skills)

- [x] **`TASK-RSI-02` — Refonte du Protocole RSI v2 (Mémoire Modulaire, Juge Adaptatif & Auditeur MCP/Skills)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `evals/stack_inspector.py`, `evals/memory_engine.py`, `evals/run_fullstack_eval.py`, `evals/rsi_orchestrator.py`, `.agents/rules/modules/`, `.agents/rules/fullstack_playbook.md`, `package.json`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-RSI-02.01` : Création de l'Auditeur de Stack & Écosystème (`evals/stack_inspector.py`) analysant `package.json`, `.env.example`, `.mcp.json` et suggérant les MCP / Skills officiels correspondants.
    - [x] `TASK-RSI-02.02` : Création du Moteur de Mémoire Modulaire Dynamique (`evals/memory_engine.py`) et découpage des règles en sous-modules (`db.md`, `api_backend.md`, `ui_frontend.md`, `security_auth.md`, `integration_ai.md`) avec indexation et chargement contextuel ciblé.
    - [x] `TASK-RSI-02.03` : Refonte du Juge Déterministe (`evals/run_fullstack_eval.py`) pour le rendre agnostique et adaptatif (auto-détection package manager, typecheck, linter et ORM sans crash si Prisma est absent).
    - [x] `TASK-RSI-02.04` : Mise à jour de l'orchestrateur RSI (`evals/rsi_orchestrator.py`), scripts `package.json` (`pnpm run rsi:inspect`, `pnpm run rsi:memory`) et workflow `.agents/workflows/rsi-feature.md`.
    - [x] `TASK-RSI-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🏢 Sprint 47 Achevée : Badge Workspace Actif (Header & Sidebar) & Modernisation Complète du Changelog (v1.4.5)

- [x] **`TASK-WORKSPACE-01` — Badge Workspace Actif Partout (Header & Sidebar) & Modernisation du Changelog (v1.4.5)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/workspace/WorkspaceActiveBadge.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/app/changelog/page.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-WORKSPACE-01.01` : Création du composant réutilisable `WorkspaceActiveBadge` récupérant le workspace actif via `getWorkspaceAction()` avec affichage du nom, badge de rôle (Owner/Admin/Member/Invité), icône d'immeuble/équipe et lien direct vers `/dashboard/workspace`.
    - [x] `TASK-WORKSPACE-01.02` : Intégration du badge workspace dans `ModernHeader` (ligne desktop et ligne mobile) et en haut de la `ModernSidebar` (au-dessus des menus).
    - [x] `TASK-WORKSPACE-01.03` : Refonte moderne de la page `src/app/changelog/page.tsx` avec les versions récentes v1.4.5, v1.4.2, v1.4.0, v1.3.5, design timeline shadcn soigné et sans emoji.
    - [x] `TASK-WORKSPACE-01.04` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🧭 Sprint 46 Achevée : Renommage du Titre du 2ème Groupe Sidebar (« Espace de travail »)

- [x] **`TASK-NAV-02` — Renommage du Titre du 2ème Groupe de la Sidebar en « Espace de travail »**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-NAV-02.01` : Mise à jour de `t.nav.sectionMore` en « Espace de travail » (FR) et « Workspace » (EN) dans `LanguageContext.tsx`.
    - [x] `TASK-NAV-02.02` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🧭 Sprint 45 Achevée : Harmonisation des Titres & Menus de la Barre Latérale (Dédoublonnage Dashboard & Titre Groupe 1)

- [x] **`TASK-NAV-01` — Harmonisation des Titres & Menus de la Barre Latérale (ModernSidebar)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/layout/ModernSidebar.tsx`, `src/contexts/LanguageContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-NAV-01.01` : Ajout de la clé `t.nav.home` (« Accueil » / « Home ») et mise à jour de `t.nav.sectionMain` (« Recherche » / « Search ») dans `LanguageContext.tsx`.
    - [x] `TASK-NAV-01.02` : Renommage du titre du troisième groupe `t.nav.sectionDashboard` en « Gestion & Paramètres » / « Management & Settings » sans altérer les items internes.
    - [x] `TASK-NAV-01.03` : Application du titre de groupe sur `mainNavItems` (`t.nav.sectionMain`) et remplacement du premier lien `/` par `t.nav.home` dans `ModernSidebar.tsx`.
    - [x] `TASK-NAV-01.04` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🎨 Sprint 44 Achevée : Calibrage Géométrique Modal & Footer Sélecteur d'IA (Zéro Débordement & Hauteur Optimisée)

- [x] **`TASK-UI-MODEL-01` — Calibrage Spatial du Sélecteur d'IA & Footer Sans Débordement**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/layout/AIModelSelector.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-UI-MODEL-01.01` : Retrait des marges négatives cassantes (`-mb-4`, `-mb-6`) sur le footer pour éliminer tout débordement de texte hors du conteneur modal.
    - [x] `TASK-UI-MODEL-01.02` : Fixation explicite du footer avec `shrink-0`, `sticky bottom-0`, fond opaque avec bordure supérieure nette et padding interne sécurisé.
    - [x] `TASK-UI-MODEL-01.03` : Ajustement de la hauteur du dialogue (`h-[92dvh] sm:h-[86dvh] max-h-[850px]`) avec conteneur de liste `flex-1 min-h-0 overflow-y-auto` pour garantir une surface généreuse de défilement.
    - [x] `TASK-UI-MODEL-01.04` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## ⚡ Sprint 43 Achevée : Fiabilisation Compteur de Quota Journalier (Redis, LocalStorage Sync & Event Bus) & Lisibilité Footer Sélecteur d'IA

- [x] **`TASK-QUOTA-01` — Fiabilisation Compteur de Quota (Redis + In-Memory Fallback, LocalStorage BYOK Sync, Event Bus) & Restructuration Footer Sélecteur IA**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/actions/shared/quota-limiter.ts`, `src/contexts/AnalysisContext.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/app/data-source/page.tsx`, `src/components/layout/AIModelSelector.tsx`, `src/components/api-keys/GuestApiKeyDialog.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-QUOTA-01.01` : Stockage persistant du compteur journalier dans Upstash Redis (`quota:daily:YYYY-MM-DD:identifier`) avec TTL automatique à minuit UTC, avec fallback transparent sur la Map en mémoire si Redis est indisponible.
    - [x] `TASK-QUOTA-01.02` : Détection BYOK multi-sources : vérification Better-Auth session, cookie 24h chiffré, et support du paramètre `clientHasByok` pour les clés configurées dans `useTemporaryApiKeys` (localStorage).
    - [x] `TASK-QUOTA-01.03` : Bus d'événements client (`offeranalyst:quota_updated` et `storage`) émis lors de la fin d'une recherche (`AnalysisContext`), de l'ajout/suppression d'une clé API (`GuestApiKeyDialog`), et réécouté en direct par `ModernHeader`, `ModernSidebar` et `DataSourcePage`.
    - [x] `TASK-QUOTA-01.04` : Refonte ergonomique du footer du sélecteur d'IA (`AIModelSelector`) : texte plus grand (`text-xs sm:text-sm`), icône bien dimensionnée, contraste fort pour une lisibilité optimale, disposition équilibrée et bouton d'accès direct vers `/dashboard/api-keys`.
    - [x] `TASK-QUOTA-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🛡️ Sprint 42 Achevée : Suppression Feature Flags Obsolètes, Télémétrie des Services & Rate Limiting DDoS Auto-Adaptatif (5 req/min Upstash Redis)

- [x] **`TASK-SEC-01` — Purge des Feature Flags, Télémétrie des Services & Rate Limiting DDoS Auto-Adaptatif**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/feature-flags.ts`, `src/app/api/admin/feature-flags/route.ts`, `src/lib/redis.ts`, `src/lib/ddos-defense.ts`, `src/app/actions/db/service-health.ts`, `src/app/admin/page.tsx`, `src/app/actions/analyze.ts`, `.env.example`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-SEC-01.01` : Suppression complète du code mort des anciens Feature Flags (`src/lib/feature-flags.ts`, `src/app/api/admin/feature-flags/route.ts` et du composant d'affichage dans `src/app/admin/page.tsx`).
    - [x] `TASK-SEC-01.02` : Client singleton Upstash Redis (`src/lib/redis.ts`) avec fallback mémoire résilient et variables d'environnement documentées dans `.env.example`.
    - [x] `TASK-SEC-01.03` : Moteur de détection DDoS & Rate Limiting adaptatif (`src/lib/ddos-defense.ts`) calibré à 5 req/min max sur les recherches / analyses, avec système d'isolation automatique (Jail IP temporaire 15 min) et whitelist admin.
    - [x] `TASK-SEC-01.04` : Sonde de télémétrie multi-services (`src/app/actions/db/service-health.ts`) mesurant la latence et disponibilité en direct de MongoDB Atlas, Upstash Redis, Upstash QStash, OpenRouter et Better-Auth.
    - [x] `TASK-SEC-01.05` : Nouveau Centre de Contrôle Sécurité & Infrastructure sur `src/app/admin/page.tsx` avec statut des services, métriques DDoS, liste des IPs isolées avec déblocage en 1 clic.
    - [x] `TASK-SEC-01.06` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🤖 Sprint 41 Achevée : Modèles IA Modernisés (2 par Structure), Détection Hors-Ligne Admin/Sélecteur, Espacements UI & Modèle sur Recherche

- [x] **`TASK-MODEL-02` — Modernisation Modèles IA (2/Structure, GPT-6.1/o3/4o, Nemotron), Détection Offline, Calibrage UI & Affichage Modèle Utilisé**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `src/app/actions/models.ts`, `src/app/actions/analyze.ts`, `src/components/layout/AIModelSelector.tsx`, `src/app/admin/page.tsx`, `src/components/offers/ResultsSection.tsx`, `src/app/history/page.tsx`, `src/types/index.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-MODEL-02.01` : Structuration stricte des modèles IA dans `src/lib/ai-models.ts` : 2 modèles par provider (NVIDIA : Nemotron 3.5 Lightning & Nemotron 3 Ultra 550B, pas de Gemma ; OpenAI : GPT-6.1 Terra, o3, GPT-4o ; Anthropic : Claude 5.5 Sonnet & Haiku ; DeepSeek : V3 & R1-0528 ; Google : Gemini 3.8 Flash & 2.5 Pro ; Mistral : Large & Small).
    - [x] `TASK-MODEL-02.02` : Service de détection en temps réel de disponibilité / statut hors-ligne des modèles via l'API OpenRouter avec cache résilient (`src/app/actions/models.ts`).
    - [x] `TASK-MODEL-02.03` : Signalisation visuelle des modèles hors-ligne / indisponibles dans l'interface de sélection (`AIModelSelector`) et dans le tableau de bord Admin (`/admin`).
    - [x] `TASK-MODEL-02.04` : Correction des espacements du footer de `AIModelSelector` et augmentation des marges horizontales des cartes de sélection (`px-4 sm:px-5 sm:py-4`).
    - [x] `TASK-MODEL-02.05` : Affichage proéminent et systématique du modèle d'IA utilisé sur les résultats de recherche (`ResultsSection`) et sur l'historique (`/history`).
    - [x] `TASK-MODEL-02.06` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🛡️ Sprint 40 Achevée : Sécurisation Native & Fiabilisation du Bookmarklet de Capture 1-Clic

- [x] **`TASK-CAPTURE-02` — Sécurisation Native du Bookmarklet 1-Clic (Bypass React 19 Sanitizer & Zero-Leak)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/data-source/CaptureAssistantModal.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-CAPTURE-02.01` : Élimination du blocage React 19 sur `javascript:` URLs via rattachement dynamique par ref native DOM (`bookmarkletAnchorRef.current.setAttribute('href', bookmarkletCode)`).
    - [x] `TASK-CAPTURE-02.02` : Support complet du Drag & Drop vers la barre de favoris du navigateur avec `dataTransfer.setData('text/uri-list', ...)` et `dataTransfer.setData('text/plain', ...)`.
    - [x] `TASK-CAPTURE-02.03` : Sécurité stricte du code bookmarklet : exécution purement locale dans le navigateur du client, extraction ciblée des annonces sans cookies ni transmission distante de tokens.
    - [x] `TASK-CAPTURE-02.04` : Notification toast guidance au clic direct pour assister l'utilisateur à glisser le bouton dans ses favoris (raccourci Ctrl+Shift+B).
    - [x] `TASK-CAPTURE-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🔍 Sprint 39 Achevée : Historique (Badge BYOK/Free, Modèle NVIDIA Solo & Grand Affichage Détails)

- [x] **`TASK-HISTORY-01` — Badge BYOK/Free, NVIDIA Modèle Gratuit Unique & Vue Détaillée Agrandie**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `prisma/schema.prisma`, `src/types/index.ts`, `src/app/history/page.tsx`, `src/hooks/use-search-history.ts`, `src/app/actions/db/history.ts`, `src/contexts/AnalysisContext.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-HISTORY-01.01` : Retrait de tous les modèles gratuits non fonctionnels dans `src/lib/ai-models.ts`, ne conservant que NVIDIA (`nvidia/nemotron-3.5-lightning:free`) comme unique modèle gratuit par défaut.
    - [x] `TASK-HISTORY-01.02` : Persistance et propagation de l'indicateur clé (`isByok: boolean`, `keyType: 'byok' | 'free'`) dans les modèles Prisma, types TypeScript et actions MongoDB Atlas.
    - [x] `TASK-HISTORY-01.03` : Affichage sur chaque carte `/history` d'un badge distinctif et visible indiquant si la recherche a été effectuée en "BYOK" ou "Free Key".
    - [x] `TASK-HISTORY-01.04` : Intégration d'un modal/dialogue grand format (`max-w-4xl max-h-[85vh]`) pour afficher confortablement les détails complets de la recherche.
    - [x] `TASK-HISTORY-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🚀 Sprint 38 Achevée : Refonte Onboarding (Retrait Test Fictif) & Visibilité Admin des Raisons d'Inscription

- [x] **`TASK-ONBOARD-01` — Streamlining Onboarding & Reporting Admin des Motifs d'Inscription**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/onboarding/page.tsx`, `src/app/actions/db/admin.ts`, `src/app/admin/page.tsx`, `src/app/api/profile/onboarding/route.ts`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-ONBOARD-01.01` : Retrait de l'étape de test d'analyse fictive/lente (`FirstSearchStep`) de l'onboarding au profit d'un parcours fluide en 4 étapes claires.
    - [x] `TASK-ONBOARD-01.02` : Persistance fiable du motif d'inscription (`useCase`) dans le profil MongoDB de l'utilisateur authentifié et en LocalStorage pour les sessions invité.
    - [x] `TASK-ONBOARD-01.03` : Extension de la Server Action `getRecentUsers` et `getSystemStats` pour inclure les motifs d'inscription (`useCase`) réels issus de la base de données.
    - [x] `TASK-ONBOARD-01.04` : Intégration dans le Dashboard Admin (`/admin`) d'un widget analytique visuel des causes d'inscription et affichage de la colonne "Domaine / Motif" dans la table des utilisateurs récents.
    - [x] `TASK-ONBOARD-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT (**< 250 lignes**), les tâches achevées sont archivées :
- 👉 **[Consulter l'Archive des Sprints 34 à 37 (TASKS_HISTORY_S34_S36_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S34_S36_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 25 à 33 (TASKS_HISTORY_S25_S33_COMPLETED.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S25_S33_COMPLETED.md)**
- 👉 **[Consulter l'Archive des Sprints 1 à 24 (TASKS_HISTORY_S10_COMPLETED.md & suivants)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S10_COMPLETED.md)**

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** (actuellement ~120 lignes).
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées sont transférées dans `docs/archive/tasks/`.
3. **Traçabilité des Audits :** Tout diagnostic découvrant des points d'amélioration consigne ses constats dans `docs/archive/reports/`.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `pnpm exec tsc --noEmit` et `pnpm run lint` à 0 erreur.
