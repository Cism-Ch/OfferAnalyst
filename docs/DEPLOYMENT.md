# Vercel Deployment Guide for OfferAnalyst

This guide walks you through deploying OfferAnalyst to Vercel with MongoDB integration.

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed [MongoDB setup](./MONGODB_SETUP.md)
- ✅ OpenRouter API key
- ✅ (Optional) OAuth credentials for Google/GitHub
- ✅ GitHub repository with your code

## Step 1: Prepare for Deployment

### 1.1 Verify Local Build

Before deploying, ensure your app builds successfully locally:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build the application
npm run build

# Test production build locally
npm start
```

If you encounter any build errors, fix them before proceeding to deployment.

### 1.2 Review Environment Variables

Make sure you have all required environment variables ready:

**Required:**
- `DATABASE_URL` - MongoDB connection string
- `BETTER_AUTH_SECRET` - Authentication secret (32+ characters)
- `OPENROUTER_API_KEY` - Your OpenRouter API key

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your Git repository:**
   - Select GitHub
   - Choose your OfferAnalyst repository
   - Click "Import"

4. **Configure Project:**
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npx prisma generate && next build` (auto from vercel.json)
   - **Install Command:** `npm install` (auto from vercel.json)

5. **Add Environment Variables:**
   Click "Environment Variables" and add all required variables:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `DATABASE_URL` | `mongodb+srv://user:pass@...` | **Production, Preview, Development** |
   | `BETTER_AUTH_SECRET` | Your generated secret | Production, Preview, Development |
   | `BETTER_AUTH_URL` | `https://your-domain.vercel.app` | Production |
   | `BETTER_AUTH_URL` | `https://your-preview.vercel.app` | Preview |
   | `BETTER_AUTH_URL` | `http://localhost:3000` | Development |
   | `NEXT_PUBLIC_APP_URL` | Same as BETTER_AUTH_URL | All environments |
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production, Preview, Development |
   | `GOOGLE_CLIENT_ID` | (Optional) | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | (Optional) | Production, Preview, Development |
   | `GITHUB_CLIENT_ID` | (Optional) | Production, Preview, Development |
   | `GITHUB_CLIENT_SECRET` | (Optional) | Production, Preview, Development |

   **Important Notes:**
   - Environment variables should be added directly in the Vercel dashboard, **not** as CLI secrets
   - The `vercel.json` file declares which environment variables are required, but values are set in the dashboard
   - **Critical:** `DATABASE_URL` **MUST** be available in ALL environments (including Development) because Prisma 7 requires it during the build process
   - Use the actual Vercel domain for production/preview environments
   - You'll get this domain after first deployment, update it afterwards
   - See [Prisma Build Configuration](./PRISMA_BUILD_CONFIG.md) for details on why DATABASE_URL is required at build time

6. **Click "Deploy"**
   - Vercel will build and deploy your application
   - Wait for deployment to complete (2-5 minutes)

7. **Update OAuth Redirect URIs**
   
   After getting your Vercel domain (e.g., `your-app.vercel.app`):
   
   **For Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your project > Credentials
   - Edit your OAuth 2.0 Client
   - Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
   
   **For GitHub OAuth:**
   - Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
   - Edit your OAuth App
   - Update callback URL: `https://your-app.vercel.app/api/auth/callback/github`

8. **Update Environment Variables with Correct Domain**
   - Go back to Vercel project settings
   - Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual domain
   - Redeploy (Vercel will auto-deploy on env var change)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # From your project root
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy: Yes
   - Which scope: Choose your account
   - Link to existing project: No (first time)
   - Project name: offeranalyst (or your preference)
   - Directory: ./ (default)
   - Override settings: No

5. **Add environment variables:**
   ```bash
   # Add each variable
   vercel env add DATABASE_URL production
   vercel env add BETTER_AUTH_SECRET production
   vercel env add OPENROUTER_API_KEY production
   # ... etc
   ```

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

1. **Visit your Vercel domain:**
   ```
   https://your-app.vercel.app
   ```

2. **Test basic functionality:**
   - Homepage loads correctly
   - Dashboard is accessible
   - Theme switcher works

3. **Test authentication:**
   - Visit `/auth/signup`
   - Create a test account
   - Verify user appears in MongoDB Atlas
   - Test login/logout

4. **Test OAuth (if configured):**
   - Click "Continue with Google" or "Continue with GitHub"
   - Complete OAuth flow
   - Verify redirect back to app

## Step 4: Configure Custom Domain (Optional)

1. **Go to Vercel project settings**
2. **Navigate to "Domains"**
3. **Add your custom domain:**
   - Enter domain name (e.g., `offeranalyst.com`)
   - Follow DNS configuration instructions
