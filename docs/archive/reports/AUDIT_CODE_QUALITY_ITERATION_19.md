# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 19

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Routage Serveur & Redirections : `next.config.ts`, `src/app/auth/login/page.tsx`
- Conformité RGPD & Bannières : `src/components/CookieConsent.tsx`, `src/app/layout.tsx`
- Composants de Retour & Notifications : `src/components/ui/toast.tsx`, `src/components/ErrorBoundary.tsx`
- Gestion des Clés API (BYOK) & Modales Natives : `src/app/dashboard/api-keys/page.tsx`, `src/components/api-keys/AddAPIKeyDialog.tsx`
- Hydratation & Placeholders SSR : `src/components/ClientOnlySelect.tsx`, `src/components/ClientOnlySwitch.tsx`

---

## 🎯 Objectif de la Revue
Éliminer les avertissements ESLint résiduels, activer les briques techniques existantes non montées (bannière RGPD), corriger les erreurs de rendu CSS en mode sombre (barre de progression Toast) et supprimer les popups modaux natifs bloquants (`confirm()`).

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🛡️ Absence de Redirection Serveur Déterministe pour `/dashboard` dans `next.config.ts`
- **Fichiers :**
  - [`next.config.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/next.config.ts)
  - [`src/app/auth/login/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/login/page.tsx#L48-L65)
  - [`src/app/auth/verify/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/verify/page.tsx#L58)
- **Constat :**
  Bien que les formulaires d'authentification puissent rediriger vers `/`, de nombreux liens d'anciennes versions, favoris de navigateurs ou callbacks OAuth peuvent encore cibler `/dashboard`.
  Comme `src/app/dashboard/` ne possède aucun `page.tsx` (le tableau de bord principal réside à la racine `/`), toute requête directe vers `/dashboard` provoque une erreur 404.
- **Remède recommandé (`TASK-FIX-06`) :**
  Ajouter une règle permanente dans `next.config.ts` :
  ```ts
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  }
  ```

---

### 2. 🍪 Bannière RGPD `CookieConsent.tsx` (309 lignes) Non Montée dans `RootLayout`
- **Fichiers :**
  - [`src/components/CookieConsent.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/CookieConsent.tsx)
  - [`src/app/layout.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/layout.tsx#L20-L36)
- **Constat :**
  Le composant `CookieConsent` est un module abouti de 309 lignes avec gestion granulaire des préférences (Nécessaires, Fonctionnels, Analytiques, Marketing), conformité RGPD/CCPA et persistance locale.
  Pourtant, il n'est **jamais instancié** dans `RootLayout`.
- **Impact Utilisateur :**
  Absence de conformité légale visible et impossibilité pour l'utilisateur de configurer ses choix de cookies.
- **Remède recommandé (`TASK-UX-21`) :**
  Monter `<CookieConsent />` dans `src/app/layout.tsx` à l'intérieur de `ThemeProvider`.

---

### 3. 🎨 Bug de Remplacement Regex sur la Barre de Progression Toast en Mode Sombre
- **Fichier :** [`src/components/ui/toast.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ui/toast.tsx#L103-L111)
- **Constat :**
  ```tsx
  className={cn('h-1', iconColors[type].replace('text-', 'bg-'))}
  ```
  `iconColors[type]` vaut par exemple `'text-green-600 dark:text-green-400'`.
  En JavaScript, `String.prototype.replace('text-', 'bg-')` sans drapeau global `/g` ne remplace que la **première occurrence**.
  La classe résultante est `'bg-green-600 dark:text-green-400'`.
  En mode sombre, `dark:text-green-400` ne définit pas la couleur de fond mais la couleur du texte, laissant la barre de progression sans fond adapté au mode sombre.
- **Remède recommandé (`TASK-UX-35`) :**
  Remplacer par `.replace(/text-/g, 'bg-')` ou une table explicite `progressColors`.

---

### 4. ⚠️ Avertissement ESLint Next.js dans `ErrorBoundary.tsx`
- **Fichier :** [`src/components/ErrorBoundary.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ErrorBoundary.tsx#L115-L120)
- **Constat :**
  ```tsx
  <Button onClick={() => window.location.href = '/'} variant="outline">
      Go to Home
  </Button>
  ```
  Déclenche la règle ESLint `@next/next/no-location-assign-relative-destination`.
  L'assignation directe force un rechargement complet de la page au lieu d'une navigation fluide Next.js.
- **Remède recommandé (`TASK-UX-22`) :**
  Utiliser `<Button asChild variant="outline"><Link href="/">Go to Home</Link></Button>`.

---

### 5. 🔲 Dialogues Bloquants `confirm()` sur la Page des Clés API (`/dashboard/api-keys`)
- **Fichier :** [`src/app/dashboard/api-keys/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/api-keys/page.tsx#L251-L256)
- **Constat :**
  - Copier un aperçu de clé déclenche `confirm('Copy full API key to clipboard?...')` alors que la vraie clé est masquée côté serveur (`keyPreview`).
  - La suppression déclenche un `confirm()` natif du navigateur, qui gèle les animations et bloque les utilisateurs sur les navigateurs mobiles stricts (iOS Safari).
- **Remède recommandé (`TASK-UX-36`) :**
  Remplacer les alertes par une copie directe avec notification Sonner et une confirmation via modale Shadcn ou toast avec option d'annulation.

---

### 6. 🌓 Flash de Couleur Incompatible Multi-Thèmes dans `ClientOnlySwitch`
- **Fichier :** [`src/components/ClientOnlySwitch.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ClientOnlySwitch.tsx#L28-L32)
- **Constat :**
  ```tsx
  <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
  ```
  Utilise des couleurs en dur (`bg-gray-200`) au lieu de tokens sémantiques (`bg-muted border border-border`), causant un flash grisâtre lors de l'hydratation sur les thèmes Gold, Neon, Ocean et Forest.
- **Remède recommandé (`TASK-THEME-02`) :**
  Utiliser `bg-muted border border-border/60`.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-06`** | Routage / Serveur | 🔴 CRITIQUE | Redirection permanente 308 de `/dashboard` vers `/` dans `next.config.ts` | `next.config.ts` |
| **`TASK-UX-21`** | Légal / RGPD | 🔴 HAUTE | Montage de `<CookieConsent />` dans `src/app/layout.tsx` | `src/app/layout.tsx`, `CookieConsent.tsx` |
| **`TASK-UX-35`** | UI / Toast | 🟡 MOYENNE | Correction du remplacement regex `/text-/g` sur la barre de progression Toast sombre | `src/components/ui/toast.tsx` |
| **`TASK-UX-22`** | Lint / Performance | 🟡 MOYENNE | Remplacement de `window.location.href` par `<Link>` dans `ErrorBoundary.tsx` | `src/components/ErrorBoundary.tsx` |
| **`TASK-UX-36`** | UX / Delight | 🟢 BASSE | Élimination des dialogues natifs `confirm()` sur `/dashboard/api-keys` | `src/app/dashboard/api-keys/page.tsx` |
| **`TASK-THEME-02`** | Multi-Thèmes | 🟢 BASSE | Harmonisation des tokens `bg-muted` dans les wrappers d'hydratation SSR | `ClientOnlySwitch.tsx`, `ClientOnlySelect.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Rendre l'application immédiatement plus polie, fluide et respectueuse des standards modernes.
