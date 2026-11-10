# 🗄️ Module : Base de Données & ORM (Prisma & Supabase PostgreSQL)
> Règles procédurales relatives aux modèles de données, connexions et intégrité ORM.

- [R-DB-01] Architecture PostgreSQL / Supabase : Utiliser des clés primaires canoniques `@id @default(cuid())` et des clés étrangères typées `String` avec relations déclarées et contraintes d'intégrité référentielle (`onDelete: Cascade` / `SetNull`).
- [R-DB-02] Toujours exécuter `pnpm exec prisma validate` et `pnpm exec prisma generate` après toute modification de schéma avant de modifier le code applicatif.
- [R-DB-03] Ne jamais stocker de gros blocs HTML ou payloads bruts (> 50 Ko) dans la base ; décharger vers Tigris S3 et stocker uniquement la clé ou l'URL signée.
- [R-DB-04] Utiliser systématiquement le singleton `prisma` de `@/lib/prisma` et le connection pooler transactionnel Supabase (`DATABASE_URL` port 6543) pour éviter l'épuisement des connexions en environnement Serverless Vercel.
- [R-DB-05] Sous Windows avec Next dev actif, `prisma generate` peut échouer par verrouillage du binaire moteur (`EPERM`). Arrêter brièvement le serveur dev avant de lancer `pnpm exec prisma generate` pour une génération native propre.
- [R-DB-06] Séparation Pooler vs Direct : Configurer `url = env("DATABASE_URL")` (PgBouncer pooler) pour le runtime applicatif et `directUrl = env("DIRECT_URL")` (port 5432) pour les migrations et `prisma db push`.
