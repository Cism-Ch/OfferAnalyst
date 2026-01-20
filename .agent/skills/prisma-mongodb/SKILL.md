---
name: Prisma MongoDB Management
description: Specialized skill for managing Prisma with the MongoDB database adapter. Use this skill when working with schema changes, data persistence, or deployments on MongoDB.
---

# Prisma MongoDB Management

This skill provides instructions for managing Prisma with MongoDB. Since MongoDB is a document-oriented database, Prisma's behavior differs from traditional relational databases (SQL).

## Core Concepts

### 1. No Migrations (`db push`)
MongoDB does not use traditional migration files (`prisma migrate dev`). Instead, you synchronize the schema directly with the database.
- **Action**: Use `npx prisma db push` to apply changes to the database.
- **Workflow**:
    1. Modify `prisma/schema.prisma`.
    2. Run `npx prisma db push`.
    3. Run `npx prisma generate` to update the Prisma Client.

### 2. ID Definition (ObjectId)
Every model in MongoDB must have an `ID` that maps to the underlying `_id` field.
```prisma
model Example {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  // ...
}
```

### 3. Relations
MongoDB relations are managed at the application level by Prisma. Relational constraints (like `onDelete: Cascade`) work within Prisma but aren't enforced by the database itself.
- **Embedded Documents**: While Prisma supports relations, consider if some data should be embedded for performance.
- **Indexes**: Explicitly define indexes for fields used in queries to ensure performance.
```prisma
model Project {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  // ...
  @@index([userId])
}
```

## Common Operations

### Regenerating the Client
Always regenerate the client after schema changes to ensure type safety.
```powershell
npx prisma generate
```

### Introspection
If you have an existing MongoDB database, you can introspect it to generate the schema.
```powershell
npx prisma db pull
```

## Best Practices
1. **Always use @db.ObjectId**: For foreign keys and primary keys to ensure compatibility with MongoDB tools.
2. **Handle Optional Filters**: MongoDB queries with Prisma often require explicit null/undefined handling.
3. **Environment Variables**: Ensure `DATABASE_URL` or `MONGODB_URI` is correctly set in `.env.local`.
4. **Validation**: Use Zod alongside Prisma for robust data validation before it reaches the database.
