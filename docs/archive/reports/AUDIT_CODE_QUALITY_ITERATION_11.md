# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 11

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Flux d'Authentification & Redirections : `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/verify/page.tsx`
- Arborescence des Routes Dashboard : `src/app/dashboard/` vs `src/app/page.tsx`
- Landing Page Marketing : `src/app/landing/page.tsx` (liens de footer, boutons d'action, FAQ)
- Intégrité de l'Onboarding & Sécurité : `src/lib/api-key-encryption.ts`

---

## 🎯 Objectif de la Revue
Détecter les impasses de navigation, les liens morts (404), les erreurs d'aiguillage après connexion et les incohérences d'accessibilité sur les pages publiques et d'authentification afin de formuler des tâches de remédiation claires (`TASK-FIX`, `TASK-UX`).

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🚨 Redirection 404 Systématique après Connexion (`/dashboard` Inexistant)
- **Fichiers :**
  - [`src/app/auth/login/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/login/page.tsx#L48-L65) (L48, L50, L65)
  - [`src/app/auth/verify/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/verify/page.tsx#L58) (L58)
  - [`src/app/dashboard/`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard)
- **Constat :**
  Dans `login/page.tsx` :
  ```tsx
  await signIn.email({ email, password, callbackURL: "/dashboard" });
  router.push("/dashboard");
  // Idem pour OAuth Google et GitHub : callbackURL: "/dashboard"
  ```
  Et dans `verify/page.tsx` :
  ```tsx
  setTimeout(() => { router.push("/dashboard"); }, 2000);
  ```
  Or, l'arborescence de `src/app/dashboard/` contient uniquement des sous-dossiers (`analytics/`, `api-keys/`, `settings/`, `support/`, `workspace/`). **Il n'existe aucun fichier `src/app/dashboard/page.tsx` !**
  La véritable page d'accueil de l'application avec le flux d'analyse est à la racine `src/app/page.tsx` (`/`).
- **Impact Utilisateur :**
  100% des utilisateurs qui se connectent via mot de passe, Google OAuth, GitHub OAuth ou après avoir cliqué sur un lien de vérification d'email sont immédiatement redirigés vers une erreur **404 Not Found**. L'expérience est totalement rompue.
- **Remède recommandé (`TASK-FIX-06`) :**
  1. Modifier `callbackURL` et `router.push` vers `"/"` dans `login/page.tsx` et `verify/page.tsx`.
  2. Créer un Server Component de redirection canonique dans `src/app/dashboard/page.tsx` :
     ```tsx
     import { redirect } from 'next/navigation';
     export default function DashboardIndexPage() {
         redirect('/');
     }
     ```
     afin d'absorber en toute sécurité toute URL résiduelle ou favori pointant sur `/dashboard`.

---

### 2. 🔗 Liens Morts (404) dans le Footer de la Landing Page
- **Fichier :** [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx#L400-L425)
- **Constat :**
  Le pied de page de la landing page contient plusieurs liens vers des routes inexistantes dans `src/app/` :
  - `href="/privacy"` (L420) -> Page 404
  - `href="/terms"` (L421) -> Page 404
  - `href="/cookies"` (L422) -> Page 404
  - `href="/docs"` (L411) -> Page 404
  - `href="/landing"` (L402) -> Recharge la page landing au lieu d'une ancre fluide `#pricing`
  - `href="/dashboard/support"` (L401) -> Lien labellisé "Features" redirigeant vers le support au lieu de l'ancre `#features`
- **Impact Utilisateur :**
  Un prospect ou utilisateur voulant consulter la politique de confidentialité, les CGU ou la documentation clique et tombe sur une page d'erreur non stylisée.
- **Remède recommandé (`TASK-UX-16`) :**
  - Remplacer les liens de navigation interne vers les sections de la page par des ancres fluides (`#features`, `#pricing`, `#faq`).
  - Rediriger temporairement ou créer les pages légales minimales (`/privacy`, `/terms`) avec les mentions appropriées et la charte Offan.

---

### 3. ⚠️ Allégation de Sécurité Inexacte dans la FAQ de la Landing Page
- **Fichier :** [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx#L141-L143)
- **Constat :**
  La FAQ affirme :
  > *"Your API keys are encrypted with bcrypt before storage and never sent to the client."*
  Or, **bcrypt est un algorithme de hachage à sens unique (one-way hashing)** conçu pour les mots de passe. Une clé d'API ne peut pas être déchiffrée avec bcrypt pour appeler les modèles IA !
  L'application utilise en réalité un chiffrement symétrique authentifié de niveau bancaire **AES-256-GCM** avec vecteur d'initialisation aléatoire (implémenté dans [`src/lib/api-key-encryption.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/api-key-encryption.ts)).
- **Impact :**
  Incohérence technique manifeste qui nuit à la crédibilité de l'application auprès des développeurs et utilisateurs techniques.
- **Remède recommandé (`TASK-UX-17`) :**
  Corriger le texte de la réponse : *"Your API keys are securely encrypted using industry-standard AES-256-GCM authenticated encryption before database storage and never exposed to the client."*

---

### 4. ♿ Violations d'Accessibilité HTML Sémantique dans `LandingPage`
- **Fichier :** [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx)
- **Constat :**
  Plusieurs boutons sont enveloppés par des `<Link>` sans `asChild` :
  - L187-192 : `<Link href="/auth/signup"><Button size="lg">Start Free</Button></Link>`
  - L193-197 : `<Link href="/dashboard/support"><Button size="lg" variant="outline">Learn More</Button></Link>`
  - L285-289 : `<Link href={...}><Button className="w-full">...</Button></Link>`
  - L371-376 : `<Link href="/auth/signup"><Button size="lg">Get Started Free</Button></Link>`
- **Remède recommandé (`TASK-UX-18`) :**
  Convertir en `<Button asChild size="lg"><Link href="...">...</Link></Button>`.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-06`** | Auth / Routing | 🔴 CRITIQUE | Élimination de la redirection 404 post-login : création de `src/app/dashboard/page.tsx` et alignement sur `/` | `src/app/auth/login/page.tsx`, `src/app/auth/verify/page.tsx`, `src/app/dashboard/page.tsx` |
| **`TASK-UX-16`** | Landing / Links | 🔴 HAUTE | Remplacement des liens morts du footer par des ancres (`#pricing`, `#features`) et pages légales | `src/app/landing/page.tsx` |
| **`TASK-UX-17`** | Landing / FAQ | 🟡 MOYENNE | Rectification de l'allégation cryptographique (AES-256-GCM au lieu de bcrypt) dans la FAQ | `src/app/landing/page.tsx` |
| **`TASK-UX-18`** | Landing / A11y | 🟡 MOYENNE | Conversion des balises imbriquées `Link/Button` avec `asChild` | `src/app/landing/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Priorité absolue à la fiabilisation des parcours utilisateurs réels (connexion, découverte, confiance).
