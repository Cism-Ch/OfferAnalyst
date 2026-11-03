# ⚙️ Module : Backend, Server Actions & Tâches Asynchrones
> Règles procédurales relatives aux Server Actions, Zod, QStash, Redis et gestion des requêtes.

- [R-API-01] Dans Next.js 16, `headers()` et `cookies()` sont des Promises asynchrones : toujours utiliser `await headers()` et `await cookies()`.
- [R-API-02] Valider systématiquement l'entrée brute (`rawInput: unknown`) d'une Server Action avec `Schema.safeParse()` avant toute opération DB.
- [R-API-03] Chaque Server Action doit retourner le standard unifié `{ success: true, data } | { success: false, error: { message, code } }`.
- [R-API-04] Sur tout webhook entrant QStash (`/api/jobs`), vérifier la signature avec `receiver.verify` et implémenter une clé d'idempotence (`messageId`).
- [R-API-05] Appeler `revalidatePath(path)` ou `revalidateTag(tag)` immédiatement après une mutation réussie en Server Action pour purger le cache de route.
- [R-API-06] Ne jamais placer `'use server'` sur un fichier utilitaire interne : cela expose toutes ses fonctions exportées comme endpoints HTTP RPC publics non authentifiés. Réserver `'use server'` aux Server Actions UI.
- [R-API-07] Anti-IDOR absolu : toute Server Action manipulant des données utilisateur doit ignorer le `userId` passé en argument client et extraire l'ID vérifié depuis la session serveur Better-Auth (`session.user.id`).

