# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish (Cycle 3)

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 3)  
> **Objectif :** Examiner les flux de comparaison (`/compare`), d'historique (`/history`) et de gestion de projets (`/projects`).

---

## 📋 Synthèse Exécutive (Itération 3)

| Domaine | Problème Détecté | Impact Utilisateur | Priorité |
| :--- | :--- | :--- | :--- |
| **Comparaison (`/compare`)** | Redirection intempestive vers `/saved` sur rechargement (Race condition) | L'utilisateur perd sa comparaison dès qu'il rafraîchit la page | 🔴 Critique |
| **Historique (`/history`)** | "Restore Search" déconnecté : rien ne se restaure sur la page d'accueil | Fonctionnalité majeure de réutilisation des recherches inopérante | 🔴 Critique |
| **Projets (`/projects`)** | Bouton "Open Board" inactif (aucun `onClick` ni `href`) + faute "Integreated" | Clic dans le vide, sensation d'inachevé | 🟡 Moyenne |
| **Accessibilité (`/history`)** | Imbrication `<Link><Button>` sans `asChild` | Violations DOM interactive content | 🟢 Faible |

---

## 🛠️ Diagnostics Détaillés

### 1. Race Condition et Redirection Involontaire sur `/compare`
* **Fichier concerné :** [`src/app/compare/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/compare/page.tsx#L34-L40)
* **Cause technique :** `useSavedOffers` initialise son état avec un tableau vide `[]` côté client pour prévenir les discordances d'hydratation. Lors du montage de `/compare?ids=...`, l'effet `useEffect` s'exécute immédiatement avec `selectedOffers.length === 0` et déclenche `router.push('/saved')` avant la lecture de `localStorage`.
* **Remède :** Ajouter un état `isLoaded` dans `useSavedOffers` et conditionner la redirection dans `ComparePageContent` : `if (isLoaded && selectedOffers.length < 2) router.push('/saved')`.

---

### 2. Rupture de la Restauration de Recherche depuis `/history`
* **Fichiers concernés :**
  * [`src/app/history/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/history/page.tsx#L61-L66)
  * [`src/contexts/AnalysisContext.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/contexts/AnalysisContext.tsx)
* **Cause technique :** `HistoryPage` enregistre `sessionStorage.setItem('restore_search', JSON.stringify(item))` et redirige vers `/`. Cependant, ni `page.tsx` ni `AnalysisContext` ne dépilent cette valeur. L'ancien hook `use-restore-search.ts` a été délaissé lors de la refonte contextuelle.
* **Remède :** Intégrer l'écoute et l'hydratation de `restore_search` directement dans `AnalysisContext.tsx` au montage, puis rediriger fluidement vers `/search-context` ou `/analysis` avec un toast de succès.

---

### 3. Bouton Mort "Open Board" & Polissage UI dans `/projects`
* **Fichier concerné :** [`src/app/projects/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/projects/page.tsx#L178-L252)
* **Constat :**
  * Le bouton `<Button variant="outline">Open Board</Button>` ne possède aucun événement d'action.
  * Faute de frappe : `"Sources Integreated"` au lieu de `"Sources Intégrées"` / `"Sources Integrated"`.
* **Remède :** Ouvrir un dialogue de consultation détaillé des sources associées au projet (ou afficher un badge descriptif) et corriger la typographie.

---

## 📌 Propositions de TASKs candidates (Cycle 3)

* **`TASK-FIX-01` (Priorité 🔴 Critique) :** Résolution de la Race Condition sur `/compare` & Restauration Effective des Recherches depuis l'Historique dans `AnalysisContext`.
* **`TASK-UX-05` (Priorité 🟡 Moyenne) :** Polissage de `/projects` (Fix du bouton "Open Board", modal récapitulatif des sources et correction typographique).
