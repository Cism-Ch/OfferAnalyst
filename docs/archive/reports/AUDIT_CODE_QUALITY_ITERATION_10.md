# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 10

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Hooks & Persistance d'état : `src/hooks/use-saved-offers.ts`, `src/hooks/use-search-history.ts`, `src/hooks/use-temporary-api-keys.ts`
- Contexte Global d'Analyse : `src/contexts/AnalysisContext.tsx`
- Server Actions & Conformité Agent.md : `src/app/actions/organize.ts`, `src/app/saved/page.tsx`
- Parcours Onboarding & Cohérence des Modèles : `src/app/onboarding/page.tsx`, `src/components/onboarding/FirstSearchStep.tsx`
- Comparateur d'offres & Cycle de vie : `src/app/compare/page.tsx`

---

## 🎯 Objectif de la Revue
Éradiquer les blocages silencieux, les régressions de navigation, les violations des règles fondamentales d'architecture (`{ success, data | error }`) et les désynchronisations d'expérience utilisateur dans l'application OfferAnalyst.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🚨 Race Condition Bloquante sur `/compare` (Expulsion automatique vers `/saved`)
- **Fichiers :** 
  - [`src/hooks/use-saved-offers.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/hooks/use-saved-offers.ts#L8-L75)
  - [`src/app/compare/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/compare/page.tsx#L16-L40)
- **Constat :**
  Dans `useSavedOffers()`, l'état initial `savedOffers` est initialisé à `[]` pour éviter les erreurs d'hydratation SSR/Client. L'effet de chargement de `localStorage` s'exécute de manière asynchrone après le premier cycle de rendu.
  Or, dans `src/app/compare/page.tsx` :
  ```tsx
  const { savedOffers } = useSavedOffers();
  const selectedOffers = useMemo(() => {
      // Filtrage basé sur searchParams et savedOffers
  }, [searchParams, savedOffers]);

  useEffect(() => {
      if (selectedOffers.length < 2) {
          router.push('/saved');
      }
  }, [selectedOffers, router]);
  ```
  Au premier montage, `savedOffers` est vide, `selectedOffers.length` vaut 0 (< 2), ce qui déclenche immédiatement `router.push('/saved')` avant que le `localStorage` ne soit lu !
- **Impact Utilisateur :**
  Un utilisateur sélectionne 2 ou 3 offres dans `/saved` et clique sur **"Compare (2/3)"**. La page `/compare` s'ouvre et le renvoie instantanément sur `/saved`. La fonctionnalité de comparaison est totalement inutilisable.
- **Remède recommandé (`TASK-FIX-01.01`) :**
  1. Dans `use-saved-offers.ts`, ajouter un état `const [isLoaded, setIsLoaded] = useState(false)` passé à `true` dans le `finally` du premier chargement de `localStorage`, et l'exporter.
  2. Dans `src/app/compare/page.tsx`, conditionner la redirection :
     ```tsx
     useEffect(() => {
         if (isLoaded && selectedOffers.length < 2) {
             router.push('/saved');
         }
     }, [isLoaded, selectedOffers, router]);
     ```

---

### 2. 🔌 Régression Silencieuse : "Restore Search" dans `/history` inopérant
- **Fichiers :**
  - [`src/app/history/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/history/page.tsx#L61-L67)
  - [`src/contexts/AnalysisContext.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/contexts/AnalysisContext.tsx#L99-L136)
- **Constat :**
  Dans `src/app/history/page.tsx`, lorsqu'un utilisateur clique sur "Restore Search", le gestionnaire fait :
  ```tsx
  const handleRestoreSearch = (item: SearchHistoryItem) => {
      sessionStorage.setItem('restore_search', JSON.stringify(item));
      router.push('/');
  };
  ```
  Mais dans `AnalysisContext.tsx`, l'effet d'initialisation lit uniquement `window.localStorage.getItem("offeranalyst_dashboard_state")`. `sessionStorage.getItem('restore_search')` n'est JAMAIS écouté ni consommé !
- **Impact Utilisateur :**
  L'utilisateur clique sur "Restore Search", est redirigé vers l'accueil, mais ses paramètres de recherche (domaine, critères, offres analysées) ne sont pas restaurés.
- **Remède recommandé (`TASK-FIX-01.02`) :**
  Dans `AnalysisContext.tsx`, vérifier au montage la présence de `sessionStorage.getItem('restore_search')`. Si trouvé :
  - Hydrater `domain`, `explicitCriteria`, `implicitContext`, et `results`.
  - Supprimer la clé du `sessionStorage`.
  - Émettre un toast informatif : `"Recherche restaurée", "Paramètres et résultats rechargés avec succès"`.

---

### 3. ⚠️ Server Action `organizeOffersAction` hors standard `{ success, data | error }` & popups `alert()`
- **Fichiers :**
  - [`src/app/actions/organize.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/organize.ts#L37-L48)
  - [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx#L23-L35)
- **Constat :**
  `organizeOffersAction` lance des exceptions brutes (`throw new AgentError(...)`) et retourne directement `Promise<OrganizedOffers>`.
  Les règles inviolables 7 et 10 d'`AGENTS.md` et `user_global` imposent le pattern canonique :
  `Promise<{ success: true; data: OrganizedOffers } | { success: false; error: { code: string; message: string } }>`.
  De plus, dans `src/app/saved/page.tsx`, l'erreur est capturée par `alert("Failed to organize offers.")`, un mécanisme synchrone intrusif et archaïque.
- **Remède recommandé (`TASK-FIX-05`) :**
  1. Refactorer `organizeOffersAction` pour renvoyer le pattern `{ success: true, data } | { success: false, error }`.
  2. Remplacer `alert(...)` dans `saved/page.tsx` par un toast d'erreur stylisé via `useToast()`.

---

### 4. 🏷️ Incohérence de Modèle dans l'Étape 4 de l'Onboarding (`GPT-4o Mini` vs `Gemini 3.5 Flash Lite`)
- **Fichier :** [`src/components/onboarding/FirstSearchStep.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/onboarding/FirstSearchStep.tsx#L89-L92)
- **Constat :**
  Dans la carte de démonstration de la première analyse :
  ```tsx
  <div>
    <label className="text-sm font-medium text-muted-foreground">AI Model</label>
    <p className="text-lg font-semibold">GPT-4o Mini</p>
  </div>
  ```
  Le modèle gratuit par défaut de l'application est **Google Gemini 3.5 Flash Lite** (ou **NVIDIA Nemotron 3.5**). Mentionner "GPT-4o Mini" (qui nécessite une clé OpenAI payante ou BYOK) induit l'utilisateur en erreur sur le modèle inclus d'office.
- **Remède recommandé (`TASK-UX-14`) :**
  Mettre à jour le libellé pour refléter `Gemini 3.5 Flash Lite (Inclus)` en cohérence avec le reste de l'application.

---

### 5. 🔔 Manque de Feedback Visuel (Toasts) lors de la Sauvegarde d'Offres
- **Fichier :** [`src/components/offers/OfferCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/OfferCard.tsx#L72-L96)
- **Constat :**
  Le clic sur "Sauvegarder" modifie le state local et change le bouton en "Sauvegardé", mais ne déclenche aucune notification Toast globale informant l'utilisateur que l'offre est consultable dans son espace `/saved`.
- **Remède recommandé (`TASK-UX-15`) :**
  Ajouter un toast de confirmation discret (`toast.success("Offre enregistrée", "Retrouvez-la à tout moment dans 'Saved Offers'")`).

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-FIX-01.01`** | Comparateur | 🔴 CRITIQUE | Correction de la race condition d'expulsion sur `/compare` via `isLoaded` | `src/hooks/use-saved-offers.ts`, `src/app/compare/page.tsx` |
| **`TASK-FIX-01.02`** | Historique | 🔴 HAUTE | Restauration opérationnelle de recherche depuis `/history` | `src/contexts/AnalysisContext.tsx`, `src/app/history/page.tsx` |
| **`TASK-FIX-05`** | Server Action | 🔴 HAUTE | Harmonisation `{ success, data \| error }` sur `organizeOffersAction` & toast dans `/saved` | `src/app/actions/organize.ts`, `src/app/saved/page.tsx` |
| **`TASK-UX-14`** | Onboarding | 🟡 MOYENNE | Alignement du modèle démo onboarding sur `Gemini 3.5 Flash Lite` | `src/components/onboarding/FirstSearchStep.tsx` |
| **`TASK-UX-15`** | Feedback UI | 🟢 MOYENNE | Toast de confirmation lors de l'enregistrement d'une offre | `src/components/offers/OfferCard.tsx`, `src/app/analysis/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Confirmé à 0 erreur par `npx tsc --noEmit`.
- **SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Zéro fonctionnalité superflue, perfectionnement et sécurisation chirurgicale de ce qui est déjà entre les mains des utilisateurs.
