# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 16

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Pages Légales, Inscription & Footers : `src/app/auth/signup/page.tsx`, `src/app/landing/page.tsx`, `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_SERVICE.md`
- Visualisation de Données & Recharts : `src/app/dashboard/analytics/page.tsx`
- Paramètres de Compte & Espace de Travail : `src/app/dashboard/settings/page.tsx`, `src/app/dashboard/workspace/page.tsx`
- Navigation & Intégration Layout : `src/app/help/page.tsx`, `src/app/dashboard/support/page.tsx`
- Gestion des Erreurs & BYOK sur les Favoris : `src/app/saved/page.tsx`

---

## 🎯 Objectif de la Revue
Traquer les éléments d'interface factices (boutons inactifs, chaînes en dur "John Doe"), les liens brisés (404 sur les conditions d'utilisation lors du signup), les ruptures d'immersion visuelle (pages sans layout) et les défauts de rendu Recharts sous Tailwind CSS v4.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🚨 Liens Légaux 404 Bloquants sur la Page d'Inscription & le Footer
- **Fichiers :**
  - [`src/app/auth/signup/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/auth/signup/page.tsx#L195-L208)
  - [`src/app/landing/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/landing/page.tsx#L418-L425)
  - [`docs/PRIVACY_POLICY.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/PRIVACY_POLICY.md)
  - [`docs/TERMS_OF_SERVICE.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TERMS_OF_SERVICE.md)
- **Constat :**
  Sur la page de création de compte (`/auth/signup`), l'utilisateur doit cocher :
  `"I agree to the Terms of Service and Privacy Policy"`.
  Or, les routes `/terms`, `/privacy` et `/cookies` n'existent pas dans `src/app/` (renvoient une 404 immédiate).
  Pourtant, le contenu légal complet existe déjà sous forme markdown dans `docs/PRIVACY_POLICY.md` et `docs/TERMS_OF_SERVICE.md`.
- **Impact Utilisateur :**
  Rupture de confiance immédiate pour tout nouvel utilisateur souhaitant consulter les mentions légales et la politique de données avant de créer son compte.
- **Remède recommandé (`TASK-UX-24`) :**
  Créer les pages Next.js `/privacy`, `/terms` et `/cookies` rendues avec `SimpleLayout` ou `ModernLayout` en exploitant les textes existants de `docs/`.

---

### 2. 🎨 Recharts CSS Invalide sur l'Ensemble d'Analytics Dashboard
- **Fichier :** [`src/app/dashboard/analytics/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/analytics/page.tsx#L199-L216)
- **Constat :**
  Dans tous les graphiques (`LineChart`, `BarChart` de score, `BarChart` de modèles) :
  ```tsx
  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
  <YAxis stroke="hsl(var(--muted-foreground))" />
  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
  <Line stroke="hsl(var(--primary))" dot={{ fill: 'hsl(var(--primary))' }} />
  ```
  Sous Tailwind CSS v4, les variables CSS injectées dans `globals.css` sont au format hexadécimal direct (`#ffffff`, `#09090b`).
  `hsl(#09090b)` est une expression CSS invalide rejetée par le navigateur.
- **Impact Visuel :**
  Tracés invisibles ou grisâtres, tooltips sans fond et textes d'axes cassés lors de l'utilisation des thèmes Dark, Neon, Gold et Ocean.
- **Remède recommandé (`TASK-UX-02`) :**
  Remplacer `hsl(var(--...))` par `var(--...)` sur tous les graphiques.

---

### 3. 👤 Données Factices ("John Doe") & Boutons Inertes dans Settings & Workspace
- **Fichiers :**
  - [`src/app/dashboard/settings/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/settings/page.tsx#L116-L134)
  - [`src/app/dashboard/workspace/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/workspace/page.tsx#L117-L148)
- **Constat :**
  - `src/app/dashboard/settings/page.tsx` affiche en dur `defaultValue="John Doe"` et `defaultValue="john@example.com"`.
  - Les boutons `"Save Profile"`, `"Change Password"`, `"Download My Data"`, `"Save Changes"` et `"Save Preferences"` ne possèdent aucun handler `onClick`, aucune liaison de formulaire, et ne réagissent pas au clic.
  - Utilisation d'éléments HTML bruts `<input className="..." />` au lieu du composant canonique `<Input />` de `@/components/ui/input`.
  - La sélection du thème dans l'espace de travail utilise un `<select>` natif avec 3 options figées ("Light", "Dark", "System"), ignorant les 8 thèmes supportés par l'application.
- **Impact Utilisateur :**
  L'utilisateur a l'impression d'être sur une maquette inachevée lorsqu'il tente de configurer son profil ou ses préférences.
- **Remède recommandé (`TASK-UX-25`) :**
  - Relier le formulaire à la session Better-Auth réelle (`authClient.useSession()`).
  - Utiliser le composant `<Input />` Shadcn avec feedback toast de confirmation lors de l'enregistrement.
  - Aligner le sélecteur de thème sur le dictionnaire officiel des 8 thèmes.

---

### 4. 🧭 Page Help Center (`/help`) Isolée Sans Layout de Navigation
- **Fichier :** [`src/app/help/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/help/page.tsx#L130-L140)
- **Constat :**
  Contrairement à l'ensemble de l'application, `/help` est un simple `<div className="container ...">` sans `ModernLayout` ni `SimpleLayout`.
  L'utilisateur qui clique sur "Help Center" dans la barre latérale perd la navigation, le header, le sélecteur de modèle et le sélecteur de thème, et ne peut plus revenir en arrière qu'avec le bouton "Précédent" du navigateur.
  De plus, la FAQ cite des modèles obsolètes ("Gemini 2.0 Flash") et affirme à tort que les clés API sont chiffrées en "bcrypt" (alors qu'il s'agit d'un chiffrement symétrique AES-256-GCM réversible).
- **Remède recommandé (`TASK-UX-26`) :**
  Envelopper la page dans `ModernLayout` et actualiser les mentions de modèles et d'algorithme de chiffrement.

---

### 5. ☕ Boutons de Soutien Inertes sur la Page Support
- **Fichier :** [`src/app/dashboard/support/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/support/page.tsx#L118-L126)
- **Constat :**
  Le bouton principal `"Support with $5"` et le bouton `"Contact Support"` sont de simples `<Button>` sans événement `onClick` ni lien `href`.
  À l'inverse, l'étape 5 de l'onboarding ouvre correctement `"https://buymeacoffee.com/offeranalyst"`.
- **Remède recommandé (`TASK-UX-27`) :**
  Ajouter `window.open("https://buymeacoffee.com/offeranalyst", "_blank")` sur le bouton de don et un lien `mailto:support@offeranalyst.com` sur le bouton de contact.

---

### 6. ⚠️ Utilisation d'un `alert()` Bloquant sur `/saved` Smart Organize
- **Fichier :** [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx#L25-L35)
- **Constat :**
  En cas d'erreur de réorganisation IA, le code exécute `alert("Failed to organize offers.");`.
  Par ailleurs, la clé API BYOK (`tempKeys`) n'est pas transmise à `organizeOffersAction`, empêchant les utilisateurs invités d'organiser leurs favoris.
- **Remède recommandé (`TASK-UX-28`) :**
  Remplacer `alert()` par `toast.error()` et transmettre `clientApiKey` via `tempKeys.getKey('openrouter')`.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-UX-24`** | Légal / Onboarding | 🔴 HAUTE | Résolution des 404 sur `/privacy`, `/terms`, `/cookies` pour sécuriser l'inscription | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/cookies/page.tsx`, `signup/page.tsx` |
| **`TASK-UX-02`** | UI / Recharts | 🔴 HAUTE | Correction globale des tokens CSS `var(--card)` sur Recharts (Analytics & ScoreChart) | `src/app/dashboard/analytics/page.tsx`, `src/components/offers/ScoreChart.tsx` |
| **`TASK-UX-25`** | Polish / Profil | 🟡 MOYENNE | Dynamisation des profils réels (`useSession`), inputs Shadcn et retour toast dans Settings/Workspace | `src/app/dashboard/settings/page.tsx`, `src/app/dashboard/workspace/page.tsx` |
| **`TASK-UX-26`** | Layout / Help | 🟡 MOYENNE | Intégration de `ModernLayout` sur `/help` et actualisation des modèles/chiffrement | `src/app/help/page.tsx` |
| **`TASK-UX-27`** | Delight / Support | 🟢 BASSE | Activation des liens réels sur les boutons de don et support | `src/app/dashboard/support/page.tsx` |
| **`TASK-UX-28`** | UX / Feedback | 🟢 BASSE | Élimination de `alert()` au profit de `toast` et support BYOK sur `/saved` Smart Organize | `src/app/saved/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Zéro ajout de fonctionnalité majeure — polissage et fiabilisation de l'existant pour enchanter les utilisateurs.
