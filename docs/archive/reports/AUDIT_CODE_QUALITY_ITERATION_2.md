# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish (Cycle 2)

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 2)  
> **Objectif :** Poursuivre l'inspection approfondie des flux, hooks, persistance et cohérence UX/UI de l'existant.

---

## 📋 Synthèse Exécutive (Itération 2)

| Domaine | Problème Détecté | Impact Utilisateur / Développeur | Priorité |
| :--- | :--- | :--- | :--- |
| **Code Mort (Hooks orphelins)** | ~300 lignes inutilisées (`use-offer-analysis`, `use-restore-search`, `use-save-notification`) | Confusion architecturale, maintenance alourdie | 🟡 Moyenne |
| **Server Actions (Organize)** | Non-conformité au retour `{ success, data \| error }` dans `organize.ts` | Crash silencieux ou dialogue bloquant `alert()` dans `/saved` | 🔴 Haute |
| **Feedback UX (Toasts)** | Absence de toast lors de la sauvegarde / suppression d'une offre | Manque de réassurance visuelle pour l'utilisateur | 🟡 Moyenne |
| **Dark Mode & Accessibilité** | Bannière `SecurityMigrationBanner` (jaune flash sans dark mode) & `<a>` natif | Flash visuel en thème sombre, hard reload sur `/auth/signup` | 🟡 Moyenne |
| **Navigation Tunnel Analyse** | `router.push('/analysis')` asynchrone non coordonné dans `data-source` | Risque de transition prématurée sur saisie JSON invalide | 🟢 Faible |

---

## 🛠️ Diagnostics Détaillés

### 1. Code Mort & Hooks Orphelins
* **Fichiers concernés :**
  * [`src/hooks/use-offer-analysis.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-offer-analysis.ts) (169 lignes, entièrement remplacé par `AnalysisContext.tsx`)
  * [`src/hooks/use-restore-search.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-restore-search.ts) (77 lignes, zéro import)
  * [`src/hooks/use-save-notification.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-save-notification.ts) (46 lignes, zéro import)
* **Recommandation :** Supprimer ces 3 fichiers orphelins pour assainir le dossier `src/hooks/`.

---

### 2. Standardisation de la Server Action d'Organisation & Élimination de `alert()`
* **Fichiers concernés :**
  * [`src/app/actions/organize.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/organize.ts)
  * [`src/app/actions/organizeV2.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/organizeV2.ts)
  * [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx#L31)
* **Constat :** Contrairement à `fetchOffersAction` et `analyzeOffersAction`, `organizeOffersAction` lance directement une exception (`throw new AgentError`), forçant le composant client `/saved` à attraper l'erreur via un `alert("Failed to organize offers.")`.
* **Recommandation :** Harmoniser `organizeOffersAction` vers le type standard `AgentActionResult<OrganizedOffers>` et remplacer `alert()` par un toast de notification moderne `toast.error()`.

---

### 3. Polish UX : Notification Toasts sur la Sauvegarde d'Offres
* **Fichiers concernés :**
  * [`src/hooks/use-saved-offers.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-saved-offers.ts)
  * [`src/components/offers/OfferCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/OfferCard.tsx)
* **Constat :** Cliquer sur "Sauvegarder" dans une fiche d'offre passe l'état en "Sauvegardé" sans toast de confirmation.
* **Recommandation :** Émettre un toast informatif (`toast.success("Offre ajoutée aux favoris", "Retrouvez-la à tout moment dans l'onglet Offres Sauvegardées.")`) avec bouton d'action vers `/saved`.

---

### 4. Cohérence Dark Mode & Navigation Radix dans `SecurityMigrationBanner`
* **Fichier concerné :** [`src/components/api-keys/SecurityMigrationBanner.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/SecurityMigrationBanner.tsx)
* **Constat :** La bannière d'avertissement utilise `bg-yellow-50 text-yellow-800` en dur sans support de thème sombre (`dark:bg-yellow-950/40 dark:text-yellow-200`), ce qui éblouit en thème nuit. Les balises `<Link>` englobent des `<Button>` sans `asChild`.
* **Recommandation :** Ajouter les classes dark mode adéquates et appliquer `asChild`.

---

## 📌 Propositions de TASKs candidates (Suite)

* **`TASK-PERF-01` (Priorité 🟡 Moyenne) :** Élimination du Code Mort (~300 lignes dans `src/hooks/`) & Suppression des `console.log` résiduels.
* **`TASK-ACTION-01` (Priorité 🔴 Haute) :** Harmonisation de `organizeOffersAction` (`AgentActionResult`) & Remplacement de `alert()` par `useToast` sur `/saved`.
* **`TASK-UX-04` (Priorité 🟢 Polish) :** Toasts interactifs sur Sauvegarde / Retrait d'Offres & Fix Dark Mode sur `SecurityMigrationBanner`.
