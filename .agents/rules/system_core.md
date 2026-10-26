# 🛡️ System Core Rules — Règles Immuables d'Ingénierie OfferAnalyst

> **STATUT : IMMUABLE.** Ces règles sont le socle non négociable de la codebase.  
> Tout agent IA (Worker, Subagent, Architecte) DOIT s'y conformer strictement avant et pendant chaque tâche.

---

## 1. 🎯 Identité du Projet & Stack Technique

**OfferAnalyst** est une plateforme SaaS Next.js 16 / React 19 d'analyse, scoring et agrégation intelligente d'offres de marché (Immobilier, Emplois/Freelance, SaaS, Hardware).

| Composant | Technologie Spécifique | Règle d'usage |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components (RSC) par défaut. 'use client' restreint aux feuilles d'interaction. |
| **Langage & Types** | TypeScript 5.9 (Strict) | Zéro `any`. Inférence forte. Validation Zod runtime systématique. |
| **Base de Données** | Prisma 6.2 + MongoDB Atlas | Client singleton via `@/lib/prisma`. ObjectIds natifs (`@id @default(auto()) @map("_id") @db.ObjectId`). |
| **Authentification** | Better-Auth 1.4 | Sessions validées côté serveur (`await auth.api.getSession`). Zéro fuite de hash ou secret. |
| **Stockage Fichiers** | Tigris Cloud Storage (S3 API) | URLs pré-signées temporaires. Pas de blobs volumineux dans MongoDB. |
| **Background Jobs** | Upstash QStash | Traitements lourds déchargés (emails, PDF). Signature HMAC validée (`receiver.verify`). Idempotence. |
| **Cache & Rate-Limit**| Upstash Redis & In-Memory | Protection des routes sensibles et Server Actions. Mise en cache des requêtes coûteuses. |
| **Emails** | Resend + React Email | Envois transactionnels strictly asynchrones via jobs de fond. |
| **Design System** | Tailwind CSS v4 + Radix UI | Ordre canonique des classes Tailwind. Thème "Neon / Deep Slate" dark mode first. |

---

## 2. ⚡ Les 17 Règles Fondamentales Inviolables

1. **RSC par défaut :** Tout composant est serveur sauf s'il requiert état local (`useState`), effets (`useEffect`) ou écouteurs d'événements. Colocaliser les composants spécifiques dans le répertoire de leur route.
2. **Prisma Singleton :** Toujours importer `prisma` depuis `@/lib/prisma`. Valider toute entrée par un schéma Zod avant d'interroger ou modifier la base.
3. **Better-Auth côté serveur :** Utiliser `await auth.api.getSession({ headers: await headers() })` en tête de Server Action. Ne jamais exposer de tokens ou mots de passe au client.
4. **Tigris S3 & URLs Signées :** Générer des presigned URLs à courte durée de vie (max 15 min pour download, 5 min pour upload).
5. **Upstash QStash & Idempotence :** Valider `receiver.verify` sur tout webhook entrant `/api/jobs`. Gérer des identifiants d'idempotence (`messageId`) pour parer aux retries.
6. **Performance & Rate Limiting :** Protéger les Server Actions et API publiques avec le rate limiter (`@/lib/rate-limiter`).
7. **Resend Asynchrone :** Ne jamais bloquer une requête HTTP sur l'envoi d'un email. Déléguer systématiquement via QStash.
8. **Realtime & Optimistic UI :** Souscriptions précises. Mises à jour optimistes avec TanStack Query ou `useOptimistic` pour zéro sensation de latence.
9. **Typage Strict :** `noEmit` sans aucune erreur TypeScript. Aucun `any` non documenté et justifié.
10. **Pattern Unifié des Server Actions :** Retourner systématiquement :
    ```typescript
    type ActionResponse<T> = 
      | { success: true; data: T } 
      | { success: false; error: { message: string; code?: string } };
    ```
    et déclencher `revalidatePath()` ou `revalidateTag()` immédiatement après toute mutation.
11. **Proactivité UI :** Ne jamais créer une API ou Server Action sans son composant d'interface utilisateur associé (Card, Dialog, Feedback, Skeleton).
12. **Documentation & Commentaires :** Tout code doit être commenté avec pertinence (JSDoc, cas limites). Mettre à jour `docs/` et `docs/TASKS.md`.
13. **Hygiène des Imports :** Alias `@/*` obligatoire. Bannir les chemins relatifs profonds (`../../`). Zéro variable ou import inutilisé.
14. **Tailwind CSS Canonique :** Ordre strict : Positionnement/Layout → Tailles/Espacements → Typographie → Arrière-plans/Bordures → Ombres/Effets → Transitions/États.
15. **Audit des `.env` :** Vérifier l'existence et la conformité des variables d'environnement avant de concevoir des modules d'infrastructure.
16. **Intégrité Absolue des `.env.*` :** Ne JAMAIS effacer de variables existantes. Les commenter avec `# Deprecated: ...` si obsolètes.
17. **Validation Avant Clôture :** Exécuter impérativement `npx tsc --noEmit` et `npm run lint` avec 0 erreur tolérée.

---

## 3. 📋 SSOT Inviolable — Gestion des Tâches (`docs/TASKS.md`)

- **Interdiction de coder sans tâche :** Tout travail doit correspondre à une entrée formalisée (`TASK-DOMAINE-XX`) dans `docs/TASKS.md`.
- **Mise à jour en temps réel :** Marquer `[-]` (En cours) dès le démarrage ; cocher `[x]` à l'achèvement.
- **Zéro dispersion :** Aucun fichier `TODO.md` ou note ponctuelle hors de `docs/TASKS.md`.
