# 🗄️ Module : Base de Données & ORM (Prisma & MongoDB)
> Règles procédurales relatives aux modèles de données, connexions et intégrité ORM.

- [R-DB-01] Avec MongoDB, toute clé étrangère relationnelle doit être typée `String @db.ObjectId` dans `schema.prisma`.
- [R-DB-02] Toujours exécuter `pnpm exec prisma validate` et `pnpm exec prisma generate` après toute modification de schéma avant de modifier le code applicatif.
- [R-DB-03] Ne jamais stocker de gros blocs HTML ou payloads bruts (> 50 Ko) dans MongoDB ; décharger vers Tigris S3 et stocker uniquement la clé ou l'URL signée.
- [R-DB-04] Utiliser systématiquement le singleton `prisma` de `@/lib/prisma` pour éviter l'épuisement des connexions du pool MongoDB Atlas en serverless.
- [R-DB-05] Sous Windows avec Next dev actif, `prisma generate` échoue par verrouillage du DLL moteur (`EPERM`). Arrêter brièvement le serveur dev (`Ctrl+C`) avant de lancer `pnpm exec prisma generate` pour une génération native propre.
- [R-DB-06] Sérialisation Prisma MongoDB vs ObjectId : Ne jamais passer une chaîne arbitraire (ex: shareToken) à un filtre Prisma `{ id: token }` sous MongoDB, car Prisma tente de la convertir en ObjectId 12-octets et lève une exception P2023. Vérifier systématiquement `/^[0-9a-fA-F]{24}$/.test(token)` avant d'inclure `{ id: token }` dans une clause OR.

