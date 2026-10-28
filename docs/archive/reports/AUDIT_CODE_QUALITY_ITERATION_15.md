# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 15

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Restitution & Export de Données : `src/lib/export/csv.ts`, `src/lib/export/pdf.ts`, `src/app/analysis/page.tsx`, `src/app/saved/page.tsx`
- Graphiques de Scoring & Télémétrie : `src/components/offers/ScoreChart.tsx`, `src/components/api-keys/AnalyticsDashboard.tsx`
- Typage Strict & Conformité Lint : Élimination des assertions `any` dans les utilitaires d'export

---

## 🎯 Objectif de la Revue
Détecter les capacités sous-exploitées (features existantes non reliées à l'UI), les défauts de rendu des graphiques sur palettes sombres/dorées et le typage lâche résiduel dans le code client.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 📥 Absence d'Action d'Export CSV dans les Vues d'Analyse et Favoris
- **Fichiers :** 
  - [`src/lib/export/csv.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/export/csv.ts)
  - [`src/app/analysis/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/analysis/page.tsx#L83-L100)
  - [`src/app/saved/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/saved/page.tsx#L79-L97)
- **Constat :**
  L'application dispose d'un module robuste de génération CSV conforme RFC 4180 (`convertToCSV`) avec extraction de métadonnées, scores et justifications.
  Toutefois, ce module n'est connecté à aucun déclencheur utilisateur dans l'interface :
  - Sur `/analysis`, seules les actions "New Analysis" et "Back to Home" sont présentes.
  - Sur `/saved`, seules les actions "Compare" et "Smart Organize" sont présentes.
- **Impact Utilisateur :**
  L'utilisateur qui a analysé ou sauvegardé des dizaines d'offres ne peut pas exporter sa sélection vers Excel, Google Sheets ou son tableur préféré, alors que le code de transformation existe déjà.
- **Remède recommandé (`TASK-UX-23`) :**
  Ajouter un bouton `"Export CSV"` discret avec icône `Download` dans la barre d'actions de `/analysis` et de `/saved`, déclenchant le téléchargement immédiat d'un fichier `offeranalyst-results.csv` via un Blob client.

---

### 2. 🎨 Recharts Tooltip CSS Invalide `hsl(var(--card))` cassant le Contraste Multi-Thèmes
- **Fichiers :**
  - [`src/components/offers/ScoreChart.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/offers/ScoreChart.tsx#L63-L78)
  - [`src/components/api-keys/AnalyticsDashboard.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/api-keys/AnalyticsDashboard.tsx#L188-L195)
- **Constat :**
  Dans les deux graphiques :
  ```tsx
  <Tooltip
      contentStyle={{ 
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))'
      }}
  />
  ```
  Sous Tailwind CSS v4, les variables CSS `--card`, `--card-foreground` et `--border` contiennent des codes couleur hexadécimaux directs (`#ffffff`, `#09090b`, `#e4e4e7`).
  L'instruction CSS `hsl(#ffffff)` est une erreur de syntaxe rejetée par les moteurs de rendu Chromium, WebKit et Gecko.
- **Impact Visuel :**
  Le fond de l'infobulle au survol des barres et courbes devient transparent ou adopte un style par défaut illisible sur les thèmes sombres (Dark, Neon, Gold, Ocean).
- **Remède recommandé (`TASK-UX-02`) :**
  Remplacer `hsl(var(--card))` par `var(--card)`, `hsl(var(--card-foreground))` par `var(--card-foreground)` et `hsl(var(--border))` par `var(--border)`.

---

### 3. 🔍 Typage `any` Résiduel dans les Utilitaires d'Export
- **Fichier :** [`src/lib/export/csv.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/export/csv.ts#L43-L106)
- **Constat :**
  Le fichier utilise 4 fois `// eslint-disable-next-line @typescript-eslint/no-explicit-any` avec `const scored = offer as any;` pour extraire `rank`, `finalScore`, `webInsights`.
- **Impact :**
  Non-respect de la règle de typage strict TypeScript (Règle 9 d'`Agent.md`).
- **Remède recommandé (`TASK-CLEAN-04`) :**
  Créer un type d'union discriminé `ScoredOffer | Offer` et typer explicitement la fonction d'extraction.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-UX-23`** | UX / Export | 🔴 HAUTE | Intégration du bouton d'export CSV 1-clic sur `/analysis` et `/saved` | `src/app/analysis/page.tsx`, `src/app/saved/page.tsx`, `src/lib/export/csv.ts` |
| **`TASK-UX-02`** | UI / Recharts | 🔴 HAUTE | Correction des tokens CSS `var(--card)` sur les tooltips Recharts | `src/components/offers/ScoreChart.tsx`, `src/components/api-keys/AnalyticsDashboard.tsx` |
| **`TASK-CLEAN-04`**| Typage Strict | 🟢 MOYENNE | Élimination des assertions `any` dans `src/lib/export/csv.ts` | `src/lib/export/csv.ts` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Rendre l'application immédiatement plus utile et plaisante en valorisant les briques techniques existantes.
