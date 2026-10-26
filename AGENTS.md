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
9. **Vérification systématique** : `npx tsc --noEmit` & `npm run lint`.
10. **Suivi des tâches (SSOT)** : Consulter et mettre à jour exclusivement [`docs/TASKS.md`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/docs/TASKS.md).

