# 🤖 AGENTS.md — Référence Agents IA

> Ce fichier est synchronisé avec [Agent.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/Agent.md), le document officiel régissant les directives d'ingénierie, la stack Next.js 16 / React 19 et l'architecture multi-agents pour le projet **OfferAnalyst**.

Veuillez consulter l'intégralité du manuel et des règles d'ingénierie dans le fichier principal :
👉 **[Consulter Agent.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/Agent.md)**

---

### Résumé Rapide des Règles Inviolables

1. **RSC par défaut** et colocalisation des composants.
2. **Prisma Singleton** (`@/lib/prisma`) + validation Zod systématique.
3. **Better-Auth côté serveur** (`src/lib/auth.ts`) avec zéro fuite de secret.
4. **Tigris S3** avec URLs signées temporaires.
5. **Upstash QStash & Redis** pour jobs asynchrones et rate-limiting.
6. **Resend** asynchrone (pas d'envoi bloquant dans la requête).
7. **Server Actions** avec retour `{ success: true, data } | { success: false, error }` et `revalidatePath`.
8. **Sécurité `.env`** : Ne jamais supprimer les variables d'environnement existantes.
9. **Vérification systématique** : `pnpm exec tsc --noEmit` & `pnpm run lint` (0 erreur tolérée).
10. **Suivi des tâches (SSOT Inviolable — [`docs/TASKS.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TASKS.md)) :**
    - **Interdiction de coder sans tâche :** Tout travail DOIT être rattaché à une tâche formalisée dans `docs/TASKS.md` avec ID unique (`TASK-DOMAINE-XX`), priorité, fichiers cibles, description et critères d'acceptation cochables.
    - **Mise à jour en temps réel :** Dès le début des travaux, marquer la tâche `[-]` (En cours) ; à l'achèvement, cocher les critères `[x]`.
    - **Validation avant clôture :** Ne jamais marquer une tâche terminée sans avoir exécuté et validé `pnpm run lint` et `pnpm exec tsc --noEmit`.
    - **Archivage systématique :** Transférer immédiatement la tâche dans le tableau d'historique et mettre à jour le Kanban.
    - **Zéro dispersion :** Interdiction absolue de créer des fichiers TODO, tickets ou résumés isolés hors de `docs/TASKS.md`.
11. **Protocole RSI (Auto-Amélioration Récursive) :**
    - **Mémoire procédurale :** Consulter obligatoirement `.agents/rules/system_core.md` et `.agents/rules/fullstack_playbook.md` avant toute intervention.
    - **Juge Déterministe :** Valider les développements avec `python evals/run_fullstack_eval.py` (`pnpm run eval:fullstack` ou `pnpm run eval:quick`).
    - **Boucle Méta-Cognitive Proactive :** Adopter le rôle `.agents/prompts/meta_optimizer.md` pour extraire systématiquement les apprentissages et enrichir `fullstack_playbook.md` (Plafond strict : 150 lignes anti-bloat) en cas d'échec réparé, après tout audit de sécurité, ou dès qu'un anti-pattern critique est neutralisé.
    - **Workflow Dédié :** Utiliser la commande de workflow `/rsi-feature`.
12. **Hygiène & Archivage Dynamique des Documents Markdown (Markdown Rollover) :**
    - **Plafond strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes**. Dès dépassement, transférer les sprints archivés vers `docs/archive/tasks/` et maintenir des liens markdown relatifs directs.
    - **Ventilation des Audits & Diagnostics :** Tout audit ou traque de failles découvrant plusieurs vulnérabilités doit impérativement ventiler des sous-identifiants unitaires (`TASK-DOM-XX.01` à `.NN`) et produire un rapport exhaustif dédié dans `docs/archive/reports/`.
    - **Équivalence d'Autonomie `/goal` & `/rsi-feature` :** Toute commande d'autonomie lancée via `/goal` ou `/rsi-feature` doit exécuter sans exception la boucle en 4 phases (Cadrage -> Évaluation Déterministe -> Méta-Optimisation Proactive -> Archivage SSOT).
13. **Directives Fondamentales Responsive & Mobile-First Design :**
    - **Mobile-First Strict (Min-Width) :** Écrire systématiquement les classes Tailwind de base pour le mobile sans préfixe (ex. `flex-col w-full p-3.5 text-sm`), puis élargir avec `sm:`, `md:`, `lg:`.
    - **Zéro Largeur Fixe Débordante :** Proscription stricte des largeurs en pixels fixes (`w-[450px]`). Préférer `w-full max-w-xl` et poser obligatoirement `min-w-0` sur les enfants de conteneurs flex/grid pour éviter les cassures de texte tronqué et les barres de défilement horizontal parasites.
    - **Cibles Tactiles Minimales (Touch Targets) :** Tout élément interactif (boutons, icônes déclencheuses, inputs) doit mesurer au minimum `44x44px` (`min-h-[44px] min-w-[44px]` ou padding adéquat).
    - **Zones Sécurisées (Safe Areas) :** Tout composant fixé en bas d'écran (`fixed bottom-0`) ou barre de navigation mobile doit impérativement intégrer `pb-[env(safe-area-inset-bottom)]`.
    - **Hiérarchie Z-Index & Isolation Tactile (Sheet vs Dialog) :** Ne jamais ouvrir un `Dialog` par-dessus un `Sheet` ouvert (fermer le tiroir avec un micro-délai de 100-150ms). Tout `SelectContent` ou `DropdownMenu` apparaissant dans un `Dialog` doit porter `z-[70]`.
    - **Échelle Canonique Spacing / Typo :** Paddings de cartes : `p-3.5 sm:p-5 lg:p-6` ; Gaps : `gap-2.5 sm:gap-4 lg:gap-6` ; Conteneurs : `px-3 sm:px-6 lg:px-8`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- .env .env.local .env.example -->

Les Clé doivent être stockées de manière sécurisée et ne doivent jamais être partagées.
Elles doivent être stockées dans un fichier `.env` et ne doivent jamais être partagées.

<!-- Emoji -->

Ne pas utiliser d'emoji dans le code.

<!-- Shadcn -->

Utiliser les skills Shadcn UI pour construire les composant et coder l'UI/UX.
Ne pas inventer des d'implémentation de shadcn ui, utiliser les skills et régles Shadcn.
