# 📚 Archive des Tâches Achevées — Sprints 34 à 36

> Fichier d'archive dynamique généré conformément au protocole de Markdown Rollover pour maintenir `docs/TASKS.md` sous le plafond strict de 250 lignes.

---

## 🔐 Sprint 36 Achevée : Diagnostic Inscription / Connexion & Initialisation Identifiants Admin DB

- [x] **`TASK-AUTH-02` — Résolution des Échecs d'Inscription/Connexion & Provisioning Admin Sécurisé**
  - **Priorité :** 🔴 CRITIQUE
  - **Fichiers cibles :** `src/lib/auth.ts`, `prisma/schema.prisma`, `.env.example`, `scripts/seed-admin.mjs`, `package.json`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-AUTH-02.01` : Audit et identification de la cause racine de l'échec d'inscription / connexion via Better-Auth (fix `advanced.database.generateId: false` et retrait de l'index unique duplicate `sessions_sessionToken_key`).
    - [x] `TASK-AUTH-02.02` : Configuration et documentation des variables d'environnement admin dans `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.) sans jamais écraser ni faire fuiter de secrets.
    - [x] `TASK-AUTH-02.03` : Script idempotent de seed / provisioning administrateur (`pnpm run db:seed-admin`) pour garantir l'existence du compte admin avec rôle `ADMIN` dans MongoDB.
    - [x] `TASK-AUTH-02.04` : Test et validation fonctionnelle du flux complet d'inscription (`signUp.email`, status 200) et connexion (`signIn.email`, session active avec rôle ADMIN).
    - [x] `TASK-AUTH-02.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## 🎨 Sprint 35 Achevée : Remédiation UI/UX — Page Vitrine (Boutons Flottants, Navbar 2L) & Spacing Dashboard Header

- [x] **`TASK-UI-05` — Page Vitrine (Dock Flottant, Navbar 2 Lignes) & Dashboard Navbar (Espacements & Alignements)**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `src/components/landing/SaaSPresentationView.tsx`, `src/components/layout/ModernHeader.tsx`, `src/components/layout/AIModelSelector.tsx`, `src/components/layout/LanguageToggle.tsx`, `src/components/theme-selector.tsx`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-UI-05.01` : Page Vitrine : Déportation des sélecteurs de langue et de thème en dock flottant ergonomique (`fixed bottom-5 right-5 z-50`).
    - [x] `TASK-UI-05.02` : Page Vitrine : Structuration de la navbar mobile en 2 lignes distinctes (`h-12` logo + `h-8` CTAs à 50% flex) sans débordement à 320px.
    - [x] `TASK-UI-05.03` : Dashboard Navbar : Rétablissement des règles d'espacement et paddings verticaux (`py-2` et `py-1.5`) pour que les composants ne touchent plus les bords supérieur et inférieur.
    - [x] `TASK-UI-05.04` : Dashboard Navbar : Calibration responsive et alignement aux normes de tous les contrôles (modèle IA, BYOK, quota, thème, langue) sur 320px -> 4K avec mode compact.
    - [x] `TASK-UI-05.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

---

## ⚡ Sprint 34 Achevée : Migration Complète vers `pnpm` Natif pour la Validation & les Tests

- [x] **`TASK-TOOL-01` — Migration Complète de la Suite de Validation et des Tests vers `pnpm` Natif**
  - **Priorité :** 🔴 HAUTE
  - **Fichiers cibles :** `evals/run_fullstack_eval.py`, `.agents/skills/db_schema_validator.py`, `playwright.config.ts`, `AGENTS.md`, `Agent.md`, `docs/TASKS.md`
  - **Critères d'acceptation :**
    - [x] `TASK-TOOL-01.01` : Mise à jour du juge déterministe `evals/run_fullstack_eval.py` pour exécuter `pnpm exec tsc --noEmit`, `pnpm run lint` et `pnpm run build`.
    - [x] `TASK-TOOL-01.02` : Mise à jour de `.agents/skills/db_schema_validator.py` pour utiliser `pnpm exec prisma validate`.
    - [x] `TASK-TOOL-01.03` : Mise à jour de `playwright.config.ts` (`webServer.command`) pour utiliser `pnpm run start` / `pnpm run dev`.
    - [x] `TASK-TOOL-01.04` : Harmonisation des règles inviolables dans `AGENTS.md` et `Agent.md` pour refléter la stack officielle `pnpm@12.15.0`.
    - [x] `TASK-TOOL-01.05` : Validation déterministe avec `pnpm run eval:quick` (100/100 PASS, 0 TS error, 0 ESLint warning).

