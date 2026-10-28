# 🔍 Rapport d'Audit & Concertation IA — Qualité & Polish de l'Existant

> **Date :** 28 Octobre 2026  
> **Type :** Concertation Programmée (Cycle 15 min - Itération 1)  
> **Objectif :** Examiner l'existant, détecter les frictions UX/UI, bugs visuels et défauts d'hygiène afin de proposer des améliorations ciblées (zéro nouvelle fonctionnalité majeure).

---

## 📋 Synthèse Exécutive

Dans le cadre du protocole de concertation continue, un audit approfondi des composants UI, de la navigation, des graphiques et de la qualité du code a été mené sur la codebase **OfferAnalyst**.

| Domaine | État Actuel | Diagnostic & Impact Utilisateur | Priorité |
| :--- | :--- | :--- | :--- |
| **Data Viz / Graphiques** | ⚠️ Dégradé en thèmes | `hsl(var(--card))` invalide avec Tailwind v4 (hexadécimal), tooltips cassés | 🔴 Haute |
| **Accessibilité (a11y)** | ⚠️ Non conforme | Imbrication HTML interdite `<a><button>` dans `ModernSidebar` et `page.tsx` | 🟡 Moyenne |
| **Cohérence Linguistique** | ⚠️ Mixte FR / EN | Formulaires et résultats en anglais, alertes/diagnostics en français | 🟡 Moyenne |
| **Gestion d'Erreur Navigation** | ⚠️ Rechargement dur | `ErrorBoundary.tsx` utilise `window.location.href = '/'` | 🟢 Faible |
| **Hygiène Code (ESLint)** | 9 Warnings | Paramètres résiduels `_providedUserId` et fichier `.backup` orphelin | 🟢 Faible |

---

## 🛠️ Diagnostics Détaillés

