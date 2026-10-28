# 📖 Fullstack Playbook (Mémoire Évolutive RSI)
> **CONTRAINTE STRICTE :** Maximum 150 lignes. Chaque règle doit être atomique, actionnable et rattachée à une couche précise.  
> Modifié et compacté automatiquement par le Méta-Agent Optimiseur en Phase 3 du protocole RSI.

---

## [DATABASE & PRISMA MONGODB]
- [R-DB-01] Avec MongoDB, toute clé étrangère relationnelle doit être typée `String @db.ObjectId` dans `schema.prisma`.
- [R-DB-02] Toujours exécuter `npx prisma validate` et `npx prisma generate` après toute modification de schéma avant de modifier le code applicatif.
- [R-DB-03] Ne jamais stocker de gros blocs HTML ou payloads bruts (> 50 Ko) dans MongoDB ; décharger vers Tigris S3 et stocker uniquement la clé ou l'URL signée.
- [R-DB-04] Utiliser systématiquement le singleton `prisma` de `@/lib/prisma` pour éviter l'épuisement des connexions du pool MongoDB Atlas en serverless.
- [R-DB-05] Sous Windows avec Next dev actif, `prisma generate` échoue par verrouillage du DLL moteur (`EPERM`). Arrêter brièvement le serveur dev (`Ctrl+C`) avant de lancer `pnpm exec prisma generate` pour une génération native propre.

## [BACKEND & SERVER ACTIONS / QSTASH]
- [R-API-01] Dans Next.js 16, `headers()` et `cookies()` sont des Promises asynchrones : toujours utiliser `await headers()` et `await cookies()`.
- [R-API-02] Valider systématiquement l'entrée brute (`rawInput: unknown`) d'une Server Action avec `Schema.safeParse()` avant toute opération DB.
- [R-API-03] Chaque Server Action doit retourner le standard unifié `{ success: true, data } | { success: false, error: { message, code } }`.
- [R-API-04] Sur tout webhook entrant QStash (`/api/jobs`), vérifier la signature avec `receiver.verify` et implémenter une clé d'idempotence (`messageId`).
- [R-API-05] Appeler `revalidatePath(path)` ou `revalidateTag(tag)` immédiatement après une mutation réussie en Server Action pour purger le cache de route.
- [R-API-06] Ne jamais placer `'use server'` sur un fichier utilitaire interne : cela expose toutes ses fonctions exportées comme endpoints HTTP RPC publics non authentifiés. Réserver `'use server'` aux Server Actions UI.
- [R-API-07] Anti-IDOR absolu : toute Server Action manipulant des données utilisateur doit ignorer le `userId` passé en argument client et extraire l'ID vérifié depuis la session serveur Better-Auth (`session.user.id`).

## [FRONTEND & REACT 19 / TAILWIND V4]
- [R-UI-01] Gérer explicitement les 4 états asynchrones sur chaque composant interactif : `isLoading`, `isError`, `isEmpty` et `data`.
- [R-UI-02] Ne jamais utiliser `React.forwardRef` avec React 19 (les `ref` sont désormais passées directement comme props aux composants fonctionnels).
- [R-UI-03] Utiliser Tailwind CSS v4 avec les tokens définis dans `@/app/globals.css` et respecter l'ordre canonique des classes (Layout -> Sizing -> Typo -> Borders -> Effects).
- [R-UI-04] Pour les formulaires React 19 avec Server Actions, privilégier `useActionState` et `useTransition` pour un feedback immédiat.
- [R-UI-05] Standards Tactiles 2026 : Tout élément interactif sur mobile doit garantir une cible tactile `min-h-[44px] min-w-[44px]` (WCAG 2.1 AA) avec `touch-action: manipulation;`.
- [R-UI-06] Insets & Conteneurs Anti-Blowout : Intégrer `pb-safe` / `pt-safe` pour les barres mobiles. Les modales et cartes doivent borner `max-h-[85vh] overflow-y-auto` et forcer `break-all` / `truncate` sur les chaînes de longueur arbitraire.
- [R-UI-07] DataViz Responsive : Sur les graphiques (Recharts), calibrer `XAxis` avec `minTickGap={20}`, `interval="preserveStartEnd"`, et tronquer systématiquement les libellés via `tickFormatter`.
- [R-UI-08] Multi-Thèmes & Tailwind v4 : Toujours passer le tableau `themes` explicite à `ThemeProvider` pour la persistance SSR. Étendre `@custom-variant dark` aux thèmes sombres customisés (`.neon`), et bannir les classes en dur (`bg-white`, `bg-slate-*`) au profit des tokens HSL (`bg-card`, `bg-muted`).
- [R-UI-09] Hygiène Visuelle & Emojis : Bannir les emojis natifs OS dans l'interface utilisateur au profit d'icônes vectorielles SVG (Lucide) adaptées aux tokens HSL du thème actif. Utiliser le composant 'OffanLogo' / 'OffanIcon' pour l'identité de marque.
- [R-UI-10] Synchronisation État Externe (React 19 / ESLint react-hooks/set-state-in-effect) : Ne jamais appeler setState() directement dans le corps d'un useEffect() pour lire du localStorage ou synchroniser une préférence (thème, langue). Utiliser systématiquement useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) avec un Set de listeners et window.addEventListener('storage') pour une réactivité instantanée sans flash ni render en cascade.
- [R-UI-11] Lisibilité des Cartes d'Analyse : Pour les entités riches (offres, analyses), bannir les vues tassées (< 60% de largeur). Déployer une grille 12 colonnes (8 cols pour les résultats), des bordures définies (border-border/80), et un modal d'exploration plein écran (`OfferDetailModal`) pour révéler la justification complète, le score 3 axes et tous les web insights.
- [R-UI-12] Internationalisation Réactive & Symétrique (i18n) : Maintenir un dictionnaire TypeScript typé et symétrique (FR/EN) dans `LanguageContext.tsx`. Dans les shells et layouts (`ModernHeader`, `SimpleLayout`), mapper dynamiquement `pathname` vers `routes[pathname]` avec fallback sûr. Localiser dynamiquement les presets et sélecteurs selon la langue active sans régression SSR.


