# 📜 Historique d'Exécution — Sprint 23 : Remédiation Pré-Release & Durcissement Sécurité

> **Date d'achèvement :** 31 Octobre 2026  
> **Statut :** ✅ Validé (100/100 eval:quick, next build 0 erreur / 40 routes générées, 20/20 & 19/19 suites adversariales)  
> **Conformité :** Respect strict des directives d'ingénierie (`AGENTS.md`) et de la politique de sécurité des clés API (exclusivement en `.env`).

---

### Lot 1 : `TASK-SEC-23` — Sécurité & Clés API en `.env` Uniquement
- [x] **`TASK-SEC-23.01`** : Éradication de la clé d'inférence en clair dans `tests/adversarial_m3_stress.mjs` (lignes 87 et 250), remplacée par des fixtures synthétiques d'entropie déterministes. Règle absolue réaffirmée : toutes les clés doivent résider exclusivement dans `.env`.
- [x] **`TASK-SEC-23.02`** : Sécurisation de l'endpoint `POST /api/analytics/event` avec Rate Limiter (60 req/min/IP), rejet des payloads volumineux (> 16KB) et validation stricte Zod des types d'événements, métadonnées et chemins.
- [x] **`TASK-SEC-23.03`** : Purge complète de la pile V2 orpheline (`analyzeV2.ts`, `fetchV2.ts`, `organizeV2.ts`, `workflow/orchestrator.ts`) et suppression du dossier obsolète doublon `src/lib/export/`. Standardisation sur le moteur unifié `src/lib/export.ts` (anti-CWE-1236 et PDF 1.4 binaire). Repointage des tests de quotas sur les Server Actions vivantes (`fetch.ts`, `analyze.ts`).
- [x] **`TASK-SEC-23.04`** : Bornage d'entrée Zod sur les Server Actions vivantes `fetchOffersAction`, `analyzeOffersAction` et `organizeOffersAction` (limite à 100 offres, longueur max contexte 10000 caractères, code standard `VALIDATION_FAILED`).
- [x] **`TASK-SEC-23.05`** : Suppression de la route modèle de test `/api/example`.

---

### Lot 2 : `TASK-CFG-23` — Configuration, Versioning & Release
- [x] **`TASK-CFG-23.01`** : Mise à niveau exhaustive de `.env.example` avec les 9 variables de configuration nécessaires (`CRON_SECRET`, `WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `MISTRAL_API_KEY`, `AWS_REGION`, `NEXT_PUBLIC_ENABLE_ANALYTICS`, `PLAYWRIGHT_TEST_BASE_URL`).
- [x] **`TASK-CFG-23.04`** : Résolution du conflit de versioning : incrément à `v1.1.0` dans `package.json`, rédaction des notes de version complètes dans `CHANGELOG.md` couvrant les sprints 7 à 23 (Responsive Design, Z-index, Motion, Export PDF/CSV, Remédiation).

---

### Lot 3 : `TASK-QUA-23` — Hygiène HTML, CSS & Standards
- [x] **`TASK-QUA-23.01`** : Synchronisation dynamique de `<html lang>` avec la langue sélectionnée (`document.documentElement.lang = language`) dans `LanguageContext.tsx`.
- [x] **`TASK-QUA-23.02`** : Substitution des `min-h-screen` résiduels par `min-h-app` dans `error/page.tsx`, `share/[id]/page.tsx` et `ErrorBoundary.tsx`. Ajout de l'attribut `data-scroll-behavior="smooth"` sur `<html>` dans `src/app/layout.tsx`.
- [x] **`TASK-QUA-23.06`** : Mise à jour de `README.md` standardisé sur `pnpm` (install & dev).

