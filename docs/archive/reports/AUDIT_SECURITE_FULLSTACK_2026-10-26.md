# 🛡️ Rapport d'Audit de Sécurité Approfondi & Durcissement Fullstack
> **Projet :** OfferAnalyst  
> **Date :** 26 Octobre 2026  
> **Statut :** ✅ Remédié & Validé (100% Tests Passés)  
> **Référence SSOT :** `TASK-SEC-02` (Sous-tâches `TASK-SEC-02.01` à `TASK-SEC-02.10`)  
> **Auditeurs :** Agent Auditeur AppSec, Agent Worker Fullstack, Méta-Agent RSI

---

## 📋 Résumé Exécutif

Un audit approfondi de la surface d'attaque de l'application **OfferAnalyst** a été réalisé sur les couches d'authentification, les API routes, les Server Actions RPC, la gestion des secrets BYOK, les mécanismes de webhooks et les en-têtes HTTP de sécurité.

**10 vulnérabilités distinctes** (dont 4 critiques et 3 élevées) ont été détectées, exploitées conceptuellement, et intégralement remédiées sans régression fonctionnelle ni d'expérience utilisateur.

---

## 🔍 Matrice Détaillée des 10 Vulnérabilités Identifiées

### 1. `SEC-02.01` — Bypassing Global du Middleware d'Authentification
- **Gravité :** 🔴 CRITIQUE (CVSS 9.8)
- **Fichier :** [`middleware.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/middleware.ts)
- **Description :** Le middleware évaluait l'accès public via `publicRoutes.some(route => pathname.startsWith(route))`. La liste `publicRoutes` contenant la route racine `'/'`, l'instruction `pathname.startsWith('/')` évaluait à `true` pour la totalité des routes du site (`/dashboard`, `/admin`, etc.).
- **Impact :** Contournement intégral du contrôle d'accès ; n'importe quel internaute non authentifié pouvait accéder aux pages réservées.
- **Remédiation :** Remplacement par une égalité stricte pour la racine (`pathname === route`) et ajout du préfixe `/admin` aux `protectedRoutes`.

### 2. `SEC-02.02` — Fuite Publique RPC de la Clé API Système OpenRouter
- **Gravité :** 🔴 CRITIQUE (CVSS 9.1)
- **Fichier :** [`src/app/actions/shared/api-key-provider.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/shared/api-key-provider.ts)
- **Description :** Présence de la directive `'use server'` en tête du fichier exportant `getAPIKey()`. Dans Next.js, toute fonction exportée sous `'use server'` devient un endpoint HTTP RPC public.
- **Impact :** Un simple appel POST RPC permettait à un visiteur anonyme de voler la clé secrète `OPENROUTER_API_KEY` du serveur.
- **Remédiation :** Retrait de `'use server'`, transformation en module utilitaire serveur hermétique privé.

### 3. `SEC-02.03` — Exposition Publique RPC des Clés API BYOK Utilisateur
- **Gravité :** 🔴 CRITIQUE (CVSS 8.8)
- **Fichier :** [`src/app/actions/db/api-keys.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-keys.ts)
- **Description :** L'action `getDecryptedAPIKey` était exportée comme Server Action RPC publique, déchiffrant et retournant la clé API en clair au format texte.
- **Impact :** Risque direct d'exfiltration des clés privées BYOK des utilisateurs.
- **Remédiation :** Suppression pure et simple de `getDecryptedAPIKey` de la surface RPC. Le déchiffrement n'a lieu que dans les workers internes d'inférence LLM.

### 4. `SEC-02.04` — Absence de Vérification RBAC sur l'Administration
- **Gravité :** 🔴 CRITIQUE (CVSS 8.5)
- **Fichiers :** [`src/app/api/admin/feature-flags/route.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/api/admin/feature-flags/route.ts) & [`src/app/actions/db/admin.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/admin.ts)
- **Description :** Les routes GET et POST `/api/admin/feature-flags` ainsi que les Server Actions d'administration (`getSystemStats`, etc.) ne vérifiaient ni la session, ni le rôle `ADMIN`.
- **Impact :** N'importe quel internaute pouvait modifier les feature flags de production et lire les métriques système.
- **Remédiation :** Implémentation du contrôle de session Better-Auth avec validation du rôle `(session.user.role === 'ADMIN')` retournant un HTTP 403 Forbidden en cas de refus.

### 5. `SEC-02.05` — Usurpation Non Authentifiée d'Alertes Email via RPC
- **Gravité :** 🟠 ÉLEVÉE (CVSS 7.5)
- **Fichier :** [`src/lib/email-notifications.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/email-notifications.ts)
- **Description :** La directive `'use server'` était placée en tête du fichier `email-notifications.ts`.
- **Impact :** Tout attaquant externe pouvait invoquer directement `sendSecurityAlertEmail` via Next.js RPC et envoyer des e-mails frauduleux au nom de l'application (phishing/spoofing).
- **Remédiation :** Déclassification en module serveur Node.js interne hermétique sans `'use server'`.

