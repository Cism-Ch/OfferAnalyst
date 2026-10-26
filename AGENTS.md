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
9. **Vérification systématique** : `npx tsc --noEmit` & `npm run lint` (0 erreur tolérée).
10. **Suivi des tâches (SSOT Inviolable — [`docs/TASKS.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TASKS.md)) :**
    - **Interdiction de coder sans tâche :** Tout travail DOIT être rattaché à une tâche formalisée dans `docs/TASKS.md` avec ID unique (`TASK-DOMAINE-XX`), priorité, fichiers cibles, description et critères d'acceptation cochables.
    - **Mise à jour en temps réel :** Dès le début des travaux, marquer la tâche `[-]` (En cours) ; à l'achèvement, cocher les critères `[x]`.
    - **Validation avant clôture :** Ne jamais marquer une tâche terminée sans avoir exécuté et validé `npm run lint` et `npx tsc --noEmit`.
    - **Archivage systématique :** Transférer immédiatement la tâche dans le tableau d'historique et mettre à jour le Kanban.
    - **Zéro dispersion :** Interdiction absolue de créer des fichiers TODO, tickets ou résumés isolés hors de `docs/TASKS.md`.
11. **Protocole RSI (Auto-Amélioration Récursive) :**
    - **Mémoire procédurale :** Consulter obligatoirement `.agents/rules/system_core.md` et `.agents/rules/fullstack_playbook.md` avant toute intervention.
    - **Juge Déterministe :** Valider les développements avec `python evals/run_fullstack_eval.py` (`npm run eval:fullstack` ou `npm run eval:quick`).
    - **Boucle Méta-Cognitive Proactive :** Adopter le rôle `.agents/prompts/meta_optimizer.md` pour extraire systématiquement les apprentissages et enrichir `fullstack_playbook.md` (Plafond strict : 150 lignes anti-bloat) en cas d'échec réparé, après tout audit de sécurité, ou dès qu'un anti-pattern critique est neutralisé.
    - **Workflow Dédié :** Utiliser la commande de workflow `/rsi-feature`.
12. **Hygiène & Archivage Dynamique des Documents Markdown (Markdown Rollover) :**
    - **Plafond strict :** `docs/TASKS.md` ne doit JAMAIS dépasser **250 lignes**. Dès dépassement, transférer les sprints archivés vers `docs/archive/tasks/` et maintenir des liens markdown relatifs directs.
    - **Ventilation des Audits & Diagnostics :** Tout audit ou traque de failles découvrant plusieurs vulnérabilités doit impérativement ventiler des sous-identifiants unitaires (`TASK-DOM-XX.01` à `.NN`) et produire un rapport exhaustif dédié dans `docs/archive/reports/`.
    - **Équivalence d'Autonomie `/goal` & `/rsi-feature` :** Toute commande d'autonomie lancée via `/goal` ou `/rsi-feature` doit exécuter sans exception la boucle en 4 phases (Cadrage -> Évaluation Déterministe -> Méta-Optimisation Proactive -> Archivage SSOT).