4. **Update environment variables:**
   - Update `BETTER_AUTH_URL` to use custom domain
   - Update `NEXT_PUBLIC_APP_URL` to use custom domain
5. **Update OAuth redirect URIs** with new custom domain

## Step 5: Monitor Deployment

### Vercel Dashboard

Monitor your deployment health:
- **Deployments:** View build logs and deployment history
- **Analytics:** Track page views and performance
- **Logs:** Real-time function logs
- **Speed Insights:** Performance metrics

### MongoDB Atlas

Monitor database usage:
- **Metrics:** Database connections, operations
- **Performance Advisor:** Optimization suggestions
- **Alerts:** Set up alerts for errors or high usage

## Troubleshooting

### Build Fails: "Prisma Client not generated"
**Solution:** Vercel should run `npx prisma generate` via the custom build command in `vercel.json`. Verify this is set correctly.

### Runtime Error: "Cannot connect to database"
**Solutions:**
- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Check MongoDB Atlas Network Access allows Vercel IPs (use 0.0.0.0/0)
- Ensure MongoDB cluster is running

### Authentication Error: "Invalid callback URL"
**Solutions:**
- Verify `BETTER_AUTH_URL` matches your Vercel domain exactly
- Update OAuth provider redirect URIs with correct Vercel domain
- Check that `NEXT_PUBLIC_APP_URL` is accessible from browser

### 404 on Auth Routes
**Solution:** Ensure the API route handler exists at `src/app/api/auth/[...all]/route.ts`

### OAuth Returns Error
**Solutions:**
- Verify OAuth client IDs and secrets are correctly set
- Check redirect URIs match exactly (https vs http, trailing slash)
- Ensure OAuth app is not in development/testing mode

### Environment Variables Not Taking Effect
**Solution:** 
- Changes to environment variables require a new deployment
- Trigger a redeploy from Vercel dashboard or push a new commit

## Production Checklist

Before going live, ensure:

- [ ] MongoDB Atlas cluster is running
- [ ] All required environment variables are set
- [ ] `BETTER_AUTH_SECRET` is strong and unique (32+ characters)
- [ ] OAuth redirect URIs are configured correctly
- [ ] Custom domain (if using) is properly configured
- [ ] Database indexes are created (auto via Prisma)
- [ ] Test user registration and login
- [ ] Test OAuth flows (Google, GitHub)
- [ ] Test core features (analyze, save, history)
- [ ] Monitor logs for errors after deployment
- [ ] Set up MongoDB Atlas alerts
- [ ] Review Vercel Analytics

## Deployment Architecture

```
┌─────────────────┐
│   Vercel Edge   │
│    (Global)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   Next.js App   │────▶│  MongoDB Atlas   │
│   (Serverless)  │     │   (Database)     │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  OpenRouter AI  │
│   (AI Models)   │
└─────────────────┘
```

## Cost Estimation

### Vercel (Hobby Plan - Free)
- **Bandwidth:** 100 GB/month
- **Serverless Functions:** 100 GB-hours
- **Build minutes:** 6,000 minutes/month
- **Deployments:** Unlimited

**Upgrade to Pro ($20/month) when:**
- Need custom domains
- Exceed free tier limits
- Want team collaboration
- Need advanced analytics

### MongoDB Atlas (M0 Free Tier)
- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** 500 max
- **Suitable for:** Up to ~500 users

**Upgrade to M10 ($0.08/hour = ~$57/month) when:**
- Need more storage (2-5 GB)
- Need dedicated resources
- Want automatic backups
- Reach connection limits

### OpenRouter (Pay-as-you-go)
- **DeepSeek R1:** ~$0.55/1M tokens
- **GPT-4 Turbo:** ~$10/1M tokens
- **Budget:** ~$50-200/month for moderate usage

## Continuous Deployment

Every push to your main branch will automatically deploy to production:

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Vercel auto-deploys:**
   - Builds your app
   - Runs tests (if configured)
   - Deploys to production

3. **Preview deployments:**
   - Every pull request gets a preview deployment
   - Test changes before merging

## Next Steps

After successful deployment:
1. ✅ App is live on Vercel
2. ✅ Database is connected and working
3. ✅ Authentication is functional
4. 🎯 Monitor usage and performance
5. 🚀 Share with users and gather feedback

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas/support)
- [Better-Auth Docs](https://www.better-auth.com/docs)

## Rolling Back

If you need to rollback to a previous version:

1. Go to Vercel dashboard > Deployments
2. Find the previous working deployment
3. Click the three dots menu
4. Select "Promote to Production"

---

**Congratulations!** 🎉 Your OfferAnalyst app is now live on Vercel with MongoDB backend!
