# 📋 TASKS.md — Registre Central & Suivi Unifié des Tâches

> **Source Unique de Vérité (SSOT)** pour le pilotage et le suivi de toutes les tâches techniques et fonctionnelles du projet **OfferAnalyst**.  
> **Règle absolue pour tout Agent IA :** Ce document DOIT être consulté avant toute tâche et mis à jour immédiatement après chaque réalisation ou découverte de nouvelle sous-tâche.

**Dernière mise à jour :** 26 Octobre 2026  
**Responsable :** Équipe & Agents IA OfferAnalyst  
**Statut Global :** Phase 6 (Sprints 1 à 5 Archivés — Sprint 6 Expansion & Monétisation Actif)

---

## 📌 Vue Kanban Synthétique

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   🔴 SPRINT 6 (ACTIF)   │  │    🟢 BACKLOG FUTUR     │  │       ✅ TERMINÉ        │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ ] TASK-GROWTH-01      │  │ [ ] App Mobile (React   │  │ [x] TASK-AI-06          │
│     (Chrome Ext. MV3)   │  │     Native / Expo)      │  │     (Sélecteur Global)  │
│ [ ] TASK-GROWTH-02      │  │ [ ] Alertes Scraping    │  │ [x] TASK-AI-05          │
│     (Stripe Billing)    │  │     Automatisées        │  │     (Suivi LLM & Err.)  │
│ [ ] TASK-GROWTH-03      │  │ [ ] Multi-tenant Org    │  │ [x] TASK-AI-04          │
│     (Realtime Collab)   │  │                         │  │     (Gemini 3.5 & BYOK) │
│                         │  │                         │  │ [x] TASK-AI-03          │
│                         │  │                         │  │     (Nemotron 3.5 Light)│
│                         │  │                         │  │ [x] TASK-BRAND-02       │
│                         │  │                         │  │     (Lisibilité Logo/Th)│
│                         │  │                         │  │ [x] TASK-BRAND-01       │
│                         │  │                         │  │     (Offan, Emojis, UI) │
│                         │  │                         │  │ [x] TASK-THEME-01       │
│                         │  │                         │  │     (Audit & Fix Thèmes)│
│                         │  │                         │  │ [x] TASK-UX-01 (UI/UX)  │
│                         │  │                         │  │ [x] TASK-REL-01 (SemVer)│
│                         │  │                         │  │ [x] TASK-SEC-02 (Sécu)  │
│                         │  │                         │  │ [x] TASK-RSI-01(RSI/IA) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Sprint Actif : Sprint 6 — Expansion, RSI & Monétisation

### 📊 Observabilité FinOps, Télémétrie Tokens & Diagnostic de Santé des Modèles
> 📄 **Rapport d'Audit Télémétrie :** [Consulter le Rapport d'Audit & Télémétrie IA (AUDIT_TELEMETRIE_AI_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_TELEMETRIE_AI_2026-10-26.md)