### 6. `SEC-02.06` — Faille IDOR / BOLA sur les Clés API et Rotations
- **Gravité :** 🟠 ÉLEVÉE (CVSS 7.4)
- **Fichiers :** [`src/app/actions/db/api-keys.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-keys.ts) & [`src/app/actions/db/api-key-rotation.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-key-rotation.ts)
- **Description :** Les fonctions acceptaient `userId: string` en provenance du client et l'utilisaient directement dans la clause Prisma `where: { userId }`.
- **Impact :** Substitution d'ID permettant à un utilisateur authentifié de lister ou révoquer les clés d'un autre utilisateur.
- **Remédiation :** Extraction forcée de `session.user.id` depuis `auth.api.getSession({ headers: await headers() })`, écrasant tout paramètre client.

### 7. `SEC-02.07` — Faille IDOR sur les Alertes de Sécurité
- **Gravité :** 🟠 ÉLEVÉE (CVSS 7.1)
- **Fichier :** [`src/app/actions/db/security-alerts.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/security-alerts.ts)
- **Description :** Les actions `getUserSecurityAlerts`, `markAlertAsRead`, `resolveAlert`, `deleteResolvedAlerts` se fiaient au `userId` transmis par les composants React.
- **Impact :** Consultation et manipulation non autorisée des alertes de sécurité d'autres comptes.
- **Remédiation :** Vérification de session active et liaison stricte à l'identifiant serveur authentifié.

### 8. `SEC-02.08` — Faille IDOR sur les Métriques et Analytiques d'Usage
- **Gravité :** 🟡 MOYENNE (CVSS 6.5)
- **Fichiers :** [`src/app/actions/db/analytics.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/analytics.ts) & [`src/app/actions/db/api-key-analytics.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/actions/db/api-key-analytics.ts)
- **Description :** Les fonctions de KPI (`getUserAnalytics`, `getSearchTimeline`, `getAPIKeyAnalytics`, `getUsageTimeline`) filtraient sur le `userId` passé en argument.
- **Impact :** Espionnage de l'activité, des requêtes et de la consommation de jetons des autres utilisateurs.
- **Remédiation :** Validation de session systématique et remplacement de l'ID par la session certifiée.

### 9. `SEC-02.09` — Vulnérabilité SSRF sur les Dispatches de Webhooks
- **Gravité :** 🟠 ÉLEVÉE (CVSS 7.2)
- **Fichier :** [`src/lib/webhooks.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/webhooks.ts)
- **Description :** `sendWebhook(webhookUrl)` effectuait un `fetch` aveugle vers l'URL fournie par l'utilisateur ou la configuration.
- **Impact :** Risque de Server-Side Request Forgery vers `127.0.0.1`, les plages IP privées (10.0.0.0/8, 192.168.0.0/16) ou les métadonnées d'instance cloud (`169.254.169.254`).
- **Remédiation :** Création du validateur `isValidWebhookUrl` vérifiant les schémas HTTP/HTTPS, interdisant la boucle locale en production, les plages RFC 1918 et les adresses de métadonnées.

### 10. `SEC-02.10` — Absence de Content-Security-Policy & Mode Fail-Open en Production
- **Gravité :** 🟡 MOYENNE (CVSS 5.9)
- **Fichiers :** [`next.config.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/next.config.ts), [`src/app/api/jobs/route.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/api/jobs/route.ts), [`src/lib/auth.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/lib/auth.ts)
- **Description :** Absence de directive CSP dans les en-têtes HTTP ; exécution permissive de jobs QStash sans receiver configuré en production ; fallback sur secret prévisible en production.
- **Impact :** Sensibilité aux injections de scripts et mode dégradé dangereux en cas de mauvaise configuration cloud.
- **Remédiation :** Ajout d'une CSP Next.js durcie (`frame-ancestors 'none'`), passage en "fail-closed" HTTP 503 pour `/api/jobs` sans clés et exception bloquante si `BETTER_AUTH_SECRET` est absent en production.

---

## ✅ Vérification et Résultats

- **Compilation TypeScript :** `npx tsc --noEmit` -> 0 erreur.
- **Linter ESLint React 19 :** `npm run lint` -> 0 erreur.
- **Juge Déterministe RSI :** `npm run eval:quick` -> 100/100 (Statut PASS).
- **Règles Mémorisées :** 5 règles de sécurité ajoutées au Playbook RSI (`fullstack_playbook.md`).
