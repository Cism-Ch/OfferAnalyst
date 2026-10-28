# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 20

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Cohérence des Coquilles & Layouts : [`src/app/help/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/help/page.tsx), [`src/app/changelog/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/changelog/page.tsx)
- En-tête & Fil d'Ariane Dynamique : [`src/components/layout/ModernHeader.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernHeader.tsx)
- Barre Latérale & Profil Utilisateur : [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx)
- Actions Fantômes & Modales Natives : [`src/app/dashboard/support/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/support/page.tsx), [`src/app/dashboard/workspace/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/workspace/page.tsx), [`src/app/projects/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/projects/page.tsx), [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx)
- Télémétrie Visuelle des Citations Web : [`src/components/offers/ResultsSection.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ResultsSection.tsx)
- Moteur Graphique Recharts & Multi-Thèmes : [`src/components/offers/ScoreChart.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ScoreChart.tsx), [`src/app/dashboard/analytics/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/analytics/page.tsx)

---

## 🎯 Objectif de la Revue
Détecter les ruptures d'expérience utilisateur (pages sans menu ni retour), les titres d'en-tête erronés par omission de routes, les boutons inertes trompeurs, les popups bloquants de navigateur (`alert`, `confirm`), et le masquage des sources web vérifiées renvoyées par le moteur de scraping IA.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🕳️ Rupture de Coquille Applicative sur `/help` et `/changelog`
- **Fichiers :**
  - [`src/app/help/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/help/page.tsx#L131-L140)
  - [`src/app/changelog/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/changelog/page.tsx#L144-L156)
- **Constat :**
  Les pages `/help` (Centre d'aide) et `/changelog` (Historique des versions) affichent un conteneur HTML brut `<div className="container mx-auto py-8">` sans être encapsulées dans `ModernLayout` ou `SimpleLayout`.
- **Impact Utilisateur :**
  Dès qu'un utilisateur clique sur "Help Center" ou "Changelog" dans la barre latérale, le menu de navigation disparaît, l'en-tête disparaît, le sélecteur de modèle disparaît et le commutateur de thème devient inaccessible. L'utilisateur est contraint d'utiliser le bouton retour de son navigateur pour revenir à l'application.
- **Remède recommandé (`TASK-UX-37`) :**
  Encapsuler le contenu de `/help` et `/changelog` dans `<ModernLayout>` ou `<SimpleLayout>`.

---

### 2. 🏷️ Registre Statique Incomplet dans `ModernHeader.tsx` (Titres & Breadcrumbs Erronés)
- **Fichier :** [`src/components/layout/ModernHeader.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernHeader.tsx#L31-L81)
- **Constat :**
  La fonction `getPageInfo(pathname)` mappe uniquement 8 routes. Toutes les sous-pages de gestion :
  - `/dashboard/settings`
  - `/dashboard/workspace`
  - `/dashboard/support`
  - `/dashboard/analytics`
  - `/help`
  - `/changelog`
  retombent dans le fallback par défaut `routes['/']`.
- **Impact Utilisateur :**
  Sur `/dashboard/settings`, l'en-tête affiche "Dashboard — AI-powered offer analysis and insights" et "Home > Dashboard" au lieu de "Account Settings" et "Home > Settings". Deux titres différents s'affichent l'un au-dessus de l'autre.
- **Remède recommandé (`TASK-UX-38`) :**
  Compléter la table de routage `getPageInfo` avec toutes les routes existantes de l'application.

---

### 3. 👤 Profil Utilisateur Figé & Absence de Raccordement Auth dans `ModernSidebar.tsx`
- **Fichier :** [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx#L170-L193)
- **Constat :**
  Le composant de profil en bas de la barre latérale affiche en dur l'avatar `https://github.com/shadcn.png`, les initiales "CN", le libellé statique "User Profile" et "Pro Plan".
  De plus, la zone n'est cliquable vers aucune page de réglages (`/dashboard/settings`) et ne permet pas la déconnexion.
- **Impact Utilisateur :**
  L'utilisateur connecté avec son compte Google ou email ne voit jamais son nom ni son avatar réel, créant une impression de maquette inachevée.
- **Remède recommandé (`TASK-UX-39`) :**
  Connecter `authClient.useSession()` dans `ModernSidebar.tsx`, afficher le vrai nom / email / avatar de l'utilisateur, et rendre la zone cliquable vers `/dashboard/settings` ou un menu déroulant d'options de compte.

---

### 4. 👻 Boutons Fantômes & Dialogues Bloquants Navigateur (`alert`, `confirm`)
- **Fichiers :**
  - [`src/app/dashboard/support/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/support/page.tsx#L118-L122, #L223-L226) : Les boutons "Support with $5" et "Contact Support" ont des icônes de liens externes `<ExternalLink />` mais aucun gestionnaire `onClick` ni attribut `asChild`/`href`.
  - [`src/app/dashboard/workspace/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/workspace/page.tsx#L59) : `if (confirm('Remove this team member?'))` gèle l'interface sur mobiles et viole les standards modernes.
  - [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx#L31) : `alert("Failed to organize offers.")` interrompt l'expérience au lieu d'un toast informatif discret.
  - [`src/app/projects/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/projects/page.tsx#L250) : Le bouton "Open Board" est inerte dans les cartes de projets.
- **Remède recommandé (`TASK-UX-40`) :**
  - Raccorder "Support with $5" à une URL de soutien réelle ou modale, et "Contact Support" à `mailto:support@offeranalyst.com`.
  - Remplacer les `confirm()` et `alert()` par des dialogues Shadcn UI ou des notifications `toast.error()`.
  - Raccorder "Open Board" à l'affichage des sources associées au projet.

---

### 5. 🌐 Omission d'Affichage des Citations & Sources Web dans `ResultsSection.tsx`
- **Fichiers :**
  - [`src/types/index.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/types/index.ts#L32-L41) : Définit `searchSources: SearchSource[]`.
  - [`src/components/offers/ResultsSection.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ResultsSection.tsx#L68-L98)
- **Constat :**
  Lorsqu'une analyse est générée avec auto-fetch, les moteurs de recherche renvoient les sources web explorées (`searchSources`). `ResultsSection` n'affiche que les cartes d'offres et le résumé de marché, sans jamais rendre la liste des sources explorées.
- **Impact Utilisateur :**
  L'utilisateur ne peut pas vérifier les sites sources utilisés pour produire les recommandations.
- **Remède recommandé (`TASK-UX-41`) :**
  Ajouter un bloc pliable ou une liste d'étiquettes "Sources Web Consultées" dans `ResultsSection.tsx` avec liens sécurisés `target="_blank"` et `rel="noopener noreferrer"`.

---

### 6. 🎨 Bug de Syntaxe CSS `hsl(#hex)` sur Recharts Multi-Thèmes
- **Fichiers :**
  - [`src/components/offers/ScoreChart.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ScoreChart.tsx#L65-L68)
  - [`src/components/api-keys/AnalyticsDashboard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/AnalyticsDashboard.tsx#L190-L295)
  - [`src/app/dashboard/analytics/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/analytics/page.tsx#L199-L309)
- **Constat :**
  Les variables `--card`, `--border`, `--primary` sont définies en hexadécimal dans [`src/app/globals.css`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/globals.css) (ex: `#ffffff`, `#09090b`).
  L'écriture `hsl(var(--card))` donne `hsl(#ffffff)`, qui est rejetée par le moteur de rendu CSS du navigateur. Les tooltips perdent leur fond et deviennent illisibles en thèmes sombre, néon et or.
- **Remède recommandé (`TASK-UX-02`) :**
  Remplacer partout `hsl(var(--...))` par `var(--...)`.

---

## 📋 Tableau Synthétique des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-UX-37`** | Navigation / Coquille | 🔴 HAUTE | Intégration de `SimpleLayout`/`ModernLayout` sur `/help` et `/changelog` | `src/app/help/page.tsx`, `src/app/changelog/page.tsx` |
| **`TASK-UX-38`** | Header / Fil d'Ariane | 🟡 MOYENNE | Complétion du registre `getPageInfo` pour toutes les sous-routes dashboard | `src/components/layout/ModernHeader.tsx` |
| **`TASK-UX-39`** | Identité / UX | 🟡 MOYENNE | Synchronisation de la session Better-Auth dans le pied de `ModernSidebar.tsx` | `src/components/layout/ModernSidebar.tsx` |
| **`TASK-UX-40`** | UX Delight / Hygiène | 🟡 MOYENNE | Éradication des boutons inertes et des popups bloquants (`alert`/`confirm`) | `support/page.tsx`, `workspace/page.tsx`, `saved/page.tsx`, `projects/page.tsx` |
| **`TASK-UX-41`** | Transparence IA | 🟢 BASSE | Affichage des citations et sources web explorées dans `ResultsSection.tsx` | `src/components/offers/ResultsSection.tsx` |
| **`TASK-UX-02`** | Design System | 🔴 HAUTE | Correction des variables `var(--card)` sur les tooltips Recharts | `ScoreChart.tsx`, `AnalyticsDashboard.tsx`, `analytics/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **TypeScript (`npx tsc --noEmit`) :** Exécuté et validé à **0 erreur**.
- **ESLint (`npm run lint`) :** Exécuté et validé à **0 erreur** (9 avertissements non bloquants documentés).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu à **245 lignes** (respect strict de la limite de 250 lignes).
