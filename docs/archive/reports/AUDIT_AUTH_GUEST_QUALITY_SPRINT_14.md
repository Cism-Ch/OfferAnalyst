# 🛡️ Rapport d'Audit Multi-Domaines — Sprint 14 : Authentification, Flux Guest User, Sécurité Backend, IA & UX/UI

**Date :** 28 Octobre 2026  
**Auteur :** Agent IA OfferAnalyst (`/autonomous-agents` — Protocole RSI)  
**Périmètre :** Audit exhaustif transversal découpé en **4 Lots / Domaines de Qualité** (Authentification & Sécurité, Flux Guest User & Persistance Hybride, Logique IA & Backend, UX/UI Bilingue & Responsivité).

---

## 📊 Synthèse Exécutive & Segmentation en Lots

L'inspection complète de la codebase autour du cycle de vie utilisateur (**Guest User -> Onboarding -> BYOK -> Authentification Better-Auth -> Dashboard & IA**) a révélé **10 anomalies critiques et majeures** réparties sur 4 domaines :

| Lot / Domaine | Identifiant SSOT | Sévérité Max | Anomalies Détectées | Objectif Qualité |
| :--- | :--- | :---: | :---: | :--- |
| **Lot 1 : Authentification & Sécurité Backend** | `TASK-AUTH-01` | 🔴 Critique | 4 | Neutraliser les redirections silencieuses sur échec de login, synchroniser `Account` Better-Auth au reset password (QStash async), et éliminer 3 failles IDOR / Élévation de privilèges. |
| **Lot 2 : Flux Guest User, IA & Persistance Hybride** | `TASK-GUEST-02` | 🔴 Haute | 3 | Persister les clés BYOK et préférences saisies en Onboarding Guest, propager les clés temporaires Guest vers l'organisation IA et les actions V2, et remplacer les mocks de Settings par de vraies Server Actions. |
| **Lot 3 : UX/UI, Bilinguisme FR/EN & Responsivité** | `TASK-UX-03` | 🟡 Moyenne | 3 | Bilinguisme FR/EN intégral sur `/auth/*` et `/onboarding`, ajout du bouton Déconnexion (`signOut`) et CTA Guest dans `ModernSidebar`, et refonte du bandeau `SecurityMigrationBanner` (suppression de l'overlay fixe bloquant et des couleurs brutes). |
| **Lot 4 : Évaluation Déterministe & Méta-Optimisation RSI** | `TASK-VAL-04` | 🟢 Standard | — | Validation `tsc --noEmit`, `npm run lint`, `npm run eval:quick` (100/100) et mise à jour de `.agents/rules/fullstack_playbook.md`. |

---

## 🔍 Détail des Constats par Domaine

### 🔐 Domaine 1 : Authentification & Sécurité Backend (`TASK-AUTH-01`)

1. **`[AUTH-01.01]` Redirection Silencieuse en Cas d'Échec de Connexion / Inscription (`src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`)**
   - **Constat :** Le client Better-Auth (`signIn.email`, `signUp.email`) retourne un objet `{ data, error }` sans lever d'exception JavaScript par défaut lors d'une erreur HTTP 400/401. Le code actuel exécute immédiatement `router.push("/")` sans vérifier `if (res.error)`.
   - **Impact :** Un utilisateur saisissant un mot de passe erroné est redirigé silencieusement vers `/` en tant que **Guest User** sans aucun message d'erreur, créant une confusion totale sur son état de session.
2. **`[AUTH-01.02]` Désynchronisation du Mot de Passe Better-Auth & Emails Synchrones (`src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`)**
   - **Constat :** Lors de la réinitialisation du mot de passe (`PUT /api/auth/reset-password`), seul `prisma.user.update({ data: { password } })` est appelé. Or, Better-Auth stocke et vérifie le hash du mot de passe dans la collection `Account` (`providerId: "credential"`). De plus, l'envoi d'email utilise `new Resend()` de manière synchrone au lieu de passer par `enqueueJob` (QStash).
   - **Impact :** Le nouveau mot de passe n'est pas reconnu par Better-Auth lors de la connexion suivante, et la requête HTTP bloque sur l'appel SMTP/API Resend.
3. **`[AUTH-01.03]` Failles Critiques IDOR & Élévation de Privilèges sur les Server Actions (`src/app/actions/db/admin.ts`, `src/app/actions/db/api-key-analytics.ts`, `src/app/actions/db/api-key-rotation.ts`)**
   - **Constat :**
     - `updateUserRole(userId, role)` dans `admin.ts` ne vérifie **aucune session admin** (`ensureAdminSession()` manquant).
     - `getAdminTelemetryStats()` dans `api-key-analytics.ts` expose les métriques globales sans vérification de rôle `ADMIN`.
     - `setPrimaryKey`, `updateKeyPriority`, `getKeysNeedingRotation`, et `getKeyRotationHistory` dans `api-key-rotation.ts` acceptent `userId` en argument client sans vérifier `auth.api.getSession(headers)`.

---

### 👤 Domaine 2 : Flux Guest User, Logique IA & Persistance Hybride (`TASK-GUEST-02`)

1. **`[GUEST-02.01]` Perte des Clés API BYOK et Préférences lors de l'Onboarding Guest (`src/app/onboarding/page.tsx`)**
   - **Constat :** Lorsqu'un Guest User complète `/onboarding` et saisit ses clés API à l'étape 3, l'endpoint `/api/profile/onboarding` détecte `!userId` et renvoie `{ guest: true }` sans rien sauvegarder, tandis que le composant client ne persiste pas les clés dans `useTemporaryApiKeys()` (`localStorage`).
   - **Impact :** Les clés saisies par l'invité durant l'onboarding sont immédiatement perdues à l'arrivée sur le Dashboard.
2. **`[GUEST-02.02]` Rupture de Propagation des Clés Temporaires Guest vers l'IA (`src/app/saved/page.tsx`, `src/app/actions/analyzeV2.ts`, `src/app/actions/organizeV2.ts`)**
   - **Constat :** Dans `saved/page.tsx`, `organizeOffersAction(savedOffers)` est appelé sans transmettre `tempKeys.getKey('openrouter')`. Par ailleurs, `analyzeV2.ts` et `organizeV2.ts` lisent directement `process.env.OPENROUTER_API_KEY` au lieu d'utiliser le résolveur hybride `getAPIKey('openrouter', clientApiKey)`.
   - **Impact :** L'organisation intelligente des favoris échoue pour les utilisateurs Guest BYOK si le serveur n'a pas de clé globale.
3. **`[GUEST-02.03]` Actions Simulées (Mocks) et Absence d'Adaptation Guest sur `/dashboard/settings` (`src/app/dashboard/settings/page.tsx`)**
   - **Constat :** La page Paramètres utilise des `setTimeout` factices pour la sauvegarde du profil et la suppression de compte, et présente à un Guest User des formulaires de modification de mot de passe et de suppression de compte inopérants.

---

### 🎨 Domaine 3 : UX/UI, Bilinguisme FR/EN & Responsivité (`TASK-UX-03`)

1. **`[UX-03.01]` Pages d'Authentification & Onboarding Non Localisées et Sans Navigation Retour**
   - **Constat :** `/auth/login`, `/auth/signup`, `/auth/reset`, `/auth/verify` et `/onboarding` contiennent des textes exclusivement en anglais codés en dur, ne proposent ni bascule de langue (`LanguageToggle`), ni sélecteur de thème, ni bouton "Continuer en mode Invité / Retour à l'accueil".
2. **`[UX-03.02]` Absence de Bouton Déconnexion (`signOut`) et Statut Guest Dans `ModernSidebar.tsx`**
   - **Constat :** Un utilisateur connecté n'a aucun bouton pour se déconnecter dans `ModernSidebar.tsx` ou `/dashboard/settings`. De plus, les libellés `'Guest User'` et `'Click to Sign In'` sont codés en dur en anglais et le lien `/admin` est affiché à tous les profils.
3. **`[UX-03.03]` Superposition Fixe Intrusive & Couleurs Non-Thémées dans `SecurityMigrationBanner.tsx`**
   - **Constat :** `SecurityMigrationBanner` utilise `fixed top-0 left-0 right-0 z-50`, masquant le `ModernHeader` sur `/dashboard/api-keys`, et `UnauthenticatedSecurityWarning` utilise `bg-yellow-50 text-yellow-800` (illisible en thème Dark/Neon, violation `[R-UI-08]`).

