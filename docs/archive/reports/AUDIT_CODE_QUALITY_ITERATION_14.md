# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 14

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Server Actions & Journalisation : `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`, `src/app/actions/organize.ts`
- Fournisseur de Clés & Sécurité : `src/app/actions/shared/api-key-provider.ts`
- Feature Flags & Persistance Serverless : `src/lib/feature-flags.ts`, `src/app/api/admin/feature-flags/route.ts`
- Télémétrie & Cycle de Vie Composants : `src/app/admin/page.tsx`

---

## 🎯 Objectif de la Revue
Détecter les disparités de journalisation serveur, les mentions en dur anachroniques, la volatilité des configurations en environnement serverless et les appels réseau dupliqués au montage des interfaces.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 📝 Logs Serveur Dispersés & Mention de Modèle en Dur dans les Server Actions
- **Fichiers :**
  - [`src/app/actions/fetch.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/fetch.ts#L126) (L126)
  - [`src/app/actions/analyze.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/analyze.ts#L57) (L57)
  - [`src/app/actions/organize.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/organize.ts#L131) (L131)
  - [`src/app/actions/shared/api-key-provider.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/shared/api-key-provider.ts)
- **Constat :**
  Dans `fetch.ts` :
  ```tsx
  console.log(`Fetch (DeepSeek): AI response received (${text.length} chars)`);
  ```
  Le message fait référence en dur à `DeepSeek`, même lorsque l'utilisateur a choisi Gemini 3.5, Nemotron ou GPT-4o !
  De même, dans `organize.ts`, le log indique en dur `Organize (Gemini): ...`.
  De nombreux `console.log` résiduels sont utilisés à la place de l'instance centralisée de Pino Logger [`src/lib/logger.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/logger.ts).
- **Impact :**
  Non-respect de la règle d'hygiène 13 d'`Agent.md`. En production, ces logs bruts non structurés polluent la sortie standard sans horodatage ISO ni métadonnées JSON exploitables par un outil de monitoring (Datadog, BetterStack).
- **Remède recommandé (`TASK-LOG-01`) :**
  Remplacer les `console.log` dispersés par `log.info` / `log.debug` de `@/lib/logger` avec le nom dynamique du modèle utilisé (`modelName`).

---

### 2. ⚡ Volatilité des Feature Flags en Mémoire Locale Serverless
- **Fichiers :**
  - [`src/lib/feature-flags.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/feature-flags.ts#L25-L48)
  - [`src/app/api/admin/feature-flags/route.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/api/admin/feature-flags/route.ts)
- **Constat :**
  Dans `src/lib/feature-flags.ts` :
  ```ts
  const flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
  export function updateFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): FeatureFlags {
    flags[flag] = enabled;
    return { ...flags };
  }
  ```
  Les feature flags activés/désactivés depuis la console `/admin` ne sont modifiés que dans la mémoire vive de l'instance Node.js en cours.
  Sur Vercel Serverless, chaque requête HTTP est susceptible d'être exécutée sur un conteneur lambda distinct, rendant les changements de flags invisibles pour les autres requêtes ou effacés dès le redémarrage d'un conteneur.
- **Impact :**
  L'administrateur active un flag (ex: `enableCache` ou `fetchV2`), mais le comportement de la plateforme reste aléatoire selon la lambda qui répond.
- **Remède recommandé (`TASK-FIX-09`) :**
  Persister les feature flags dans la base de données MongoDB (collection `Setting` ou `SystemConfig`) ou dans le cache avec TTL long.

---

### 3. 🔁 Double Appel API de Télémétrie au Montage dans `AdminPage`
- **Fichier :** [`src/app/admin/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/admin/page.tsx#L61-L87)
- **Constat :**
  Le composant définit une fonction `loadTelemetry` via `useCallback` (L61-L71), mais dans le `useEffect` (L73-L86), `getAdminTelemetryStats()` est ré-appelé directement sous forme de promesse sans réutiliser `loadTelemetry()`.
- **Impact :**
  Duplication de code, double exécution potentielle des calculs d'agrégation Prisma lors du premier rendu, et surcharge inutile des requêtes vers MongoDB.
- **Remède recommandé (`TASK-PERF-03`) :**
  Nettoyer le `useEffect` pour appeler directement `loadTelemetry()` de manière unifiée avec un signal d'annulation (cleanup).

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-LOG-01`** | Logging / Hygiène | 🟢 MOYENNE | Harmonisation de la journalisation sur `@/lib/logger` et suppression des mentions en dur | `src/app/actions/fetch.ts`, `src/app/actions/analyze.ts`, `src/app/actions/organize.ts`, `src/app/actions/shared/api-key-provider.ts` |
| **`TASK-FIX-09`** | Architecture / Flags | 🟡 MOYENNE | Persistance persistante des Feature Flags administratifs (MongoDB / Cache) | `src/lib/feature-flags.ts`, `src/app/api/admin/feature-flags/route.ts` |
| **`TASK-PERF-03`** | Performance / Admin | 🟢 MOYENNE | Unification du chargement de la télémétrie admin sans double appel | `src/app/admin/page.tsx` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Philosophie :** Priorité absolue à la fiabilisation, à l'élégance du code et à l'expérience utilisateur.