### 1. Invalidation des Couleurs CSS dans Recharts (`ScoreChart` & `AnalyticsDashboard`)
* **Fichiers concernés :**
  * [`src/components/offers/ScoreChart.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ScoreChart.tsx#L65-L75)
  * [`src/components/api-keys/AnalyticsDashboard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/AnalyticsDashboard.tsx#L190-L295)
  * [`src/app/dashboard/analytics/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/dashboard/analytics/page.tsx#L199-L309)
* **Cause :** Dans Tailwind CSS v4, les variables du thème (`globals.css`) sont définies sous forme de codes hexadécimaux (`#ffffff`, `#18181b`, `#d4af37`). Les composants graphiques encapsulent ces variables dans `hsl(var(--card))` ou `hsl(var(--primary))`, produisant du CSS invalide (`hsl(#ffffff)`).
* **Conséquence :** Les fonds de tooltips au survol ne s'affichent pas correctement selon le thème actif, créant un contraste illisible ou des bordures manquantes.
* **Remède :** Utiliser directement `var(--card)`, `var(--card-foreground)`, `var(--border)` et `var(--primary)`.

---

### 2. Violations HTML d'Éléments Interactifs Imbriqués (`<a><button>`)
* **Fichiers concernés :**
  * [`src/components/layout/ModernSidebar.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx#L100-L125)
  * [`src/app/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/page.tsx#L128-L151)
* **Cause :** `<Link>` (Next.js) génère une balise `<a>`, tandis que `<Button>` génère une balise `<button>`. Imbriquer un `<button>` dans un `<a>` viole la spécification HTML standard.
* **Conséquence :** Risque de conflits d'événements, mauvaise accessibilité pour les lecteurs d'écran et avertissements au rendu client.
* **Remède :** Utiliser la prop `asChild` sur `<Button asChild><Link href="...">...</Link></Button>` ou remplacer le bouton décoratif interne par un `span` stylisé.

---

### 3. Harmonisation Linguistique du Parcours d'Analyse (FR)
* **Fichiers concernés :**
  * [`src/components/offers/ConfigurationCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ConfigurationCard.tsx)
  * [`src/components/offers/ResultsSection.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ResultsSection.tsx)
  * [`src/components/offers/OfferCard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/OfferCard.tsx)
  * [`src/app/analysis/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/analysis/page.tsx)
* **Cause :** Les titres et libellés de l'étape d'analyse ("Define your context", "Top Recommendations", "Relevance", "Score Distribution") sont restés en anglais alors que la barre de statut live, les diagnostics d'erreurs et le dashboard sont traduits en français soigné.
* **Conséquence :** Sentiment de discontinuité pour l'utilisateur final francophone.
* **Remède :** Unifier les libellés en français élégant, naturel et engageant.

---

### 4. Navigation Fluide dans l'ErrorBoundary
* **Fichier concerné :** [`src/components/ErrorBoundary.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ErrorBoundary.tsx#L116)
* **Cause :** `onClick={() => window.location.href = '/'}` force un hard reload du navigateur.
* **Remède :** Utiliser `<Button asChild variant="outline"><Link href="/">Retour à l'accueil</Link></Button>`.

---

### 5. Hygiène du Code & Élimination des 9 Warnings ESLint
* **Fichiers concernés :**
  * [`src/app/actions/db/analytics.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/analytics.ts)
  * [`src/app/actions/db/api-keys.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-keys.ts)
  * [`src/app/actions/db/security-alerts.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/security-alerts.ts)
  * [`src/components/layout/ModernSidebar.tsx.backup`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/layout/ModernSidebar.tsx.backup)
* **Cause :** Le paramètre `_providedUserId` est devenu inutile après le durcissement IDOR (la session serveur singleton est désormais systématiquement interrogée). Le fichier `.backup` est orphelin.
* **Remède :** Supprimer les paramètres résiduels inutilisés et le fichier `.backup`.

---

## 📌 Propositions de TASKs pour le Backlog

1. **`TASK-UX-02` — Fiabilisation des Couleurs Recharts CSS (`var(--...)`) & Accessibilité Radix (`asChild`)**
   * **Priorité :** 🔴 CRITIQUE (UI/UX)
   * **Fichiers :** `src/components/offers/ScoreChart.tsx`, `src/components/api-keys/AnalyticsDashboard.tsx`, `src/app/dashboard/analytics/page.tsx`, `src/components/layout/ModernSidebar.tsx`, `src/app/page.tsx`
   * **Critères d'acceptation :**
     * [ ] Remplacer toutes les occurrences `hsl(var(--...))` par `var(--...)` dans les graphiques.
     * [ ] Mettre en place `asChild` sur les boutons contenant des liens `<Link>`.
     * [ ] Validation visuelle des tooltips en thèmes Clair, Sombre et Gold.

2. **`TASK-UX-03` — Harmonisation Linguistique & Polish Émotionnel du Parcours d'Analyse (FR)**
   * **Priorité :** 🟡 HAUTE (Expérience Utilisateur)
   * **Fichiers :** `src/components/offers/ConfigurationCard.tsx`, `src/components/offers/ResultsSection.tsx`, `src/components/offers/OfferCard.tsx`, `src/app/analysis/page.tsx`
   * **Critères d'acceptation :**
     * [ ] Traduction fluide et cohérente en français des libellés, placeholders et badges.
     * [ ] Amélioration des micro-animations et du contraste des badges de score.

3. **`TASK-CLEAN-01` — Hygiène Zéro-Warning ESLint & Nettoyage des Résidus de Code**
   * **Priorité :** 🟢 MOYENNE (Qualité de Code)
   * **Fichiers :** `src/app/actions/db/analytics.ts`, `src/app/actions/db/api-keys.ts`, `src/app/actions/db/security-alerts.ts`, `src/components/ErrorBoundary.tsx`
   * **Critères d'acceptation :**
     * [ ] Suppression des paramètres `_providedUserId` non utilisés.
     * [ ] Remplacement de `window.location.href` par Next.js Link / Router.
     * [ ] Suppression de `src/components/layout/ModernSidebar.tsx.backup`.
     * [ ] `npm run lint` validé à 0 erreur et 0 warning.
