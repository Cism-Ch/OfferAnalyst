# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 9

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Composants de Navigation & Mise en page : `src/components/layout/ModernHeader.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/components/layout/SimpleLayout.tsx`
- Expérience Utilisateur Accueil : `src/app/page.tsx`
- Gestion des Projets & Wizard : `src/app/projects/page.tsx`
- Formulaires de Recherche & Résultats : `src/app/search-context/page.tsx`, `src/app/data-source/page.tsx`, `src/app/analysis/page.tsx`
- Hygiène des Composants Offres : `src/components/offers/ConfigurationCard.tsx`
- Authentification & Profil Client : `src/lib/auth-client.ts`, `src/components/layout/ModernSidebar.tsx`

---

## 🎯 Objectif de la Revue
Détecter les bugs, blocages fonctionnels silencieux, fausses promesses d'interface, ruptures d'accessibilité (WCAG 2.1 AA) et code orphelin afin de formuler des tâches de remédiation claires (`TASK-UX`, `TASK-FIX`, `TASK-CLEAN`) sans introduire de fonctionnalités majeures nouvelles.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🛑 `ModernHeader.tsx` : Barre de recherche rapide ("Quick Search") fantôme et inactive
- **Fichier :** [`src/components/layout/ModernHeader.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernHeader.tsx#L120-L134)
- **Constat :**
  Un champ de recherche desktop stylisé avec icône loupe et animation d'agrandissement au focus est affiché en haut de toutes les pages :
  ```tsx
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
      type="search"
      placeholder="Quick search..."
      className="w-56 pl-9 h-9 bg-muted/50 border-none transition-all duration-300 ease-in-out focus:bg-muted focus:w-64"
  />
  ```
  Ce composant n'a ni `value`, ni `onChange`, ni gestionnaire `onKeyDown`, ni formulaire de soumission, ni raccourci global (Ctrl+K).
- **Impact Utilisateur :**
  L'utilisateur saisit un mot-clé (ex: "Développeur React", "Paris", nom de projet), appuie sur Entrée, et rien ne se produit. C'est une fausse promesse UX qui donne une impression d'inachèvement.
- **Remède recommandé (`TASK-UX-11`) :**
  Brancher l'input avec un gestionnaire d'appui sur "Entrée" redirigeant vers `/history?q=${encodeURIComponent(query)}` pour chercher dans l'historique, ou ouvrir une modal de commande palette / recherche globale avec raccourci `Cmd/Ctrl + K`.

---

### 2. 👤 `ModernSidebar.tsx` : Profil utilisateur en dur avec données factices et sans interaction
- **Fichier :** [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx#L170-L193)
- **Constat :**
  Le bloc utilisateur en pied de sidebar affiche des données statiques codées en dur :
  ```tsx
  <Avatar className={cn(isCollapsed && 'h-8 w-8')}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <p className="text-sm font-medium truncate">User Profile</p>
  <p className="text-xs text-muted-foreground flex items-center gap-1">
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
      Pro Plan
  </p>
  ```
  Le client Better-Auth expose pourtant `useSession()` via [`src/lib/auth-client.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/auth-client.ts#L24).
  De plus, ce bloc n'est pas cliquable (aucun lien vers `/dashboard/settings`, aucune possibilité de se déconnecter ou de se connecter).
- **Impact Utilisateur :**
  Un utilisateur non connecté (invité) voit un faux profil "User Profile / Pro Plan" avec un avatar étranger (shadcn). Il ne peut ni voir son vrai statut, ni accéder directement à son compte, ni se connecter depuis la barre de navigation.
- **Remède recommandé (`TASK-UX-12`) :**
  Brancher `useSession()` dans `ModernSidebar.tsx` :
  - Si session active : afficher le vrai nom / email de l'utilisateur, ses initiales en fallback, et un menu popover avec lien vers Paramètres (`/dashboard/settings`) et Déconnexion (`signOut()`).
  - Si session inactive (invité) : afficher "Invité (Local)", badge "BYOK", et bouton / lien "Se connecter" pointant vers `/auth/signin`.

---

### 3. 🗑️ `ConfigurationCard.tsx` : Code mort orphelin de 211 lignes
- **Fichier :** [`src/components/offers/ConfigurationCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ConfigurationCard.tsx)
- **Constat :**
  Le grep sur l'ensemble de la codebase confirme que `ConfigurationCard` n'est importé nulle part. Il s'agit d'un reliquat de l'ancienne version monolithique du dashboard d'accueil, remplacée par le workflow séquentiel `/search-context` et `/data-source`.
- **Impact :**
  211 lignes de code mort, imports inutiles, charge cognitive et risque de mauvaise référence lors de refactorings.
- **Remède recommandé (`TASK-CLEAN-02`) :**
  Supprimer en toute sécurité le fichier `src/components/offers/ConfigurationCard.tsx`.

---

### 4. ♿ Violations d'Accessibilité HTML Sémantique (Éléments interactifs imbriqués & Link/Button)
- **Fichiers :**
  - [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L128-L151) : `<Link href={step.href}><Card><Button variant="ghost">Get Started</Button></Card></Link>`
  - [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L240-L246) : `<Link href="/search-context"><Button size="lg">Start Analysis</Button></Link>`
  - [`src/app/history/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/history/page.tsx#L126-L128) : `<Link href="/"><Button>Start a New Search</Button></Link>`
  - [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx#L100-L125) : `<Link href={item.href}><Button ...>...</Button></Link>`
- **Constat :**
  En HTML5, imbriquer un élément `<button>` à l'intérieur d'un élément `<a>` est interdit. Cela provoque des avertissements au linting, perturbe le cycle de tabulation au clavier (tab navigation), empêche la synthèse vocale des lecteurs d'écran (WCAG) et peut générer des doubles clics ou des annulations d'événements.
- **Remède recommandé (`TASK-UX-13`) :**
  Utiliser la propriété canonique shadcn `asChild` : `<Button asChild variant="..."><Link href="...">...</Link></Button>`. Pour les cartes cliquables de la page d'accueil, transformer le `<Button>` interne en simple `<span>` stylisé pour éviter toute imbrication de contrôles interactifs.

---

### 5. ⚠️ `src/app/page.tsx` : Redéclaration locale artisanale de l'utilitaire `cn()`
- **Fichier :** [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L256-L258)
- **Constat :**
  En fin de fichier :
  ```tsx
  function cn(...classes: (string | boolean | undefined)[]) {
      return classes.filter(Boolean).join(' ');
  }
  ```
  Cette fonction locale n'intègre pas `twMerge` (de `tailwind-merge`), ce qui peut provoquer des conflits silencieux de classes Tailwind CSS si des variantes entrent en concurrence.
- **Remède recommandé (`TASK-CLEAN-03`) :**
  Remplacer par `import { cn } from '@/lib/utils'` et supprimer la déclaration locale.

---

### 6. 🔤 Typo dans le wizard de projet & Bouton "Open Board" inactif
- **Fichier :** [`src/app/projects/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/projects/page.tsx#L178-L252)
- **Constat :**
  - L178 : "Sources Integreated" (faute d'orthographe) au lieu de "Sources Integrated".
  - L250 : `<Button variant="outline" className="...">Open Board <ArrowRight className="h-4 w-4" /></Button>` n'a aucun `onClick` ni `asChild Link`.
- **Remède recommandé :**
  Corriger la faute d'orthographe et connecter le bouton "Open Board" à l'affichage des sources associées au projet ou une vue dédiée.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-UX-11`** | UX / Search | 🟡 HAUTE | Activation de la barre de recherche rapide (Quick Search) du Header | `src/components/layout/ModernHeader.tsx` |
| **`TASK-UX-12`** | UX / Auth | 🔴 HAUTE | Intégration session Better-Auth réelle & menu profil dans la Sidebar | `src/components/layout/ModernSidebar.tsx`, `src/lib/auth-client.ts` |
| **`TASK-UX-13`** | A11y / HTML | 🔴 HAUTE | Élimination des balises imbriquées `<a><button>` via `asChild` | `src/app/page.tsx`, `src/app/history/page.tsx`, `src/components/layout/ModernSidebar.tsx` |
| **`TASK-CLEAN-02`**| Hygiène | 🟢 MOYENNE | Suppression du composant orphelin dead-code `ConfigurationCard.tsx` | `src/components/offers/ConfigurationCard.tsx` |
| **`TASK-CLEAN-03`**| Hygiène | 🟢 MOYENNE | Nettoyage de la fonction `cn()` redondante dans `src/app/page.tsx` | `src/app/page.tsx` |
| **`TASK-FIX-04`** | Projets / UI | 🟡 MOYENNE | Correction typo "Integreated" et liaison active du bouton "Open Board" | `src/app/projects/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Préservé sous le seuil strict de 250 lignes (actuellement 245 lignes).
- **Règles Inviolables :** Aucun ajout de fonctionnalité majeure nouvelle ; focus absolu sur la qualité, la clarté et l'enchantement de l'expérience utilisateur existante.
