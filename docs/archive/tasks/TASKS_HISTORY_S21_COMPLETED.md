# ✅ Archive Complète du Sprint 21 — Auth, Landing, Onboarding, Dialogs & Bottom-sheets

**Date d'achèvement :** 31 Octobre 2026  
**Statut :** 100% Achevé & Validé (`npx tsc --noEmit` : 0 erreur | `npm run lint` : 0 warning | `npm run eval:quick` : 100/100 PASS | Tests E2E Playwright Responsive : 102/102 PASS sur les 5 viewports canoniques)

---

## 📋 Récapitulatif des Lots & Tâches Réalisés

### 🔐 Lot 1 : Formulaires Auth & Clavier Virtuel Adaptatif (`TASK-OVL-01`)
- [x] **`TASK-OVL-01.01`** : Cartes auth bornées et conteneurs d'application :
  - [`src/app/auth/login/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/login/page.tsx), [`src/app/auth/signup/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/signup/page.tsx), [`src/app/auth/reset/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/reset/page.tsx), [`src/app/auth/verify/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/verify/page.tsx).
  - Remplacement de `min-h-screen` par `min-h-app` (`100dvh`) éliminant les sauts de hauteur intempestifs causés par la barre d'adresse mobile dynamique sur iOS et Android.
  - Cartes d'authentification bornées `w-full max-w-md` avec padding adaptatif `p-4 sm:p-6` et `overflow-hidden` pour préserver l'espace utile sur mobile 320px.
- [x] **`TASK-OVL-01.02`** : Boutons OAuth en grille adaptative :
  - Remplacement du `grid-cols-2` rigide par `grid-cols-1 min-[400px]:grid-cols-2 gap-3` sur les pages de connexion et d'inscription.
  - Élimine tout débordement ou troncature des libellés de boutons Google et GitHub sur les viewports étroits de 320px à 375px.
- [x] **`TASK-OVL-01.03`** : Ergonomie mobile du clavier virtuel :
  - Intégration systématique des attributs ergonomiques sur toutes les pages (`/auth/login`, `/auth/signup`, `/auth/reset`, `/auth/verify`) :
    - `inputMode="email"` et `autoComplete="email"` sur tous les champs d'adresses email (y compris demande de reset).
    - `enterKeyHint="next"` pour passer fluidement au champ suivant.
    - `enterKeyHint="done"` ou `"send"` sur les champs finaux ou soumissions de formulaires.
    - `autoComplete="current-password"` ou `autoComplete="new-password"` (y compris confirmation et réinitialisation de mot de passe) respectant les gestionnaires de mots de passe mobiles.

### 🌐 Lot 2 : Landing Page Fluide & Typographie Adaptative (`TASK-OVL-02`)
- [x] **`TASK-OVL-02.01`** : Typographie hero fluide et rythme vertical :
  - [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx) : Intégration de la typographie fluide `text-fluid-hero` (`clamp(1.75rem, 1.2rem + 2.6vw, 3.25rem)`) sur le titre principal et `text-fluid-title` sur l'ensemble des titres de sections.
  - Remplacement des espacements fixes `py-20` par le rythme vertical adaptatif `py-(--spacing-section) sm:py-20`.
  - Conteneur racine migré vers `min-h-app` et boutons d'actions CTAs en `flex-col sm:flex-row` avec cibles tactiles de 44px+ (`h-12`).
  - Déclaration explicite des utilitaires `@utility text-fluid-hero` et `@utility text-fluid-title` dans [`src/app/globals.css`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/globals.css).
- [x] **`TASK-OVL-02.02`** : Page d'accueil fluidifiée :
  - [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx) : Titre de carte en `text-xl sm:text-2xl`, grille d'étapes de workflow en `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` et badges fluides.
- [x] **`TASK-OVL-02.03`** : Assistant Onboarding mobile :
  - [`src/app/onboarding/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/onboarding/page.tsx) : Remplacement de `container` par `w-full max-w-4xl mx-auto`, conteneur `min-h-app overflow-x-hidden`.
  - Remplacement de l'animation de translation horizontale `x: 20` par une translation verticale `y: 12`, éliminant définitivement les 8px de débordement mesurés au chargement.
  - Barre de progression compacte `h-1.5 sm:h-2` avec pilules adaptatives `w-6 sm:w-8`.
  - [`src/components/onboarding/WelcomeStep.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/onboarding/WelcomeStep.tsx) : Cartes de fonctionnalités avec padding adaptatif `p-4 sm:p-6`.

