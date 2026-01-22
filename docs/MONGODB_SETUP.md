# MongoDB Atlas Setup Guide for OfferAnalyst

This guide will help you set up MongoDB Atlas for OfferAnalyst and configure your database.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account or log in if you already have one
3. Create a new organization (or use existing)

## Step 2: Create a Database Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose deployment option:
   - **Shared (Free)** - M0 Free Tier (good for development)
   - **Dedicated** - For production (paid)
3. Select your cloud provider and region (choose closest to your Vercel region)
4. Name your cluster (e.g., `offeranalyst-cluster`)
5. Click **"Create Deployment"**

## Step 3: Configure Database Access

### Create Database User

1. In the **Security** section, click **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Enter:
   - Username: `offeranalyst` (or your preferred name)
   - Password: Generate a strong password and save it securely
5. Select **Built-in Role**: `Read and write to any database`
6. Click **"Add User"**

### Configure Network Access

1. In the **Security** section, click **Network Access**
2. Click **"Add IP Address"**
3. For development:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add your specific IP address
4. For production on Vercel:
   - Click **"Allow Access from Anywhere"** (Vercel uses dynamic IPs)
5. Click **"Confirm"**

## Step 4: Get Connection String

1. Go to **Database** → **Clusters**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select:
   - Driver: **Node.js**
   - Version: **6.8 or later**
5. Copy the connection string, it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Configure Environment Variables

### Local Development (.env.local)

1. Create or edit `.env.local` in your project root
2. Add the connection string (replace placeholders):

```env
# MongoDB Database URL
DATABASE_URL="mongodb+srv://offeranalyst:YOUR_PASSWORD@cluster.mongodb.net/offeranalyst?retryWrites=true&w=majority"

# Better-Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OpenRouter API Key (required)
OPENROUTER_API_KEY="sk-or-v1-your-key-here"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your actual database user password
- Replace `cluster` with your actual cluster name
- The database name `offeranalyst` will be created automatically
- Special characters in password must be URL-encoded (e.g., `@` becomes `%40`)

### Generate BETTER_AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `BETTER_AUTH_SECRET`.

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | Your MongoDB connection string |
| `BETTER_AUTH_SECRET` | Generated secret (32+ chars) |
| `BETTER_AUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `GOOGLE_CLIENT_ID` | (Optional) Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | (Optional) Your Google OAuth secret |
| `GITHUB_CLIENT_ID` | (Optional) Your GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | (Optional) Your GitHub OAuth secret |

4. Click **"Save"** for each variable

## Step 6: Initialize Database Schema

After configuring environment variables, run:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# Verify connection
npx prisma db pull
```

You should see output confirming the schema was pushed successfully.

## Step 7: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth/signup`
3. Try creating a test account
4. Check MongoDB Atlas dashboard to see the new user in the `users` collection

## Troubleshooting

### Connection Error: "Authentication failed"
- Verify username and password are correct
- Check that password is URL-encoded in connection string
- Ensure database user has correct permissions

### Connection Error: "IP not whitelisted"
- Check Network Access settings in MongoDB Atlas
- Add your current IP or allow access from anywhere

### Prisma Error: "Database provider not supported"
- Ensure `provider = "mongodb"` is set in `schema.prisma`
- Run `npm install prisma @prisma/client` to update dependencies

### Build Error on Vercel
- Verify all environment variables are set in Vercel
- Check that `DATABASE_URL` is accessible from Vercel's network
- Review build logs for specific error messages

## Security Best Practices

1. **Use strong passwords** for database users
2. **URL-encode special characters** in connection string
3. **Never commit** `.env.local` to version control
4. **Rotate secrets** regularly in production
5. **Use IP whitelisting** when possible (instead of 0.0.0.0/0)
6. **Enable MongoDB encryption at rest** in Atlas settings
7. **Set up alerts** for unusual database activity

## Cost Considerations

- **M0 Free Tier**: 512 MB storage, shared RAM, suitable for development
- **Upgrade path**: When you need more storage or performance
- **Monitoring**: Check Atlas monitoring to track usage
- **Backups**: Free tier includes basic backups, consider paid tier for production

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Next Steps

After completing this setup:
1. ✅ MongoDB is configured and accessible
2. ✅ Database schema is deployed
3. ✅ Authentication is ready to use
4. 🚀 Deploy to Vercel and test in production

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
