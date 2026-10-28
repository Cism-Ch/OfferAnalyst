# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 17

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Comparateur d'Offres & Synchronisation Client : `src/app/compare/page.tsx`, `src/hooks/use-saved-offers.ts`
- Cartes d'Offres & Restitution Web : `src/components/offers/OfferCard.tsx`, `src/components/offers/ResultsSection.tsx`
- Pipeline de Données & URLs Sources : `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`
- Gestion des Projets de Recherche : `src/app/projects/page.tsx`, `src/hooks/use-projects.ts`

---

## 🎯 Objectif de la Revue
Détecter les conditions de concurrence au chargement (race condition expulsant l'utilisateur de `/compare`), les données perdues entre l'IA et l'UI (URLs sources réelles ignorées dans les cartes d'offres), et les boutons d'action inertes dans les vues projets.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🚨 Race Condition Critique sur `/compare` : Éjection Immédiate vers `/saved`
- **Fichiers :**
  - [`src/app/compare/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/compare/page.tsx#L34-L40)
  - [`src/hooks/use-saved-offers.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-saved-offers.ts#L12-L35)
- **Constat :**
  Dans `useSavedOffers`, l'état `savedOffers` est initialisé à `[]` pour éviter les erreurs d'hydratation SSR :
  ```tsx
  const [savedOffers, setSavedOffers] = useState<Offer[]>([]);
  ```
  Sur `/compare?ids=1,2`, le `useEffect` de redirection s'exécute dès le premier rendu :
  ```tsx
  useEffect(() => {
      if (selectedOffers.length < 2) {
          router.push('/saved');
      }
  }, [selectedOffers, router]);
  ```
  Avant même que `localStorage` ne soit lu par l'effet client de `useSavedOffers`, `selectedOffers.length` vaut `0`. L'utilisateur est immédiatement expulsé vers `/saved`.
- **Impact Utilisateur :**
  Impossible d'accéder au comparateur par URL directe ou après un rafraîchissement de page (`F5`).
- **Remède recommandé (`TASK-FIX-01`) :**
  Exposer `isLoaded: boolean` depuis `useSavedOffers` et conditionner la redirection à `isLoaded && selectedOffers.length < 2`.

---

### 2. 🔗 URLs Sources Réelles Disparues dans les Cartes d'Offres (`OfferCard.tsx`)
- **Fichiers :**
  - [`src/components/offers/OfferCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/OfferCard.tsx#L48-L98)
  - [`src/app/actions/fetch.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/fetch.ts#L10-L18)
  - [`src/types/index.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/types/index.ts#L1-L10)
- **Constat :**
  Le pipeline de collecte `fetchOffersAction` extrait scrupuleusement le champ `url` de chaque offre web trouvée (job board, annonce immobilière, fiche produit).
  Pourtant, dans `OfferCard.tsx`, le champ `offer.url` n'est **jamais affiché ni utilisé**.
- **Impact Utilisateur :**
  L'utilisateur consulte une recommandation mais ne dispose d'aucun lien pour ouvrir l'offre source originale et postuler ou acheter.
- **Remède recommandé (`TASK-UX-29`) :**
  Si `offer.url` est présent et valide, afficher un bouton ou lien stylisé `"Consulter l'annonce"` avec l'icône `ExternalLink` ouvrant l'offre dans un nouvel onglet sécurisé (`rel="noopener noreferrer"`).

---

### 3. 📄 Sources & Citations Web Ignorées dans `ResultsSection.tsx`
- **Fichiers :**
  - [`src/components/offers/ResultsSection.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ResultsSection.tsx#L68-L97)
  - [`src/app/actions/analyze.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/analyze.ts#L170-L179)
- **Constat :**
  Le type `AnalysisResponse` inclut `searchSources: SearchSource[]`.
  Dans `analyze.ts`, `searchSources` est renvoyé vide (`[]`), et `ResultsSection.tsx` ne prévoit aucun bloc pour afficher les sources d'information.
- **Impact Utilisateur :**
  Manque de transparence et de crédibilité perçue pour une plateforme d'analyse de marché propulsée par l'IA.
- **Remède recommandé (`TASK-UX-30`) :**
  Peupler automatiquement `searchSources` dans `analyzeOffersAction` à partir des URLs uniques des offres analysées, et intégrer un panneau accordéon compact `"Sources & Références Web"` sous le résumé de marché.

---

### 4. 🔲 Bouton Factice "Open Board" & Coquille Textuelle dans `ProjectsPage.tsx`
- **Fichier :** [`src/app/projects/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/projects/page.tsx#L178-L253)
- **Constat :**
  - Le bouton `"Open Board"` dans les cartes de projets n'a aucun gestionnaire `onClick` ni lien `href`. Cliquer dessus ne produit aucune réaction.
  - Ligne 178 : faute d'orthographe visible `"Sources Integreated"` au lieu de `"Sources Integrated"`.
- **Remède recommandé (`TASK-UX-31`) :**
  Corriger la faute et connecter `"Open Board"` à un dialogue modal de prévisualisation détaillant les contextes de recherche agrégés et les offres associées au projet.

---

### 5. 🩹 Formatage Fragile de Localisation et Prix dans `OfferCard.tsx`
- **Fichier :** [`src/components/offers/OfferCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/OfferCard.tsx#L55-L58)
- **Constat :**
  ```tsx
  {offer.location} • {offer.price && typeof offer.price === 'number' ? offer.price.toLocaleString() : offer.price}
  ```
  Si `offer.location` ou `offer.price` est absent ou indéfini, le rendu affiche un point orphelin ` • ` ou `undefined`.
- **Remède recommandé (`TASK-UX-32`) :**
  Normaliser via `[offer.location, formattedPrice].filter(Boolean).join(' • ')`.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-01`** | Robustesse / Hydratation | 🔴 CRITIQUE | Correction de la race condition d'éjection sur `/compare` via `isLoaded` | `src/hooks/use-saved-offers.ts`, `src/app/compare/page.tsx` |
| **`TASK-UX-29`** | UI / Delight | 🔴 HAUTE | Affichage du lien direct vers l'annonce source (`ExternalLink`) dans `OfferCard` | `src/components/offers/OfferCard.tsx` |
| **`TASK-UX-30`** | Transparence / Sources | 🟡 MOYENNE | Restitution des sources et citations web vérifiées dans `ResultsSection.tsx` | `src/components/offers/ResultsSection.tsx`, `analyze.ts` |
| **`TASK-UX-31`** | UX / Projets | 🟡 MOYENNE | Activation de la modale de prévisualisation sur "Open Board" et fix typo | `src/app/projects/page.tsx` |
| **`TASK-UX-32`** | Robustesse UI | 🟢 BASSE | Sécurisation du formatage prix / localisation contre les valeurs indéfinies | `src/components/offers/OfferCard.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Zéro ajout de fonctionnalité majeure — 100% orienté polissage, fluidité et valeur concrète pour l'utilisateur final.
