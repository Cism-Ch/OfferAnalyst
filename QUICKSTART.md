# OfferAnalyst - Quick Start for Deployment

## 🎯 Goal
Deploy OfferAnalyst to Vercel with MongoDB in ~20 minutes.

## 📋 Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)
- OpenRouter API key (from https://openrouter.ai/)

## 🚀 Quick Deployment Steps

### Step 1: MongoDB Setup (10 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get connection string

📚 **Detailed guide:** `docs/MONGODB_SETUP.md`

### Step 2: Deploy to Vercel (5 minutes)
1. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cism-Ch/OfferAnalyst)
2. Add environment variables:
   - `DATABASE_URL` - Your MongoDB connection string
   - `OPENROUTER_API_KEY` - Your OpenRouter API key
   - `BETTER_AUTH_SECRET` - Run: `openssl rand -base64 32`
   - `BETTER_AUTH_URL` - Your Vercel domain (update after first deploy)
   - `NEXT_PUBLIC_APP_URL` - Same as BETTER_AUTH_URL
3. Deploy!

📚 **Detailed guide:** `docs/DEPLOYMENT.md`

### Step 3: Post-Deployment (5 minutes)
1. Get your Vercel domain (e.g., `your-app.vercel.app`)
2. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` in Vercel settings
3. Redeploy (automatic on env change)
4. Test: Visit your app and create an account

## ⚠️ Important Notes

### DATABASE_URL is Required During Build
Prisma 7 requires `DATABASE_URL` at build time, not just runtime. Make sure it's set in ALL Vercel environments (Production, Preview, Development).

See `docs/PRISMA_BUILD_CONFIG.md` for technical details.

### Environment Variables Checklist

**Required (Add in Vercel Dashboard):**
- ✅ `DATABASE_URL` - MongoDB connection (required in ALL environments for build)
- ✅ `OPENROUTER_API_KEY` - AI models
- ✅ `BETTER_AUTH_SECRET` - Auth security (32+ chars, generate with `openssl rand -base64 32`)
- ✅ `BETTER_AUTH_URL` - Your Vercel domain (update after first deploy)
- ✅ `NEXT_PUBLIC_APP_URL` - Your Vercel domain (same as above)

**Note:** Environment variables are set directly in the Vercel dashboard under Project Settings → Environment Variables. Do not use Vercel CLI secrets.

**Optional (OAuth):**
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
- `RESEND_API_KEY` - Email service

## 🔍 Troubleshooting

### Deployment Error: "Secret does not exist"
**Problem:** Vercel cannot find referenced secrets.
**Solution:** Environment variables should be set directly in the Vercel dashboard (Project Settings → Environment Variables), not as CLI secrets. The `vercel.json` file only declares which variables are required.

### Build Fails: "requires adapter or accelerateUrl"
**Solution:** Ensure `DATABASE_URL` is set in Vercel environment variables for ALL environments (Production, Preview, Development).

### Cannot Connect to Database
**Solution:** Check MongoDB Atlas Network Access allows Vercel IPs (use 0.0.0.0/0).

### OAuth Not Working
**Solution:** Update OAuth redirect URIs with your actual Vercel domain.

## 📚 Full Documentation

1. **MongoDB Setup** - `docs/MONGODB_SETUP.md` (6.5KB)
   - Step-by-step Atlas configuration
   - Connection string format
   - Security setup
   - Troubleshooting

2. **Vercel Deployment** - `docs/DEPLOYMENT.md` (10.3KB)
   - Deployment walkthrough
   - Environment variables
   - OAuth configuration
   - Monitoring
   - Production checklist

3. **Prisma Configuration** - `docs/PRISMA_BUILD_CONFIG.md` (2.3KB)
   - Technical details
   - Build requirements
   - Workarounds

4. **Implementation Summary** - `docs/PHASE_02_CONFIGURATION_SUMMARY.md` (9.7KB)
   - Complete overview
   - Architecture diagram
   - Files changed
   - Security features

## 🆘 Need Help?

1. Check troubleshooting sections in guides
2. Review environment variables
3. Check Vercel build logs
4. Check MongoDB Atlas metrics

## ✅ Success Checklist

After deployment, verify:
- [ ] Homepage loads
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard accessible
- [ ] Session persists
- [ ] Can logout

## 🎉 You're Done!

Your OfferAnalyst app is now live on Vercel with MongoDB backend. Users can:
- Sign up with email/password
- (Optional) Sign in with Google/GitHub
- Analyze offers with AI
- Save and organize results
- Track search history

---

**Total Time:** ~20 minutes  
**Cost:** $0 (using free tiers)  
**Status:** Production-ready

For advanced features (custom domain, email verification, etc.), see the full documentation guides.
