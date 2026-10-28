# 🔍 Rapport d'Audit de Qualité de Code, Fiabilité & UX — Itération 12

**Date :** 28 Octobre 2026  
**Type d'intervention :** Concertation récurrente des Agents IA (Cycle 15min — Polishing & Amélioration de l'Existant)  
**Périmètre audité :** 
- Middleware & Sécurité des Cookies : `middleware.ts`, `src/lib/auth.ts`
- Composants UI & Thèmes : `src/components/ui/toast.tsx`, `src/app/layout.tsx`
- Administration & Télémétrie : `src/app/admin/page.tsx`
- Expérience Invité vs Authentifié : Accès `/saved`, `/history`, `/projects`

---

## 🎯 Objectif de la Revue
Détecter les risques de boucle de redirection en production HTTPS, les restrictions excessives nuisant au mode invité/BYOK, les bugs d'affichage CSS en mode sombre et les données factices résiduelles dans les consoles d'administration.

---

## 🔬 Diagnostic Détaillé des Anomalies Détectées

### 1. 🛑 `middleware.ts` : Risque de boucle de redirection en production HTTPS (`__Secure-` cookie prefix)
- **Fichier :** [`middleware.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/middleware.ts#L58-L68)
- **Constat :**
  La vérification de session dans le middleware est actuellement :
  ```tsx
  const sessionCookie = request.cookies.get("offeranalyst.session_token");
  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  ```
  Or, en environnement de production servi sous HTTPS (ex: Vercel, Cloudflare, domaine personnalisé), les spécifications de sécurité des cookies et Better-Auth appliquent le préfixe strict `__Secure-` lorsque le cookie est sécurisé (`__Secure-offeranalyst.session_token`).
- **Impact Utilisateur :**
  En production HTTPS, un utilisateur pourtant connecté avec succès ne possède pas le cookie sans préfixe, ce qui entraîne son expulsion systématique vers `/auth/login` dès qu'il navigue sur une page protégée (boucle de redirection infinie).
- **Remède recommandé (`TASK-SEC-04`) :**
  Vérifier les deux variantes dans le middleware :
  ```tsx
  const sessionCookie = request.cookies.get("offeranalyst.session_token") || 
                        request.cookies.get("__Secure-offeranalyst.session_token");
  ```

---

### 2. 🚫 Restriction excessive du Middleware bloquant les utilisateurs Invités / BYOK
- **Fichier :** [`middleware.ts`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/middleware.ts#L23-L34)
- **Constat :**
  Les routes `/saved`, `/history`, `/compare`, `/projects` sont déclarées dans `protectedRoutes`.
  Pourtant, les hooks sous-jacents (`useSavedOffers`, `useSearchHistory`, `useProjects`, `useTemporaryApiKeys`) utilisent tous `localStorage` pour fonctionner de manière autonome sans compte obligatoire (philosophie BYOK & Free Tier).
- **Impact Utilisateur :**
  Un utilisateur non connecté qui analyse des offres sur `/` et sauvegarde une offre ne peut pas cliquer sur "Saved Offers" ou "History" dans le menu latéral sans être brutalement redirigé vers `/auth/login?from=/saved`.
- **Remède recommandé (`TASK-UX-19`) :**
  Retirer `/saved`, `/history`, `/compare`, `/projects` de `protectedRoutes` pour permettre l'utilisation locale en mode invité, et réserver `protectedRoutes` aux sections strictement réservées aux comptes authentifiés (`/admin`, `/dashboard/settings`, `/dashboard/workspace`).

---

### 3. 🎨 Bug de Style CSS : Barre de progression du Toast en Dark Mode
- **Fichier :** [`src/components/ui/toast.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ui/toast.tsx#L43-L48) & [L103-L111](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/components/ui/toast.tsx#L103-L111)
- **Constat :**
  Pour générer la couleur de fond de la barre de progression, le composant exécute :
  ```tsx
  className={cn('h-1', iconColors[type].replace('text-', 'bg-'))}
  ```
  La constante `iconColors['success']` vaut `'text-green-600 dark:text-green-400'`.
  Comme `String.prototype.replace(string, ...)` ne remplace que la **première** occurrence, la classe résultante est :
  `'bg-green-600 dark:text-green-400'`.
  En mode sombre (dark, neon, gold sombre, ocean), la classe `dark:text-green-400` applique une couleur de texte à un élément `<div>` sans texte au lieu d'une couleur d'arrière-plan !
- **Impact Visuel :**
  En mode sombre, la barre de progression des notifications de succès ou d'erreur s'affiche sans couleur de fond ou avec la couleur par défaut du conteneur.
- **Remède recommandé (`TASK-UX-20`) :**
  Remplacer par une expression régulière globale : `.replace(/text-/g, 'bg-')`.

---

### 4. 👥 Données Factices résiduelles dans la Console Admin (`AdminPage`)
- **Fichier :** [`src/app/admin/page.tsx`](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/src/app/admin/page.tsx#L55-L60)
- **Constat :**
  Le tableau des utilisateurs récents utilise un mock statique de 3 utilisateurs en dur :
  ```tsx
  const recentUsers = [
      { id: '1', name: 'Administrateur Principal', email: 'admin@offeranalyst.com', role: 'Superadmin', status: 'Active' },
      ...
  ];
  ```
  L'application dispose déjà du singleton Prisma connecté à MongoDB (`prisma.user`).
- **Remède recommandé (`TASK-FIX-07`) :**
  Créer une Server Action sécurisée `getRecentAdminUsersAction()` interrogeant `prisma.user.findMany(...)` et afficher les vrais comptes inscrits sur la plateforme.

---

## 📋 Tableau Récapitulatif des Tâches Candidates Identifiées

| ID | Domaine | Priorité | Intitulé | Fichiers Cibles |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK-SEC-04`** | Sécurité / Middleware | 🔴 CRITIQUE | Prise en charge du cookie HTTPS `__Secure-offeranalyst.session_token` pour éviter les boucles de redirection | `middleware.ts` |
| **`TASK-UX-19`** | UX / Invité | 🔴 HAUTE | Déverrouillage des routes locales (`/saved`, `/history`, `/compare`) pour les utilisateurs en mode Invité | `middleware.ts` |
| **`TASK-UX-20`** | UI / Toasts | 🟢 MOYENNE | Correction du remplacement de classe CSS `.replace(/text-/g, 'bg-')` en mode sombre | `src/components/ui/toast.tsx` |
| **`TASK-FIX-07`** | Admin / Données | 🟡 MOYENNE | Remplacement du mock statique des utilisateurs par les vrais comptes Prisma | `src/app/admin/page.tsx`, `src/app/actions/db/admin.ts` |

---

## 🛡️ Vérification & Conformité
- **Types TypeScript :** Vérifié via `npx tsc --noEmit` (0 erreur).
- **Plafond SSOT `docs/TASKS.md` :** Maintenu sous la limite stricte de 250 lignes (245 lignes actuelles).
- **Règles Inviolables :** Aucun ajout de fonctionnalité majeure nouvelle ; focus absolu sur la robustesse, la fluidité et la sécurité de l'existant.