- [x] **`TASK-AI-06` — Sélecteur de Modèle Universel (Toutes Pages) & Clarification BYOK / Passerelle OpenRouter**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/components/layout/AIModelSelector.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernLayout.tsx`, `src/components/layout/SimpleLayout.tsx`, `src/components/api-keys/AddAPIKeyDialog.tsx`, `src/contexts/AnalysisContext.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AI-06.01` : Composant autonome `AIModelSelector.tsx` connecté au singleton `AnalysisContext` avec filtres et redirection BYOK.
    - [x] `TASK-AI-06.02` : `ModernHeader.tsx` et `ModernLayout.tsx` fiabilisés pour afficher systématiquement le header avec le sélecteur de modèle sur toutes les pages.
    - [x] `TASK-AI-06.03` : Intégration du sélecteur de modèle dans la barre supérieure de `SimpleLayout.tsx` (`/search-context`, `/data-source`, `/analysis`).
    - [x] `TASK-AI-06.04` : Bannière explicative dans `AddAPIKeyDialog.tsx` clarifiant le rôle de la clé OpenRouter universelle vs clés spécifiques.
    - [x] `TASK-AI-06.05` : Résolution intelligente de `clientKey` dans `AnalysisContext.tsx` couvrant `openrouter` et les providers spécifiques.
    - [x] `TASK-AI-06.06` : Validation déterministe stricte (`npx tsc --noEmit` & `db_schema_validator.py` validés à 0 erreur).

- [x] **`TASK-AI-05` — Signalement d'Erreur Transparent, Suivi Temps Réel de l'État du Modèle LLM & Diagnostic Actionnable**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/types/index.ts`, `src/app/actions/shared/agent-utils.ts`, `src/contexts/AnalysisContext.tsx`, `src/components/offers/LiveAIStatusIndicator.tsx`, `src/components/offers/ProviderErrorPanel.tsx`, `src/app/analysis/page.tsx`, `src/app/data-source/page.tsx`, `src/app/layout.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AI-05.01` : Typage standardisé pour `LLMProgressState` et codes d'erreur granulaires (`src/types/index.ts`).
    - [x] `TASK-AI-05.02` : Détection et traduction en français clair des causes d'erreur OpenRouter (401, 402, 429, 503, timeout) avec remèdes (`agent-utils.ts`).
    - [x] `TASK-AI-05.03` : `AnalysisContext` global singleton pour partager la progression, chrono et résultats sans perte de contexte inter-pages.
    - [x] `TASK-AI-05.04` : Composants `LiveAIStatusIndicator` et `ProviderErrorPanel` avec remèdes en 1 clic.
    - [x] `TASK-AI-05.05` : Intégration sur `/analysis` et `/data-source` avec skeletons actifs et diagnostic.
    - [x] `TASK-AI-05.06` : Validation déterministe stricte (`npx tsc --noEmit` & `db_schema_validator.py`).

- [x] **`TASK-AI-04` — Modernisation du Registre IA : Gemini 3.5 Flash Lite par Défaut, Nemotron, Modèles Flagship Récents & Redirection BYOK**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `src/lib/ai-pricing.ts`, `src/components/layout/ModernHeader.tsx`, `src/components/api-keys/AddAPIKeyDialog.tsx`, `src/app/dashboard/api-keys/page.tsx`
  - **Critères d'acceptation :**
    - [x] `TASK-AI-04.01` : Registre `AI_MODEL_OPTIONS` modernisé avec Gemini 3.5 Flash Lite, Nemotron 3.5, Claude 3.7, GPT-4o, o3-mini, DeepSeek R1/V3, Kimi 2.6, Mistral.
    - [x] `TASK-AI-04.02` : Tarifs synchronisés dans `MODEL_PRICING_TABLE` (`src/lib/ai-pricing.ts`).
    - [x] `TASK-AI-04.03` : Redirection automatique vers `/dashboard/api-keys?action=add&provider=...` au clic sur un modèle Pro.
    - [x] `TASK-AI-04.04` : Détection de `action=add` dans `api-keys/page.tsx` pour ouvrir immédiatement le dialogue d'ajout.
    - [x] `TASK-AI-04.05` : Validation déterministe stricte (`npx tsc --noEmit` & `db_schema_validator.py`).

