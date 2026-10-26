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