## [INTEGRATION, SECURITY & TYPES]
- [R-INT-01] Bannir strictement `any`. Définir des interfaces TypeScript explicites ou inférer les types via `z.infer<typeof Schema>`.
- [R-INT-02] Ne jamais renvoyer au client d'objet Prisma brut contenant des champs sensibles (`passwordHash`, `keyEncrypted`, `sessionToken`).
- [R-INT-03] Toute clé BYOK doit transiter par `encryptApiKey()` avant stockage et être auditée via `api_key_usage_logs`.
- [R-INT-04] Toujours importer les modules via l'alias `@/*` et supprimer les imports inutilisés pour maintenir un code propre et éviter les avertissements ESLint.
- [R-INT-05] Middleware Routing : Ne jamais utiliser `pathname.startsWith(route)` avec la route racine `'/'` dans une liste de routes publiques (cela valide aveuglément toutes les requêtes). Utiliser `pathname === route`.
- [R-INT-06] Anti-SSRF : Valider systématiquement toute URL externe de webhook avant dispatch HTTP (bloquer localhost, IP privées RFC 1918 et métadonnées d'instance cloud `169.254.169.254`).
- [R-INT-07] Principe Fail-Closed : En production (`NODE_ENV === 'production'`), rejeter immédiatement les requêtes (HTTP 503) ou lever une exception si les clés de signature (QStash) ou secrets d'auth manquent.
- [R-INT-08] FinOps & Télémétrie AI : Interroger `GET https://openrouter.ai/api/v1/auth/key` pour auditer le statut, solde $ et limites d'une clé sans coût d'inférence. Avec `@openrouter/sdk`, les métriques d'usage sont strictement en camelCase (`promptTokens`, `completionTokens`, `totalTokens`).
- [R-INT-09] Décision Décodage Contraint LLM : Quand `responseFormat: { type: "json_object" }` est utilisé, l'instruction système DOIT exiger un objet JSON `{ "offers": [ ... ] }` et non un tableau brut `[ ... ]` (interdit par la grammaire BNF contrainte).
- [R-INT-10] Extracteur Universel LLM : Dépiler les réponses AI via `extractOffersArray()` pour absorber les tableaux directs, clés conteneurs (`offers`, `data`, `results`), dictionnaires ou objet unique sans crash Zod.
- [R-INT-11] Better-Auth 1.7+ & MongoDB : Désactiver la vérification bloquante `advanced.database.validateSchema: false` et synchroniser `Session`, `Account`, `Verification` dans `schema.prisma` pour éliminer les 503 sur `/api/auth/get-session`.
- [R-INT-12] Contrat Client & Synchronisation Mot de Passe Better-Auth : `signIn.email` et `signUp.email` retournent `{ data, error }` sans lever d'exception par défaut ; toujours vérifier `if (res?.error)` avant `router.push()` pour éviter une redirection silencieuse en mode Invité. Lors d'un reset/changement de mot de passe, hacher via `(await auth.$context).password.hash()` et synchroniser `User.password` ET `Account.password` (`providerId: "credential"`).
- [R-INT-13] Continuité Hybride Guest / Cloud (BYOK & Onboarding) : En mode Invité (`!session?.user`), sauvegarder les clés saisies en onboarding dans `useTemporaryApiKeys` (avec mise à jour fonctionnelle `setKeys(prev => ...)` anti-race-condition) et propager `tempKeys.getKey('openrouter')` vers toutes les Server Actions IA (V1 & V2) via le résolveur hybride `getAPIKey()`.
- [R-INT-14] Google OAuth & Index MongoDB Better-Auth : Sur `Account`, définir uniquement `@@unique([providerId, accountId])` et proscrire tout index unique hérité `@@unique([provider, providerAccountId])` (qui provoque une erreur `E11000` sur valeurs nulles en MongoDB). Activer `accountLinking` et assainir `from` (`isSafeRelativeUrl` rejetant `//`) contre les Open Redirects.
- [R-INT-15] Clé API Invité Chiffrée 24h & Quotas 10/jour : Chiffrer les clés API invitées en `AES-256-GCM` dans un cookie `HttpOnly` avec TTL strict de 24h (`guest-api-key.ts`). Appliquer un plafond de 10 recherches/jour (fenêtre UTC) sur le modèle gratuit avec déblocage automatique si une clé BYOK valide (DB ou cookie invité 24h) est active.
- [R-INT-16] Historique Hybride (TTL 7j Local vs Rétention Cloud 90j) : Stocker l'historique invité dans `localStorage` avec expiration à 7 jours, migrer et dédupliquer automatiquement vers MongoDB à la connexion (`migrateGuestSearchesAction`), et purger via CRON (`/api/cron/cleanup-history`) les entrées non épinglées > 90 jours en préservant `isPinned: true`.
