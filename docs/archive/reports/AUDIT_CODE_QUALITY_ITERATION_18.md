# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 18

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :**
- Flux de Restauration d'Historique : `src/app/history/page.tsx`, `src/hooks/use-restore-search.ts`, `src/contexts/AnalysisContext.tsx`
- Accueil & Accessibilité DOM : `src/app/page.tsx`, `src/components/ui/button.tsx`
- Cadrage de Recherche & Presets Rapides : `src/app/search-context/page.tsx`
- Hygiène du Code & Dépendances Orphelines : `src/hooks/use-offer-analysis.ts`, `src/components/offers/ConfigurationCard.tsx`

---

## 🎯 Objectif de la Revue
Découvrir pourquoi la restauration d'historique échoue silencieusement, résoudre les violations d'accessibilité DOM (`<button>` dans `<a>`), ajouter des puces d'exemples rapides (1-clic) pour fluidifier l'onboarding sans ajouter de complexité, et purger le code mort obsolète.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🔇 Échec Silencieux de la Restauration d'Historique (`useRestoreSearch` non branché)
- **Fichiers :**
  - [`src/app/history/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/history/page.tsx#L62-L66)
  - [`src/hooks/use-restore-search.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-restore-search.ts#L1-L76)
  - [`src/contexts/AnalysisContext.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/contexts/AnalysisContext.tsx#L99-L136)
- **Constat :**
  Sur la page Historique (`/history`), lorsqu'un utilisateur clique sur l'action de réutilisation d'une recherche passée :
  ```tsx
  const handleRestoreSearch = (item: SearchHistoryItem) => {
      sessionStorage.setItem('restore_search', JSON.stringify(item));
      router.push('/');
  };
  ```
  Le hook dédié `useRestoreSearch` a bien été développé dans `src/hooks/use-restore-search.ts`, mais il n'est **importé ni appelé nulle part** dans toute la base de code !
  À l'arrivée sur `/` ou dans `AnalysisContext`, `sessionStorage.getItem('restore_search')` n'est jamais lu.
- **Impact Utilisateur :**
  L'utilisateur croit restaurer une recherche précédente mais arrive sur une page d'accueil vide, sans message d'erreur ni restauration de ses critères.
- **Remède recommandé (`TASK-FIX-07`) :**
  Intégrer la lecture de `sessionStorage.getItem('restore_search')` dans le `useEffect` d'initialisation de `AnalysisContext.tsx` pour hydrater instantanément `domain`, `explicitCriteria`, `implicitContext` et `results`, puis émettre un toast `"Recherche restaurée depuis l'historique"`.

---

### 2. ♿ Violation d'Accessibilité HTML : Bouton Imbriqué dans un Lien (`<a><button>`)
- **Fichier :** [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L128-L151)
- **Constat :**
  Dans la grille des 3 étapes du workflow :
  ```tsx
  <Link href={step.href}>
      <Card className="...">
          ...
          <CardContent>
              <Button variant="ghost" className="w-full justify-between group">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
              </Button>
          </CardContent>
      </Card>
  </Link>
  ```
  Un élément `<button>` est imbriqué dans une balise `<a>` (`validateDOMNesting`).
- **Impact Utilisateur :**
  Avertissement console en mode développement, piège au focus clavier et comportements erratiques pour les lecteurs d'écran WCAG.
- **Remède recommandé (`TASK-UX-33`) :**
  Remplacer `<Button variant="ghost">` par un `<div>` stylisé avec les mêmes classes esthétiques, ou utiliser `asChild` pour préserver un seul élément cliquable sémantique.

---

### 3. 💡 Absence de Presets d'Exemple & Validation Absente sur `/search-context`
- **Fichier :** [`src/app/search-context/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/search-context/page.tsx#L128-L144)
- **Constat :**
  - Un nouvel utilisateur arrivant sur `/search-context` doit rédiger manuellement le domaine et les critères sans aucune suggestion ni modèle d'inspiration.
  - Le bouton `"Next: Data Source"` est un lien inconditionnel `<Link href="/data-source">`. L'utilisateur peut cliquer sans rien remplir, ce qui provoque une erreur lors du lancement de l'analyse.
- **Impact Utilisateur :**
  Friction cognitive au premier démarrage et risque d'échec de requête.
- **Remède recommandé (`TASK-UX-34`) :**
  - Ajouter 3 puces cliquables d'exemples rapides (ex: *"💼 Jobs : Développeur Fullstack Remote"*, *"🏠 Immo : Appartement 3 pièces Paris < 500k€"*, *"💻 Tech : MacBook Pro M3 32Go"*) qui pré-remplissent le formulaire en 1 clic.
  - Désactiver le bouton `"Next: Data Source"` si `domain` ou `explicitCriteria` est vide.

---

### 4. 🧹 Redéclaration Locale de `cn()` dans `src/app/page.tsx`
- **Fichier :** [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L256-L258)
- **Constat :**
  ```tsx
  function cn(...classes: (string | boolean | undefined)[]) {
      return classes.filter(Boolean).join(' ');
  }
  ```
  Le composant redéfinit sa propre version incomplète de `cn()` qui ne gère pas les collisions de classes Tailwind (`tailwind-merge`), en contradiction avec la règle 13 d'`Agent.md`.
- **Remède recommandé (`TASK-CLEAN-05`) :**
  Supprimer la fonction locale et importer `cn` depuis `@/lib/utils`.

---

### 5. 🗑️ Fichiers Morts Encombrants Résiduels
- **Fichiers :**
  - `src/components/offers/ConfigurationCard.tsx` (211 lignes — composant obsolète issu du Sprint 1)
  - `src/hooks/use-offer-analysis.ts` (169 lignes — remplacé par `AnalysisContext.tsx`)
  - `src/hooks/use-save-notification.ts` (46 lignes — remplacé par Sonner toast)
- **Remède recommandé (`TASK-CLEAN-01`) :**
  Supprimer ces fichiers orphelins pour préserver la clarté et la maintenabilité de la codebase.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-07`** | Restauration / Historique | 🔴 CRITIQUE | Activation de la restauration de recherche historique dans `AnalysisContext.tsx` | `src/contexts/AnalysisContext.tsx`, `history/page.tsx` |
| **`TASK-UX-33`** | Accessibilité / WCAG | 🔴 HAUTE | Élimination de l'imbrication `<button>` dans `<a>` sur la page d'accueil (`/`) | `src/app/page.tsx` |
| **`TASK-UX-34`** | Onboarding / Delight | 🟡 MOYENNE | Puces d'exemples rapides (1-clic) et validation de saisie sur `/search-context` | `src/app/search-context/page.tsx` |
| **`TASK-CLEAN-05`** | Hygiène de Code | 🟢 BASSE | Remplacement du `cn()` local par l'import officiel `@/lib/utils` | `src/app/page.tsx` |
| **`TASK-CLEAN-01`** | Nettoyage | 🟢 BASSE | Suppression des fichiers obsolètes (`ConfigurationCard.tsx`, hooks orphelins) | `src/components/offers/`, `src/hooks/` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Amélioration incrémentale de l'existant, fluidité d'usage et suppression de toute friction perçue.
