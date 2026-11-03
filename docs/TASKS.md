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
│ 🚀 EN COURS (SPRINT 43) │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] Prochain sprint     │  │ [ ] TASK-E2E-01 (Playw) │  │     - Sprint 42 (DDoS   │
│     à définir par       │  │ [ ] Chrome Store Publish│  │       5 req/m, Telemetry)│
│     l'utilisateur       │  │ [ ] Export PDF / CSV    │  │     - Sprint 41 (Modèles│
│                         │  │                         │  │       2/struct, Offline)│
│                         │  │                         │  │     - Sprints 1 à 40    │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

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
