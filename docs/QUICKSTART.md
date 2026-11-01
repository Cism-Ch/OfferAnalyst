# OFFERAN - Quick Start for Deployment

## 🎯 Goal
Deploy OFFERAN to Vercel with MongoDB Atlas in ~20 minutes.

## 📋 Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)
- OpenRouter API key (from https://openrouter.ai/)
- Package Manager: `pnpm` (v12.15+)

## 🚀 Quick Deployment Steps

### Step 1: MongoDB Setup (10 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user and password
4. Whitelist all IPs (0.0.0.0/0) for Vercel edge/serverless access
5. Get connection string (`DATABASE_URL`)

📚 **Detailed guide:** `docs/MONGODB_SETUP.md`

### Step 2: Deploy to Vercel (5 minutes)
1. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cism-Ch/OfferAnalyst)
2. Add environment variables in Vercel Project Settings:
   - `DATABASE_URL` - Your MongoDB connection string (required in ALL environments)
   - `OPENROUTER_API_KEY` - Your OpenRouter AI key
   - `BETTER_AUTH_SECRET` - Generate via `openssl rand -base64 32`
   - `BETTER_AUTH_URL` - Your Vercel domain (e.g. `https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` - Same as BETTER_AUTH_URL
   - `ADMIN_NAME` - Initial admin display name
   - `ADMIN_EMAIL` - Initial admin email address
   - `ADMIN_PASSWORD` - Initial secure admin password
3. Deploy!

📚 **Detailed guide:** `docs/DEPLOYMENT.md`

### Step 3: Admin Account Provisioning (2 minutes)
Run the idempotent admin seeding script to ensure the admin identity and `ADMIN` role are registered in MongoDB:

```bash
pnpm run db:seed-admin
```

### Step 4: Post-Deployment Verification (3 minutes)
1. Visit your deployed application URL
2. Log in with your admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
3. Access `/dashboard/workspace` to configure your first B2B team workspace
4. Test offer ingestion via `/data-source`

## ⚠️ Important Notes

### DATABASE_URL is Required During Build
Prisma requires `DATABASE_URL` at build time to generate the client and validate schemas. Make sure it's set in ALL Vercel environments (Production, Preview, Development).

### Environment Variables Checklist

**Required (Add in Vercel Dashboard):**
- ✅ `DATABASE_URL` - MongoDB connection string
- ✅ `OPENROUTER_API_KEY` - AI inference gateway
- ✅ `BETTER_AUTH_SECRET` - Auth encryption (32+ chars)
- ✅ `BETTER_AUTH_URL` - Production URL
- ✅ `NEXT_PUBLIC_APP_URL` - Client-side app URL
- ✅ `ADMIN_EMAIL` - Master admin login
- ✅ `ADMIN_PASSWORD` - Master admin password

**Optional (OAuth & Webhooks):**
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
- `QSTASH_TOKEN` + `QSTASH_CURRENT_SIGNING_KEY` (for async webhook dispatch)
- `RESEND_API_KEY` (email service)

## 🔍 Troubleshooting

### Build Fails: "P2023 / Malformed ObjectID"
**Solution:** Ensure `src/lib/auth.ts` has `advanced.database.generateId: false` so MongoDB generates native ObjectIds.

### Session Error: "Unique constraint failed on sessions_sessionToken_key"
**Solution:** The obsolete NextAuth index has been removed in Prisma 6.2. If working on a legacy DB, drop the index using MongoDB Atlas Data Explorer.

### Cannot Connect to Database
**Solution:** Ensure MongoDB Atlas Network Access IP Access List includes `0.0.0.0/0`.