### 📱 Lot 3 : Dialogs, Bottom-sheets & Cookie Consent Mobile (`TASK-OVL-03`)
- [x] **`TASK-OVL-03.01`** : Variante bottom-sheet mobile native dans `DialogContent` :
  - [`src/components/ui/dialog.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ui/dialog.tsx) : Ajout du support de `variant?: "default" | "bottom-sheet"` et attribut `data-variant`.
  - Mode mobile (`< sm`) : Ancrage inférieur natif `fixed inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 w-full max-w-full rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t max-h-[calc(100dvh-1rem)] pb-safe overflow-y-auto`.
  - Poignée de préhension tactile accessible (`aria-hidden="true"`) affichée sur mobile uniquement.
  - Animations Radix adaptées et bornées : `max-sm:data-[state=open]:slide-in-from-bottom` et `max-sm:data-[state=closed]:slide-out-to-bottom` évitant toute fuite d'animation sur desktop centré (`sm:top-[50%] sm:left-[50%]` avec `sm:zoom-in-95`).
  - Mise à niveau du variant par défaut avec `max-h-[calc(100dvh-2rem)]` évitant tout dépassement.
- [x] **`TASK-OVL-03.02`** : Application aux dialogues de clés API et sélecteurs IA :
  - [`src/components/api-keys/AddAPIKeyDialog.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/AddAPIKeyDialog.tsx) : DialogContent en `variant="bottom-sheet"`.
  - [`src/components/api-keys/GuestApiKeyDialog.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/GuestApiKeyDialog.tsx) : DialogContent en `variant="bottom-sheet"`.
  - [`src/components/layout/AIModelSelector.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/AIModelSelector.tsx) : DialogContent en `variant="bottom-sheet"` avec hauteur contrôlée `max-h-[calc(100dvh-1rem)] sm:max-h-[85dvh]`.
  - [`src/components/auth/FluidAuthModal.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/auth/FluidAuthModal.tsx) : DialogContent en `variant="bottom-sheet"` avec padding fluide `p-4 sm:p-6`.
- [x] **`TASK-OVL-03.03`** : Bandeau CookieConsent compact et non-bloquant :
  - [`src/components/CookieConsent.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/CookieConsent.tsx) : Réduction de la hauteur maximale à `max-h-[75dvh]` (`70dvh` pour la carte intérieure).
  - Actions en grille compacte `grid-cols-1 min-[360px]:grid-cols-2 gap-2` (Accept All / Necessary Only) et lien de personnalisation étendu, éliminant l'empilement vertical de 3 boutons de 44px qui masquait l'écran.
  - Correction des liens légaux vers les routes applicatives valides `Link href="/privacy"` et `Link href="/terms"` (éliminant l'erreur 404).

### 🎯 Lot 4 : Validation Déterministe & Non-Régression Globale (`TASK-VAL-08`)
- [x] **`TASK-VAL-08.01`** : Validation binaire avec `npm run eval:quick` (Score 100/100 PASS, 0 erreur TypeScript strict, 0 warning ESLint, hygiène Prisma validée).
- [x] **`TASK-VAL-08.02`** : Validation de non-régression et extension de la suite E2E Playwright Responsive [`tests/e2e/responsive.spec.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/tests/e2e/responsive.spec.ts) :
  - **102/102 tests PASS** sur les 5 viewports canoniques (320px iPhone SE, 375px Standard, 768px Tablette Portrait, 1024px Tablette Paysage, 1440px Desktop HD).
  - Couverture étendue aux routes `/landing`, `/onboarding`, `/auth/reset`, `/auth/verify`.
  - Tests dédiés aux attributs de clavier virtuel mobile sur tous les flux auth (`/auth/login`, `/auth/signup`, `/auth/reset`).
  - Tests dédiés à l'ouverture de `AIModelSelector` en bottom-sheet mobile avec poignée tactile de glissement et `data-variant="bottom-sheet"`.
  - Tests de conformité des routes légales du bandeau `CookieConsent`.