- [x] **`TASK-AI-03` — Intégration du Modèle NVIDIA Nemotron 3.5 Lightning (Free) dans le Registre IA & Pricing Engine**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/lib/ai-models.ts`, `src/lib/ai-pricing.ts`
  - **Critères d'acceptation :**
    - [x] `TASK-AI-03.01` : Enregistrer `nvidia/nemotron-3.5-lightning:free` dans `AI_MODEL_OPTIONS` avec métadonnées complètes (1M context, tier free, fast latency).
    - [x] `TASK-AI-03.02` : Enregistrer le modèle dans `MODEL_PRICING_TABLE` (`ai-pricing.ts`) avec tarification 0$.
    - [x] `TASK-AI-03.03` : Validation déterministe (`npx tsc --noEmit` & `db_schema_validator.py`).

- [x] **`TASK-AI-02` — Harmonisation Typage & Encapsulation Payload OpenRouter SDK v1.5+ sur les Server Actions**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/app/actions/analyze.ts`, `src/app/actions/analyzeV2.ts`, `src/app/actions/fetch.ts`, `src/app/actions/fetchV2.ts`, `src/app/actions/organize.ts`, `src/app/actions/organizeV2.ts`
  - **Critères d'acceptation :**
    - [x] `TASK-AI-02.01` : Encapsuler la payload dans l'objet `chatRequest` pour `openrouter.chat.send()` dans `analyzeV2.ts` et `analyze.ts`.
    - [x] `TASK-AI-02.02` : Encapsuler la payload dans `chatRequest` pour `fetch.ts` et `fetchV2.ts`.
    - [x] `TASK-AI-02.03` : Encapsuler la payload dans `chatRequest` pour `organize.ts` et `organizeV2.ts`.
    - [x] `TASK-AI-02.04` : Vérification déterministe stricte (`npx tsc --noEmit` validé à 0 erreur).

