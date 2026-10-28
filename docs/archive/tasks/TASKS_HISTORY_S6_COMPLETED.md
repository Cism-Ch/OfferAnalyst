# 📦 Archive des Tâches — Sprint 6 (Expansion, RSI & Durcissement)

> **Statut :** Archivé  
> **Source de Vérité Principale :** [`docs/TASKS.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TASKS.md)  
> **Période :** 26 Octobre 2026 – 28 Octobre 2026  
> **Résultat :** 13/13 Tâches Stratégiques Achevées & Validées Déterministement (v1.0.0 SemVer Scellée)

---

## 📊 Observabilité FinOps, Télémétrie Tokens & Diagnostic de Santé des Modèles
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

---

## 💎 Identité de Marque 'Offan', Tracking Emojis & Refonte UI des Sélecteurs
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

---

## 🎨 Moteur Multi-Thèmes & Refonte Responsive Mobile-First
> 📄 **Rapports d'Audit Dédiés :** [Thèmes (AUDIT_THEMES_ENGINE_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_THEMES_ENGINE_2026-10-26.md) | [UI/UX Responsive (AUDIT_UIUX_RESPONSIVE_2026-10-26.md)](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/archive/reports/AUDIT_UIUX_RESPONSIVE_2026-10-26.md)

- [x] **`TASK-THEME-01` — Audit & Restructuration Complète du Moteur de Thèmes (Next-Themes, HSL, Tailwind v4)**
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-THEME-01.01` à `.06` : Fournir la liste explicite des thèmes, compléter les tokens HSL `.gold` et `.silver`, étendre `@custom-variant dark` pour `.neon`, éliminer les classes en dur résiduelles et intégrer `PremiumThemeSelector` dans `SimpleLayout.tsx`.

- [x] **`TASK-UX-01` — Audit Exhaustif & Refonte Responsive Mobile-First des Interfaces (WCAG 2.1 AA)**
  - **Sous-tâches unitaires vérifiées :**
    - [x] `TASK-UX-01.01` à `.07` : Élimination du chevauchement hamburger/breadcrumbs, harmonisation `SimpleLayout`, cibles tactiles >= 44px, wrap de clés API, graphiques Recharts fluides, safe-area insets iOS (`globals.css`, `CookieConsent.tsx`, `onboarding`).

---

## 📦 Release Management, Sécurité & Méta-Gouvernance RSI

- [x] **`TASK-REL-01` — Système Automatisé de Release & Versioning SemVer (v1.0.0 Scellée)**
  - Script autonome `evals/version_manager.py`, scripts `version:bump`/`version:check`, intégration CI GitHub Actions et premier bump officiel validé.

- [x] **`TASK-SEC-02` — Audit Complet de Sécurité & Remédiation Fullstack (10 Vulnérabilités Neutralisées)**
  - Bypassing middleware corrigé, fuite RPC `OPENROUTER_API_KEY` supprimée, action publique `getDecryptedAPIKey` supprimée, vérification RBAC admin sur feature flags, usurpation d'alertes email bloquée, failles IDOR éliminées sur clés API/alertes/métriques, validateur anti-SSRF strict et CSP Next.js fail-closed en production.

- [x] **`TASK-RSI-01` — Implémentation du Protocole RSI & Méta-Gouvernance IA**
  - Juge déterministe (`run_fullstack_eval.py`), orchestrateur, boucle méta-cognitive proactive et playbook évolutif.
