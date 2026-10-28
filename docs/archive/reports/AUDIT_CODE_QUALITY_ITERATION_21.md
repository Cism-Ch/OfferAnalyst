# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 21

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Flux d'Authentification & Redirections : [`src/app/auth/login/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/login/page.tsx), [`src/app/auth/verify/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/verify/page.tsx), [`next.config.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/next.config.ts)
- Conformité Légale & Liens Orphelins : [`src/app/auth/signup/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/signup/page.tsx), [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx)
- Intégration Globale dans RootLayout : [`src/app/layout.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/layout.tsx), [`src/components/CookieConsent.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/CookieConsent.tsx), [`src/components/WebVitalsTracker.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/WebVitalsTracker.tsx)
- Synchronisation des Clés de Stockage : [`src/components/analytics/AnalyticsDashboard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/analytics/AnalyticsDashboard.tsx)
- Clarté du Modèle en Onboarding : [`src/components/onboarding/FirstSearchStep.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/onboarding/FirstSearchStep.tsx)

---

## 🎯 Objectif de la Revue
Neutraliser définitivement l'erreur 404 post-connexion vers `/dashboard`, restaurer la conformité légale en éliminant les liens 404 vers les conditions et politiques de confidentialité, monter les composants globaux dormants dans `RootLayout`, et aligner les clés de stockage locales du tableau de bord analytique.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🚨 Redirection 404 Systématique Post-Login & Vérification Email
- **Fichiers :**
  - [`src/app/auth/login/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/login/page.tsx#L48-L65) : `callbackURL: "/dashboard"` et `router.push("/dashboard")`.
  - [`src/app/auth/verify/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/verify/page.tsx#L58) : `router.push("/dashboard")`.
  - [`next.config.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/next.config.ts) : Aucune règle `redirects()` configurée.
- **Constat :**
  Le dossier `src/app/dashboard/` ne contient que des sous-dossiers (`analytics`, `api-keys`, `settings`, `support`, `workspace`) mais **aucun `page.tsx`**. La racine du tableau de bord réside sur `/`.
  Tout utilisateur qui se connecte ou valide son email est redirigé vers `/dashboard` et tombe sur un écran d'erreur 404.
- **Remède recommandé (`TASK-FIX-06`) :**
  1. Configurer une redirection permanente dans `next.config.ts` :
     ```ts
     async redirects() {
       return [
         { source: '/dashboard', destination: '/', permanent: true },
         { source: '/docs', destination: '/help', permanent: false }
       ];
     }
     ```
  2. Mettre à jour `callbackURL: "/"` et `router.push("/")` dans `login/page.tsx` et `verify/page.tsx`.

---

### 2. ⚖️ Liens Légaux & Documentation Cassés (Erreurs 404)
- **Fichiers :**
  - [`src/app/auth/signup/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/signup/page.tsx#L200-L206) : Liens obligatoires `<Link href="/terms">` et `<Link href="/privacy">`.
  - [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx#L411-L423) : Liens de pied de page vers `/docs`, `/privacy`, `/terms`, `/cookies`.
- **Constat :**
  Toutes ces routes mènent actuellement à une page 404 introuvable, alors que le contenu complet et formalisé existe déjà dans les documents du dépôt :
  - [`docs/PRIVACY_POLICY.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/PRIVACY_POLICY.md)
  - [`docs/TERMS_OF_SERVICE.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TERMS_OF_SERVICE.md)
- **Remède recommandé (`TASK-UX-24`) :**
  Créer les pages statiques légères `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` et `src/app/cookies/page.tsx` encapsulées dans `SimpleLayout`.

---

### 3. 🧩 Composants Dormants Non Montés dans `RootLayout`
- **Fichiers :**
  - [`src/app/layout.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/layout.tsx#L20-L36)
  - [`src/components/CookieConsent.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/CookieConsent.tsx) (309 lignes)
  - [`src/components/WebVitalsTracker.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/WebVitalsTracker.tsx) (53 lignes)
- **Constat :**
  Le composant `CookieConsent` implémente une bannière RGPD/CCPA complète avec choix granulaires de cookies. `WebVitalsTracker` collecte les métriques de performance Core Web Vitals (CLS, FCP, LCP, TTFB, INP).
  Aucun des deux n'est monté dans `src/app/layout.tsx`.
- **Remède recommandé (`TASK-UX-21` & `TASK-PERF-03`) :**
  Monter `<CookieConsent />` et `<WebVitalsTracker />` à l'intérieur de `ThemeProvider` dans `src/app/layout.tsx`.

---

### 4. 🗄️ Désynchronisation des Clés LocalStorage dans `AnalyticsDashboard.tsx`
- **Fichier :** [`src/components/analytics/AnalyticsDashboard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/analytics/AnalyticsDashboard.tsx#L73-L75)
- **Constat :**
  ```tsx
  localStorage.getItem('searchHistory')
  localStorage.getItem('savedOffers')
  localStorage.getItem('projects')
  ```
  Les hooks de l'application utilisent en réalité :
  - `offeranalyst_search_history` (`use-search-history.ts`)
  - `offeranalyst_saved_offers` (`use-saved-offers.ts`)
  - `offeranalyst_projects` (`use-projects.ts`)
- **Impact Utilisateur :**
  En mode invité ou lorsque l'API distante est inaccessible, les cartes d'indicateurs de recherche, d'offres sauvegardées et de projets affichent systématiquement 0 même si l'utilisateur possède des dizaines d'éléments enregistrés.
- **Remède recommandé (`TASK-FIX-08`) :**
  Harmoniser les clés de lecture de fallback avec les constantes de stockage de l'application.

---

### 5. 🎯 Mention de Modèle Obsolète dans la Démo Onboarding
- **Fichier :** [`src/components/onboarding/FirstSearchStep.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/onboarding/FirstSearchStep.tsx#L90)
- **Constat :**
  L'étape d'essai affiche `AI Model: GPT-4o Mini`. Le modèle par défaut du moteur OfferAnalyst est `Gemini 3.5 Flash Lite` (`DEFAULT_MODEL_ID`).
- **Remède recommandé (`TASK-UX-42`) :**
  Mettre à jour le libellé pour refléter le moteur standard `Gemini 3.5 Flash Lite (Inclus Gratuitement)`.

---

## 📋 Tableau Synthétique des Tâches Candidates Identifiées

| Identifiant | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-06`** | Routage / Serveur | 🔴 CRITIQUE | Redirection permanente 308 de `/dashboard` vers `/` et correction login | `next.config.ts`, `login/page.tsx`, `verify/page.tsx` |
| **`TASK-UX-24`** | Légal & Confiance | 🔴 HAUTE | Publication des pages légales `/privacy`, `/terms`, `/cookies` | `src/app/privacy/`, `src/app/terms/`, `src/app/cookies/` |
| **`TASK-UX-21`** | RGPD / Consentement | 🔴 HAUTE | Montage de `<CookieConsent />` et `<WebVitalsTracker />` dans `layout.tsx` | `src/app/layout.tsx` |
| **`TASK-FIX-08`** | Analytique / Données | 🟡 MOYENNE | Harmonisation des clés de stockage dans `AnalyticsDashboard.tsx` | `src/components/analytics/AnalyticsDashboard.tsx` |
| **`TASK-UX-42`** | Onboarding / UI | 🟢 BASSE | Harmonisation du modèle IA affiché dans `FirstSearchStep.tsx` | `src/components/onboarding/FirstSearchStep.tsx` |

---

## 🛡️ Vérification & Conformité
- **TypeScript (`npx tsc --noEmit`) :** Validé à **0 erreur** (Code retour 0).
- **ESLint (`npm run lint`) :** Validé à **0 erreur**.
- **Plafond SSOT [`docs/TASKS.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TASKS.md) :** Respect strict du plafond de 250 lignes (245 lignes actuelles).
