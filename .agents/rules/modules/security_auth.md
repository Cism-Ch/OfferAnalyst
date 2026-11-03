# 🔒 Module : Sécurité, Authentification & Intégrité des Données
> Règles procédurales relatives à Better-Auth, clés API chiffrées, cookies et accès.

- [R-SEC-01] Toute clé BYOK doit transiter par `encryptApiKey()` (AES-256-GCM) avant stockage et être auditée via `api_key_usage_logs`.
- [R-SEC-02] Ne jamais renvoyer au client d'objet Prisma brut contenant des champs sensibles (`passwordHash`, `keyEncrypted`, `sessionToken`).
- [R-SEC-03] Anti-SSRF : Valider systématiquement toute URL externe de webhook avant dispatch HTTP (bloquer localhost, IP privées RFC 1918 et métadonnées d'instance cloud `169.254.169.254`).
- [R-SEC-04] Principe Fail-Closed : En production (`NODE_ENV === 'production'`), rejeter immédiatement les requêtes (HTTP 503) ou lever une exception si les clés de signature (QStash) ou secrets d'auth manquent.
- [R-SEC-05] Better-Auth 1.7+ & MongoDB : Désactiver la vérification bloquante `advanced.database.validateSchema: false` et synchroniser `Session`, `Account`, `Verification` dans `schema.prisma` pour éliminer les 503 sur `/api/auth/get-session`.
- [R-SEC-06] Contrat Client & Synchronisation Mot de Passe Better-Auth : `signIn.email` et `signUp.email` retournent `{ data, error }` sans lever d'exception par défaut ; toujours vérifier `if (res?.error)` avant `router.push()` pour éviter une redirection silencieuse en mode Invité. Lors d'un reset/changement de mot de passe, hacher via `(await auth.$context).password.hash()` et synchroniser `User.password` ET `Account.password` (`providerId: "credential"`).
- [R-SEC-07] Google OAuth & Index MongoDB Better-Auth : Sur `Account`, définir uniquement `@@unique([providerId, accountId])` et proscrire tout index unique hérité `@@unique([provider, providerAccountId])` (qui provoque une erreur `E11000` sur valeurs nulles en MongoDB). Activer `accountLinking` et assainir `from` (`isSafeRelativeUrl` rejetant `//`) contre les Open Redirects.
- [R-SEC-08] Clé API Invité Chiffrée 24h & Quotas 10/jour : Chiffrer les clés API invitées en `AES-256-GCM` dans un cookie `HttpOnly` avec TTL strict de 24h (`guest-api-key.ts`). Appliquer un plafond de 10 recherches/jour (fenêtre UTC) sur le modèle gratuit avec déblocage automatique si une clé BYOK valide (DB ou cookie invité 24h) est active.

