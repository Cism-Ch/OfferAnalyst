# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche. Plafond strict : **250 lignes**.

**Dernière mise à jour :** 28 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Sprint 14 Achevé & Validé (Audit Multi-Domaines : Auth, Guest Flow, Sécurité, IA & UX — 100/100) — Sprints 1 à 14 Archivés | Sprint 15 en Préparation

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ 🔄 SPRINT 15 EN COURS   │  │   ⏳ BACKLOG FUTUR      │  │       ✅ ARCHIVES       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [x] TASK-AUTH-01 (M1)   │  │ [ ] SPRINT 16 (E2E &    │  │     - Sprint 14 (4)     │
│ [x] TASK-AUTH-02 (M2)   │  │     Observabilité IA)   │  │     - Sprint 13 (5)     │
│ [x] TASK-AUTH-03 (M3)   │  │                         │  │     - Sprint 12 (4)     │
│ [x] TASK-AUTH-04 (M4)   │  │                         │  │     - Sprint 11 (5)     │
│ [ ] TASK-EXP-01 (PDF/CSV│  │                         │  │     - Sprints 1-10 (All)│
│ [ ] TASK-EXP-02 (Share) │  │                         │  │                         │
│ [ ] TASK-EXP-03 (UI/A11y│  │                         │  │                         │
│ [ ] TASK-EXP-04 (Eval)  │  │                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 15 — Auth & User Journeys (M1, M2, M3 & M4) & Export / Partage Collaboratif

- [x] **`TASK-AUTH-01` — Schéma Prisma, Configuration Better-Auth & Hygiène de l'Outillage**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `.env.local`, `eslint.config.mjs`, `prisma/schema.prisma`, `src/lib/auth.ts`, `src/app/error/page.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-01.01` : Élimination du masquage des identifiants Google OAuth dans `.env.local` sans suppression de variables.
    - [x] `TASK-AUTH-01.02` : Optimisation ESLint (`docs/**`, `tests/**`, `scripts/**` dans `globalIgnores`, cache activé `eslint --cache`, timeout étendu à 240s dans l'évaluateur).
    - [x] `TASK-AUTH-01.03` : Alignement schéma Prisma (`User.emailVerified: Boolean`, élimination du risque de collision null MongoDB sur `Account`, unique `[providerId, accountId]`) et régénération du client.
    - [x] `TASK-AUTH-01.04` : Configuration Better-Auth (`accountLinking: ["google", "github"]`, `onAPIError.errorURL: "/auth/login"`, `google.prompt: "select_account"`, `accessType: "offline"`).
    - [x] `TASK-AUTH-01.05` : Création de la page de secours défensive `/error/page.tsx` évitant toute erreur 404 en cas d'échec ou d'annulation OAuth.
    - [x] `TASK-AUTH-01.06` : Validation déterministe avec `npx tsc --noEmit`, `npm run lint` et `npm run eval:quick` (Score 100/100, PASS, 0 erreur).

- [x] **`TASK-AUTH-02` — Protection des Routes, Middleware & Expérience Utilisateur OAuth (M2)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `middleware.ts`, `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`, `src/components/auth/FluidAuthModal.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/contexts/LanguageContext.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-02.01` : Détection résiliente de cookie de session dans `middleware.ts` pour `offeranalyst.session_token` et `__Secure-offeranalyst.session_token` avec validation de chaîne non-vide (anti-bypass de cookie vide et priorité multi-cookies).
    - [x] `TASK-AUTH-02.02` : Déverrouillage de la route `/history` pour les invités sans compte, tout en préservant l'URL cible via le paramètre de retour `from`.
    - [x] `TASK-AUTH-02.03` : Prise en charge du paramètre `from` dans `getCallbackUrl()` de `login/page.tsx` avec assainissement strict anti-open-redirect (`isSafeRelativeUrl`) et transmission de `errorCallbackURL: "/auth/login"` dans `signIn.social`.
    - [x] `TASK-AUTH-02.04` : Capture des erreurs OAuth (`access_denied`, `account_not_linked`, `OAuthCallbackError`, `configuration`, `verification`) avec affichage bilingue FR/EN (alerte motion + toast) et encapsulation `<Suspense>`.
    - [x] `TASK-AUTH-02.05` : Création du modal d'authentification fluide `FluidAuthModal.tsx` et intégration dans `ModernSidebar.tsx` pour intercepter les clics invités sur `/saved` et `/projects`.
    - [x] `TASK-AUTH-02.06` : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests adversariaux M2 100% PASS).

- [x] **`TASK-AUTH-03` — Parcours Invité, Clé API 24h Chiffrée & Quotas Quotidiens Stricts (M3)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/lib/api-key-encryption.ts`, `src/app/actions/shared/guest-api-key.ts`, `src/app/actions/shared/api-key-provider.ts`, `src/app/actions/shared/quota-limiter.ts`, `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`, `src/components/api-keys/GuestApiKeyDialog.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/app/data-source/page.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-03.01` : Actions serveur `guest-api-key.ts` avec chiffrement `AES-256-GCM` et stockage en cookie `offeranalyst.guest_key` HttpOnly/Secure 24h (zéro fuite de clé en clair).
    - [x] `TASK-AUTH-03.02` : Ordre de résolution strict dans `getAPIKey` (1. DB BYOK -> 2. Cookie Chiffré Invité -> 3. Client Key -> 4. Fallback Env).
    - [x] `TASK-AUTH-03.03` : Limiteur de quota strict (10 recherches/jour, fenêtre UTC, cookie `offeranalyst.guest_id`, contournement BYOK illimité) et injection dans `fetch` & `analyze`.
    - [x] `TASK-AUTH-03.04` : Composant modal `GuestApiKeyDialog.tsx` avec compte à rebours 24h, aperçu masqué et révocation immédiate.
    - [x] `TASK-AUTH-03.05` : Indicateurs de quota en temps réel dans `ModernHeader.tsx` (badge Zap) et widget progress bar dans `ModernSidebar.tsx`.
    - [x] `TASK-AUTH-03.06` : Intégration sur `/data-source` avec désactivation préventive en cas de quota épuisé et CTA vers clé BYOK ou inscription.
    - [x] `TASK-AUTH-03.07` : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests empiriques adversariaux M3 100% PASS).

- [x] **`TASK-AUTH-04` — Double Stockage de l'Historique de Recherche & Rétention Cloud (M4)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/app/actions/db/history.ts`, `src/hooks/use-search-history.ts`, `src/hooks/use-unified-search-history.ts`, `src/app/api/cron/cleanup-history/route.ts`, `src/app/history/page.tsx`, `src/contexts/AnalysisContext.tsx`, `src/types/index.ts`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-04.01` : Actions serveur `src/app/actions/db/history.ts` avec validation Zod, protection IDOR stricte (confinement au `session.user.id`) et pattern `{ success, data, error }`.
    - [x] `TASK-AUTH-04.02` : Hook unifié `use-search-history.ts` avec double stockage : localStorage avec TTL 7 jours (`offeranalyst_guest_search_history`, purge auto) pour les invités vs persistance MongoDB Atlas pour les connectés.
    - [x] `TASK-AUTH-04.03` : Migration automatique de l'historique invité local vers MongoDB Atlas lors de la connexion/inscription (`migrateGuestSearchesAction`) avec déduplication et nettoyage localStorage.
    - [x] `TASK-AUTH-04.04` : Endpoint CRON de rétention `/api/cron/cleanup-history` (GET/POST) avec authentification `CRON_SECRET` / QStash, supprimant les recherches non épinglées > 90 jours tout en préservant indéfiniment les recherches épinglées.
    - [x] `TASK-AUTH-04.05` : Intégration transparente dans l'interface `/history` (bannière de statut dual-storage, badges d'expiration TTL 7j, restauration sécurisée) et dans `AnalysisContext.tsx`.
    - [x] `TASK-AUTH-04.06` : Validation déterministe (`npx tsc --noEmit`, `npm run lint`, `npm run eval:quick` 100/100 PASS, tests adversariaux M4 100% PASS).

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
