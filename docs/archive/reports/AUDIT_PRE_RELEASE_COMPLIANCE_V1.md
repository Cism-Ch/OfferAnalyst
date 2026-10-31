# 🔍 Audit de Vérification & Conformité Pré-Release (V1.x) — 31 Octobre 2026

> **Périmètre :** dépôt complet à `HEAD` (`9f096ba`), sprints 1 à 22.  
> **Méthode :** relecture statique ciblée (règles `AGENTS.md` + règles globales utilisateur), `pnpm run build`, `pnpm audit --prod`, scan de secrets sur les fichiers suivis par Git, historique Git, matrice auth/validation des routes API et Server Actions, suites Playwright.  
> **Nature :** audit en lecture seule. **Aucun correctif de code appliqué** (certains correctifs exigent une décision : rotation de clé, réécriture d'historique local, choix de version).

## 1. Verdict

🔴 **NE PAS pousser ni publier en l'état.** Un secret réel est commité dans un fichier de test (localement, non encore poussé), et le tag `v1.0.0` existant ne correspond pas au code actuel.

| Contrôle | Résultat |
|---|---|
| `pnpm run eval:quick` (tsc strict + ESLint + Prisma) | ✅ 100/100 (exécuté en fin de sprint 22, aucun changement depuis) |
| `pnpm run build` (Next.js 16.4.3) | ✅ 0 erreur — **41 routes** au tableau, **35 pages** générées |
| `pnpm audit --prod` | ✅ aucune vulnérabilité connue |
| Secrets dans fichiers suivis | 🔴 1 clé OpenRouter réelle (C1) |
| Playwright (responsive + workflow) | voir §5 |

## 2. Constats par sévérité

### 🔴 Critique

**C1 — Clé API OpenRouter réelle commitée dans un test.**  
`tests/adversarial_m3_stress.mjs` (lignes 87 et 250) contient une chaîne de 73 caractères au format `sk-or-v1-…` **identique à la valeur de `OPENROUTER_API_KEY` dans `.env`** (vérifié par comparaison booléenne, valeur non reproduite ici). Introduite au commit `ca3d46b` (2026-10-28). Les 17 commits locaux ne sont **pas encore poussés** (aucune branche distante ne contient `ca3d46b`) : la fuite est encore confinable.  
De plus, ~50 caractères de cette clé ont été affichés dans la sortie d'outil de cette session d'audit → **considérer la clé comme compromise.**  
*Action :* révoquer/rotater la clé, la remplacer par une valeur synthétique dans les tests, purger l'historique local avant le premier `git push`.

### 🟠 Élevé

**H1 — Tag `v1.0.0` périmé.** Il pointe sur `5d33afc` (Sprint 5, 2026-10-26), soit **32 commits** en arrière. `CHANGELOG.md` : `[Unreleased]` vide, `[1.0.0]` s'arrête au Sprint 6 ; les sprints 7 à 22 n'y figurent pas. `TASK-REL-01.03` (« préparer le tag v1.0.0 ») entre en conflit : ne jamais forcer le déplacement d'un tag publié. Décision de version requise.

**H2 — 17 commits non poussés, jamais validés par la CI.** `.github/workflows/ci-cd.yml` : lint, tsc, build uniquement ; pas de Playwright, pas de `pnpm audit`.

**H3 — `.env.example` incomplet.** Variables lues par le code mais absentes : `CRON_SECRET`, `WEBHOOK_SECRET` (échec fermé en production), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `MISTRAL_API_KEY`, `AWS_REGION`, `NEXT_PUBLIC_ENABLE_ANALYTICS`, `PLAYWRIGHT_TEST_BASE_URL`. Risque de déploiement mal configuré (cron de rétention et webhooks rejetés).

**H4 — `POST /api/analytics/event` ouvert en écriture.** Aucune authentification, aucun rate limiting, `metadata` et `path` non validés (le middleware laisse passer tout `/api/*`). Permet gonflement de la base et pollution de logs.

**H5 — Pile « V2 » morte mais dangereuse + doublons.**
- `src/app/actions/workflow/orchestrator.ts` n'est importé nulle part ; `analyzeV2.ts`, `fetchV2.ts`, `organizeV2.ts` ne sont consommés que par lui et par des tests.
- `analyzeV2.ts › storeAnalysisResults(…, explicitUserId?)` : fonction exportée d'un fichier `'use server'` qui accepte un `userId` fourni par l'appelant → viole `R-API-07` (anti-IDOR).
- `src/lib/export/csv.ts` (utilisé par `exportOrganizedOffersAction`) **n'applique pas** la neutralisation d'injection de formules CWE-1236 corrigée seulement dans `src/lib/export.ts`.
- `src/lib/export.ts` **et** `src/lib/export/` coexistent : `@/lib/export` résout vers le fichier, le dossier est ambigu.
- Les tests de quota `adversarial_m3_*` valident les fichiers V2 (code mort) ; le chemin réel (V1) n'est pas couvert par les mêmes assertions.

### 🟡 Moyen

| ID | Constat | Règle |
|---|---|---|
| M1 | Aucune validation des variables d'environnement au démarrage (pas de t3-env) ; `process.env` lu directement dans 25 fichiers. | Règle 9 |
| M2 | Rate limiting **en mémoire** (`lib/rate-limiter.ts`, `setInterval` au niveau module) et cache en mémoire (`lib/cache.ts`) : inefficaces en serverless multi-instances. `@upstash/redis` n'est pas une dépendance. Aucune limitation sur les Server Actions sensibles. | Règle 6 |
| M3 | React Email absent (aucun template typé) ; l'envoi passe bien par QStash (`/api/jobs`). | Règle 7 |
| M4 | Server Actions vivantes `analyze.ts`, `fetch.ts`, `organize.ts` sans validation Zod (aucune borne de taille sur critères/contexte/offres → abus de coût IA). | Règle 2 |
| M5 | Route modèle `/api/example` livrée dans le build de production. | Hygiène |
| M6 | `any` en code de production masqué par `eslint-disable` : `lib/export/csv.ts` ×4, `lib/export/pdf.ts`, `hooks/use-search-history.ts`, `types/index.ts` (signature d'index), `organize.ts`, `organizeV2.ts`, `AnalyticsDashboard.tsx` ; `react-hooks/set-state-in-effect` désactivé dans 4 fichiers contre `R-UI-10`. Le « 0 warning » est vrai, mais en partie par suppression. | R-INT-01 |
| M7 | Les tests (Playwright workflow, suites adversariales) écrivent dans le cluster Atlas pointé par `.env` (`cluster0.mab3g.mongodb.net`) : pas de base de test dédiée. Nettoyage présent mais risque réel. | — |

### 🟢 Faible

| ID | Constat |
|---|---|
| L1 | `<html lang="fr">` n'est jamais synchronisé avec la langue choisie (seule `/share/[id]` le fait) : WCAG 3.1.1, lecteurs d'écran, SEO. Lacune du livrable i18n du Sprint 13. |
| L2 | `min-h-screen` résiduel : `error/page.tsx`, `share/[id]/page.tsx` (×2), `ErrorBoundary.tsx`. `transition-all`/`duration-300` encore présents dans 18 fichiers : le Sprint 22 ne les a pas « éradiqués » globalement. |
| L3 | Tolérance de test `>= 43.9` px sur les cibles tactiles ; routes non couvertes par le test d'overflow : `/share/[id]`, `/compare`, `/analysis` (hors scénario hydraté), `/changelog`, `/cookies`, `/dashboard/support`, `/dashboard/workspace`, `/error`. Un seul projet de navigateur (Chrome). |
| L4 | **« CLS < 0.05 » non mesuré** : la seule occurrence de CLS dans les tests est un faux payload de beacon, pas une mesure Lighthouse/PerformanceObserver. |
| L5 | Chiffres erronés dans les rapports : « 45 routes / 25 pages statiques » (réel : 41 routes, 35 pages). **Le walkthrough rédigé en session reprend « 45 routes » : corrigé.** |
| L6 | `README.md` mentionne `npm install` / `npm run dev` alors que le projet est standardisé `pnpm` ; `packageManager: pnpm@12.15.0` vs pnpm 12.16.1 installé. |
| L7 | ~30 `console.log` en Server Actions (`api-key-provider` journalise le *nom* des clés, pas leur valeur : acceptable) — préférer `lib/logger.ts`. |
| L8 | Avertissement Next.js à l'exécution : `scroll-behavior: smooth` détecté sur `<html>` ; ajouter `data-scroll-behavior="smooth"` (introduit par le Sprint 22). |

## 3. Points vérifiés conformes

- Aucun `.env*` suivi hors `.env.example` ; `.gitignore` correct.
- Routes API sensibles : `jobs` (signature QStash en amont, 401 sinon), `cron/cleanup-history` (`CRON_SECRET`), `export` (session + Zod + rate limit), `admin/*` (session + rôle).
- Server Actions `db/*` : session serveur, Zod sur `admin/history/profile/security-alerts`, `revalidatePath` après mutations.
- Quota quotidien invité actif sur les actions vivantes `analyze.ts` / `fetch.ts`.
- Aucun `TODO/FIXME` dans `src/`. Aucune dépendance vulnérable connue.
- `AGENTS.md` : seul ajout = bloc `nextjs-agent-rules` généré par `next dev` (attendu).

## 4. Limites de cet audit (non vérifié)

Appareils physiques iOS/Android, WebKit/Firefox, lecteur d'écran / axe-core, Lighthouse réel, déploiement de staging, comportement des webhooks QStash réels, contenu de l'historique Git distant (aucun push effectué).

## 5. Résultats des suites Playwright (exécution d'audit)

Exécution lancée pendant l'audit : `responsive.spec.ts` + `workflow.spec.ts`, **121 tests** (112 responsive + 9 workflow), Chrome uniquement. Résultat final consigné ci-dessous dès la fin de l'exécution (≈ 20 min sous Windows).

**Résultat : ✅ 121/121 PASS (11,9 min).** Aucune régression fonctionnelle ni de débordement sur les routes couvertes.

⚠️ Un avertissement Next.js est apparu pendant l'exécution (voir L8).

## 6. Plan de remédiation

Ventilé dans `docs/TASKS.md`, Sprint 23 (`TASK-SEC-23.*`, `TASK-REL-02.*`, `TASK-CFG-23.*`, `TASK-QUA-23.*`). `TASK-REL-01` est **bloquée** tant que `TASK-SEC-23.01` n'est pas clos.