- [x] **`TASK-AI-01` — Observabilité FinOps, Télémétrie Tokens en Temps Réel & Diagnostic de Santé des Clés/Modèles**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `prisma/schema.prisma`, `src/lib/ai-pricing.ts`, `src/lib/openrouter-telemetry.ts`, `src/app/actions/shared/`, `src/app/actions/db/`, `src/components/api-keys/`, `src/app/dashboard/api-keys/`, `src/app/admin/page.tsx`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-AI-01.01` : Schéma Prisma & Service API OpenRouter (`/auth/key` & `/models` pour fetch temps réel du quota, solde $ et tarification dynamique des tokens).
    - [x] `TASK-AI-01.02` : Pipeline de capture unifié (`captureAITelemetry`) dans `src/app/actions/fetch.ts`, `organize.ts` et `organizeV2.ts` extrayant `usage.prompt_tokens` et `usage.completion_tokens`.
    - [x] `TASK-AI-01.03` : Server Actions de diagnostic de santé (`testAPIKeyHealth`) sans fuite de secrets avec signalétique d'état (🟢 Opérationnel, 🟡 Dégradé/Quota, 🔴 Invalide).
    - [x] `TASK-AI-01.04` : Interface Utilisateur BYOK (`/dashboard/api-keys`) : pastilles d'état lumineuses, bouton "Diagnostiquer", indicateur de solde OpenRouter en $ en temps réel, dashboard de tokens par modèle.
    - [x] `TASK-AI-01.05` : Interface Admin (`/admin`) connectée aux données réelles : KPIs plateforme, volume global de tokens (Shared vs BYOK), matrice de disponibilité et latence des modèles.
    - [x] `TASK-AI-01.06` : Rapport d'audit de télémétrie, mise à jour méta-cognitive et validation déterministe (`npm run eval:quick` 100/100).

### 💎 Identité de Marque 'Offan', Tracking Emojis & Refonte UI des Sélecteurs
> 📄 **Rapport d'Audit Marque & UI :** [Consulter le Rapport d'Audit & Tracking Emojis/Design (AUDIT_EMOJI_BRAND_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_EMOJI_BRAND_2026-10-26.md)

- [x] **`TASK-BRAND-02` — Perfectionnement Esthétique : Cercles de Thème avec Contraste Optimal (Noir/Blanc) & Lisibilité Multi-Thèmes du Logo Offan**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/components/theme-selector.tsx`, `src/components/brand/OffanBrand.tsx`, `src/components/layout/ModernSidebar.tsx`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-BRAND-02.01` : Correction de la syntaxe CSS du SVG Offan (`var(--primary)` au lieu de `hsl(#...)`, tracé transparent découpé `fillRule="evenodd"` sans faux fond opaque, adaptation de contraste).
    - [x] `TASK-BRAND-02.02` : Refonte des pastilles du sélecteur de thème en cercles colorés (`rounded-full`) contenant l'icône dans la couleur de contraste idéale (noir sur thèmes clairs : Light, Silver ; blanc sur thèmes sombres/colorés : Dark, Gold, Neon, Ocean, Forest, System).
    - [x] `TASK-BRAND-02.03` : Harmonisation du bouton déclencheur avec mini-cercle et icône assortie.
    - [x] `TASK-BRAND-02.04` : Validation déterministe (`npm run eval:quick` 100/100).

- [x] **`TASK-BRAND-01` — Identité de Marque 'Offan', Élimination des Emojis OS & Refonte des Sélecteurs (Thème & IA)**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/components/brand/OffanBrand.tsx`, `src/components/theme-selector.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/components/onboarding/`, `src/components/api-keys/`, `src/app/help/page.tsx`, `src/app/dashboard/support/page.tsx`, `src/app/data-source/page.tsx`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-BRAND-01.01` : Tracking et élimination des emojis natifs OS dans l'UI au profit d'icônes Lucide sémantiques.
    - [x] `TASK-BRAND-01.02` : Création du logo vectoriel géométrique typographique 'Offan' (`src/components/brand/OffanBrand.tsx`) & génération de l'icône raster 2026.
    - [x] `TASK-BRAND-01.03` : Intégration de l'icône 'Offan' dans `ModernSidebar.tsx`, `Sidebar.tsx` et métadonnées d'en-tête.
    - [x] `TASK-BRAND-01.04` : Refonte visuelle et interactive du sélecteur de thème avec glassmorphism, sections et pastilles de prévisualisation vivantes (`theme-selector.tsx`).
    - [x] `TASK-BRAND-01.05` : Refonte visuelle du sélecteur d'IA avec badges providers, indicateurs de tier (Free/Pro/BYOK) et onglets de filtrage (`ModernHeader.tsx`).
    - [x] `TASK-BRAND-01.06` : Rapport d'audit exhaustif, mise à jour méta-cognitive et validation déterministe (`npm run eval:quick` 100/100).

### 🎨 Audit & Restructuration du Moteur Multi-Thèmes
> 📄 **Rapport d'Audit Thèmes :** [Consulter le Rapport d'Audit & Tracking Thèmes (AUDIT_THEMES_ENGINE_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_THEMES_ENGINE_2026-10-26.md)

- [x] **`TASK-THEME-01` — Audit & Restructuration Complète du Moteur de Thèmes (Next-Themes, HSL, Tailwind v4)**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/theme-selector.tsx`, `src/components/theme-toggle.tsx`, `src/components/layout/SimpleLayout.tsx`, `src/app/history/page.tsx`, `src/app/projects/page.tsx`, `src/app/saved/page.tsx`, `src/app/compare/page.tsx`, `src/components/layout/Sidebar.tsx`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-THEME-01.01` : Fournir la liste explicite des thèmes supportés à `ThemeProvider` pour garantir la persistance et l'hydratation SSR (`src/app/layout.tsx`).
    - [x] `TASK-THEME-01.02` : Compléter intégralement les tokens HSL manquants pour le thème `.gold` et affiner la palette `.silver` dans `src/app/globals.css`.
    - [x] `TASK-THEME-01.03` : Étendre `@custom-variant dark` pour inclure `.neon` et les thèmes sombres afin que les classes `dark:...` fonctionnent sous Tailwind v4.
    - [x] `TASK-THEME-01.04` : Supprimer les classes en dur résiduelles (`bg-white dark:bg-zinc-900`, `bg-slate-50`) au profit des tokens sémantiques `bg-card`, `text-card-foreground`, `bg-muted`.
    - [x] `TASK-THEME-01.05` : Intégrer `PremiumThemeSelector` dans `SimpleLayout.tsx` et fiabiliser `src/components/theme-toggle.tsx`.
    - [x] `TASK-THEME-01.06` : Rédiger le rapport d'audit exhaustif et valider par `npm run eval:quick` (score 100/100).

### 📱 Audit & Remédiation UI/UX & Responsive Mobile-First (2026)
> 📄 **Rapport d'Audit UI/UX :** [Consulter le Rapport d'Audit & Tracking d'Inconformités (AUDIT_UIUX_RESPONSIVE_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_UIUX_RESPONSIVE_2026-10-26.md)

- [x] **`TASK-UX-01` — Audit Exhaustif & Refonte Responsive Mobile-First des Interfaces**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/components/layout/`, `src/components/offers/`, `src/components/ui/`, `src/app/`, `src/app/globals.css`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-UX-01.01` : Élimination du chevauchement hamburger/breadcrumbs et refonte barre d'actions responsive (`ModernSidebar.tsx`, `ModernHeader.tsx`, `SimpleLayout.tsx`).
    - [x] `TASK-UX-01.02` : Harmonisation des vues secondaires avec `SimpleLayout` et design tokens dynamiques (`history`, `saved`, `compare`, `projects`).
    - [x] `TASK-UX-01.03` : Cibles tactiles >= 44px et grilles adaptatives mobile-first (`OfferCard.tsx`, `ConfigurationCard.tsx`).
    - [x] `TASK-UX-01.04` : Sécurisation anti-débordement des flux et barres d'actions (`search-context`, `data-source`, modals `dialog.tsx`).
    - [x] `TASK-UX-01.05` : Wrap des clés API & adaptation des graphiques Recharts aux écrans étroits (`ScoreChart.tsx`, `AnalyticsDashboard.tsx`, `admin/page.tsx`).
    - [x] `TASK-UX-01.06` : Support Safe-Area Insets iOS et hygiène CSS mobile (`globals.css`, `CookieConsent.tsx`, `onboarding`).
    - [x] `TASK-UX-01.07` : Publication du rapport d'audit exhaustif et consolidation méta-cognitive dans `fullstack_playbook.md`.

### 📦 Release Management & Versioning Automatique

- [x] **`TASK-REL-01` — Système Automatisé de Release & Versioning SemVer**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `evals/version_manager.py`, `package.json`, `.agents/workflows/rsi-feature.md`, `.github/workflows/ci.yml`, `CHANGELOG.md`
  - **Critères d'acceptation :**
    - [x] Script autonome `evals/version_manager.py` (détection `auto`/`patch`/`minor`/`major`, scellement CHANGELOG, git tag).
    - [x] Scripts npm dans `package.json` (`version:bump`, `version:check`).
    - [x] Intégration dans la Phase 4 du protocole RSI (`rsi-feature.md`).
    - [x] Intégration CI GitHub Actions (`.github/workflows/ci.yml`) pour validation des tags de release.
    - [x] Exécution et validation du premier bump officiel (v1.0.0 scellée avec succès).

### 🛡️ Audit & Durcissement de Sécurité (Fullstack)
> 📄 **Rapport d'Audit Complet :** [Consulter le Rapport Exhaustif des 10 Vulnérabilités (AUDIT_SECURITE_FULLSTACK_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_SECURITE_FULLSTACK_2026-10-26.md)

- [x] **`TASK-SEC-02` — Audit Complet de Sécurité & Remédiation Fullstack (10 Vulnérabilités)**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `middleware.ts`, `src/lib/auth.ts`, `src/lib/webhooks.ts`, `src/app/actions/`, `src/app/api/`, `next.config.ts`
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-SEC-02.01` : Bypassing middleware `startsWith('/')` corrigé & `/admin` protégé ([middleware.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/middleware.ts)).
    - [x] `TASK-SEC-02.02` : Fuite RPC `OPENROUTER_API_KEY` supprimée (déclassification serveur de [api-key-provider.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/shared/api-key-provider.ts)).
    - [x] `TASK-SEC-02.03` : Action publique `getDecryptedAPIKey` supprimée de la surface RPC ([api-keys.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-keys.ts)).
    - [x] `TASK-SEC-02.04` : Vérification RBAC admin sur feature flags et actions d'administration ([admin.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/admin.ts), `/api/admin/feature-flags`).
    - [x] `TASK-SEC-02.05` : Usurpation d'alertes emails bloquée (déclassification serveur de [email-notifications.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/email-notifications.ts)).
    - [x] `TASK-SEC-02.06` : Faille IDOR éliminée sur les clés API et rotations ([api-keys.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-keys.ts), [api-key-rotation.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-key-rotation.ts)).
    - [x] `TASK-SEC-02.07` : Faille IDOR éliminée sur les alertes de sécurité ([security-alerts.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/security-alerts.ts)).
    - [x] `TASK-SEC-02.08` : Faille IDOR éliminée sur les métriques et KPIs ([analytics.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/analytics.ts), [api-key-analytics.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-key-analytics.ts)).
    - [x] `TASK-SEC-02.09` : Validateur Anti-SSRF strict implémenté pour les webhooks sortants ([webhooks.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/webhooks.ts)).
    - [x] `TASK-SEC-02.10` : CSP Next.js configurée & mode fail-closed en production ([next.config.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/next.config.ts), `/api/jobs`, [auth.ts](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/auth.ts)).

### 🧠 Protocole RSI & Méta-Gouvernance IA

- [x] **`TASK-RSI-01` — Implémentation du Protocole RSI & Méta-Gouvernance IA**
  - **Priorité :** 🔴 CRITIQUE
  - **Livrables :** `.agents/rules/`, `.agents/prompts/`, `.agents/workflows/`, `evals/`, `Agent.md`, `AGENTS.md`, `package.json`

### 🌐 Extension Web, Facturation Stripe & Collaboration

- [ ] **`TASK-GROWTH-01` — Extension Navigateur Chrome / Edge (Manifest V3)**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `extension/manifest.json`, `extension/src/content.ts`, `extension/src/popup.tsx`

- [ ] **`TASK-GROWTH-02` — Facturation Stripe, Quotas & Plans Freemium/Pro**
  - **Priorité :** 🟡 HAUTE
  - **Fichiers cibles :** `src/lib/stripe.ts`, `src/app/api/billing/webhook/route.ts`, `src/app/dashboard/billing/page.tsx`

- [ ] **`TASK-GROWTH-03` — Collaboration Temps Réel & Partage de Projets Multi-Utilisateurs**
  - **Priorité :** 🟢 MOYENNE
  - **Fichiers cibles :** `src/app/projects/[id]/page.tsx`, `src/lib/realtime.ts`

---

## 📚 Archives & Historique Détaillé

Pour préserver la compacité et la clarté du document SSOT, les tâches antérieures sont archivées :
- 👉 **[Consulter l'Archive Complète des Tâches des Sprints 1 à 5 (TASKS_HISTORY_S1_S5.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/tasks/TASKS_HISTORY_S1_S5.md)**
- 👉 **[Consulter le Rapport d'Audit UI/UX & Responsive (AUDIT_UIUX_RESPONSIVE_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_UIUX_RESPONSIVE_2026-10-26.md)**
- 👉 **[Consulter le Rapport d'Audit de Sécurité Approfondi (AUDIT_SECURITE_FULLSTACK_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_SECURITE_FULLSTACK_2026-10-26.md)**

---

## ✅ Historique Récent des Tâches Terminées (Sprint 6)

| Date | ID | Intitulé & Description | Livrables / PR |
| :--- | :--- | :--- | :--- |
| **2026-10-28** | `TASK-AI-06` | Sélecteur de Modèle Universel (Toutes Pages) & Clarification Pédagogique Passerelle OpenRouter | AIModelSelector.tsx, ModernHeader, ModernLayout, SimpleLayout, AddAPIKeyDialog, AnalysisContext |
| **2026-10-28** | `TASK-AI-05` | Suivi Visuel Live du LLM (Chrono, Étapes) & Centre de Diagnostic d'Erreur avec Remèdes 1-Clic | types/index.ts, agent-utils.ts, AnalysisContext, LiveAIStatusIndicator, ProviderErrorPanel, layout.tsx, analysis/page |
| **2026-10-28** | `TASK-AI-04` | Registre IA Flagships Récents (Gemini 3.5, Nemotron, Claude 3.7, GPT-4o, R1, Kimi) & Redirection BYOK | ai-models.ts, ai-pricing.ts, ModernHeader, AddAPIKeyDialog, api-keys/page |
| **2026-10-28** | `TASK-AI-03` | Intégration Modèle NVIDIA Nemotron 3.5 Lightning (Free) | ai-models.ts, ai-pricing.ts |
| **2026-10-27** | `TASK-AI-02` | Harmonisation Typage & Encapsulation Payload OpenRouter SDK v1.5+ sur Server Actions | analyze.ts, analyzeV2.ts, fetch.ts, fetchV2.ts, organize.ts, organizeV2.ts |
| **2026-10-26** | `TASK-AI-01` | Observabilité FinOps, Télémétrie Tokens en Temps Réel & Diagnostic Santé Clés | [Rapport Télémétrie](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_TELEMETRIE_AI_2026-10-26.md), openrouter-telemetry, ai-pricing, BYOK & Admin |
| **2026-10-26** | `TASK-BRAND-02` | Perfectionnement Cercles de Thème (Noir/Blanc) & Lisibilité Logo Offan | theme-selector.tsx, OffanBrand.tsx, ModernSidebar.tsx |
| **2026-10-26** | `TASK-BRAND-01` | Identité de Marque 'Offan', Élimination Emojis OS & Refonte Sélecteurs | [Rapport Brand & UI](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_EMOJI_BRAND_2026-10-26.md), OffanBrand.tsx, theme-selector, ModernHeader |
| **2026-10-26** | `TASK-THEME-01` | Audit & Restructuration du Moteur Multi-Thèmes (Next-Themes, HSL, Tailwind v4) | [Rapport Thèmes](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_THEMES_ENGINE_2026-10-26.md), layout.tsx, globals.css, theme-selector |
| **2026-10-26** | `TASK-UX-01` | Audit & Refonte Responsive Mobile-First (WCAG 2.1 AA, 44px, Grilles, Insets) | [Rapport UI/UX](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_UIUX_RESPONSIVE_2026-10-26.md), Layouts, Recharts, globals.css |
| **2026-10-26** | `TASK-REL-01` | Système Automatisé de Release & Versioning SemVer (v1.0.0 scellée) | `evals/version_manager.py`, `package.json`, `.github/workflows/ci.yml`, `rsi-feature.md` |
| **2026-10-26** | `TASK-SEC-02` | Audit & Remédiation Fullstack de 10 vulnérabilités (Auth, RPC, IDOR, SSRF, CSP) | [Rapport Détaillé](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_SECURITE_FULLSTACK_2026-10-26.md), `middleware.ts`, `auth.ts`, `webhooks.ts`, etc. |
| **2026-10-26** | `TASK-RSI-01` | Protocole RSI : juge déterministe, orchestrateur, méta-prompts et playbook évolutif | `.agents/rules/`, `.agents/prompts/`, `.agents/workflows/`, `evals/`, `Agent.md`, `AGENTS.md`, `package.json` |

---

## 📜 Protocole d'Hygiène & Archivage Dynamique (Markdown Rollover)

1. **Plafond Strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes** afin d'éviter l'épuisement de contexte des agents.
2. **Archivage Systématique :** Dès qu'un Sprint est achevé, ses tâches détaillées et son historique sont transférés dans `docs/archive/tasks/TASKS_HISTORY_SX.md`.
3. **Traçabilité des Audits :** Tout diagnostic ou audit découvrant plus de 3 sous-points DOIT produire un rapport complet dans `docs/archive/reports/` et détailler ses sous-identifiants (`TASK-DOM-XX.01`, etc.) dans la tâche mère.
4. **Validation Technique Obligatoire :** Aucune tâche n'est marquée `[x]` sans `npx tsc --noEmit` et `npm run lint` à 0 erreur.
