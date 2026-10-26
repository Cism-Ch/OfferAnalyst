# Phase 10: Deployment & Scalability Guide

This document provides comprehensive guidance for deploying and scaling OfferAnalyst in production.

---

## 10.1 Infrastructure Setup

### Hosting: Vercel (Recommended)

#### Why Vercel?
- Native Next.js support with zero configuration
- Automatic preview deployments for PRs
- Global CDN with edge functions
- Built-in SSL certificates
- Serverless functions scaling

#### Setup Instructions

1. **Create Vercel Account**
   - Visit https://vercel.com/signup
   - Sign up with GitHub for seamless integration

2. **Import Project**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project root
   vercel
   ```

3. **Configure Environment Variables**
   Go to Project Settings → Environment Variables and add:
   ```
   OPENROUTER_API_KEY=<your-api-key>
   DATABASE_URL=<mongodb-connection-string>
   BETTER_AUTH_SECRET=<random-32-char-string>
   BETTER_AUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   
   # Optional OAuth
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GITHUB_CLIENT_ID=<your-github-client-id>
   GITHUB_CLIENT_SECRET=<your-github-client-secret>
   
   # Optional Email
   RESEND_API_KEY=<your-resend-api-key>
   
   # Optional File Storage
   TIGRIS_BUCKET_NAME=<your-bucket-name>
   TIGRIS_STORAGE_ENDPOINT=https://t3.storage.dev
   TIGRIS_STORAGE_ACCESS_KEY_ID=<your-access-key>
   TIGRIS_STORAGE_SECRET_ACCESS_KEY=<your-secret-key>
   ```

4. **Set Up Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

---

### Database: MongoDB Atlas

#### Why MongoDB Atlas?
- Fully managed MongoDB in the cloud
- Free tier (M0) for development
- Automatic backups and monitoring
- Global deployment options
- Built-in security features

#### Setup Instructions

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create a Cluster**
   - Choose M0 (Free tier) for development
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., "offeranalyst-prod")

3. **Configure Security**
   - **Database Access**: Create a database user
     - Username: `offeranalyst_user`
     - Password: Generate secure password
     - Built-in Role: `readWrite` on `offeranalyst` database
   
   - **Network Access**: Whitelist IP addresses
     - For Vercel: Add `0.0.0.0/0` (all IPs)
     - For local dev: Add your IP address

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<database>` with `offeranalyst`
   ```
   mongodb+srv://offeranalyst_user:<password>@cluster.mongodb.net/offeranalyst?retryWrites=true&w=majority
   ```

5. **Initialize Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database (for first time)
   npx prisma db push
   ```

---

### CDN: Cloudflare (Optional)

#### Why Cloudflare?
- Global CDN with 300+ data centers
- DDoS protection
- Web Application Firewall (WAF)
- Free tier available
- Analytics and insights

#### Setup Instructions

1. **Add Site to Cloudflare**
   - Visit https://dash.cloudflare.com
   - Add your domain
   - Update nameservers at your domain registrar

2. **Configure DNS**
   - Add A/AAAA records pointing to Vercel
   - Or add CNAME record: `your-domain.vercel.app`

3. **Enable Features**
   - SSL/TLS: "Full (strict)" mode
   - Auto Minify: Enable HTML, CSS, JS
   - Brotli: Enable
   - Caching: Set up page rules

4. **Page Rules (Optional)**
   ```
   *your-domain.com/api/*
   - Cache Level: Bypass
   
   *your-domain.com/_next/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

---

### File Storage: Tigris (S3-Compatible)

#### Why Tigris?
- S3-compatible object storage
- Global edge caching
- Pay-as-you-go pricing
- Native Vercel integration
- Zero egress fees

#### Setup Instructions

1. **Create Tigris Account**
   - Visit https://www.tigrisdata.com
   - Sign up and verify email

2. **Create Bucket**
   ```bash
   # Install Tigris CLI
   npm install -g @tigrisdata/cli
   
   # Login
   tigris login
   
   # Create bucket
   tigris create bucket offeranalyst-uploads
   ```

3. **Get Credentials**
   - Go to Dashboard → Access Keys
   - Create new access key
   - Copy Access Key ID and Secret Access Key

4. **Configure in Vercel**
   Add to environment variables:
   ```
   TIGRIS_BUCKET_NAME=offeranalyst-uploads
   TIGRIS_STORAGE_ENDPOINT=https://t3.storage.dev
   TIGRIS_STORAGE_ACCESS_KEY_ID=<your-access-key>
   TIGRIS_STORAGE_SECRET_ACCESS_KEY=<your-secret>
   ENABLE_TIGRIS_SEARCH=true
   ```

---

### Email Service: Resend

#### Why Resend?
- Developer-friendly email API
- Free tier: 100 emails/day
- Built-in template support
- Email verification and transactional emails
- React Email integration

#### Setup Instructions

1. **Create Resend Account**
   - Visit https://resend.com/signup
   - Verify your email

2. **Create API Key**
   - Go to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Verify Domain (Optional)**
   - Go to Domains
   - Add your domain
   - Add DNS records (SPF, DKIM)

4. **Configure in Vercel**
   ```
   RESEND_API_KEY=re_your_api_key
   ```

---

## 10.2 CI/CD Pipeline

### GitHub Actions Workflow

The project includes a complete CI/CD pipeline in `.github/workflows/ci-cd.yml`:

#### Pipeline Stages

1. **Lint**: ESLint code quality checks
2. **Type Check**: TypeScript compilation verification
3. **Build**: Production build with Next.js
4. **Deploy Preview**: Automatic preview deployment for PRs
5. **Deploy Production**: Automatic production deployment on merge to main

#### Required GitHub Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

```
# Vercel Deployment
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>

# OpenRouter API (optional, for build)
OPENROUTER_API_KEY=<your-api-key>
```

#### How to Get Vercel Tokens

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Get token
vercel whoami
# Then go to https://vercel.com/account/tokens
```

---

## 10.3 Database Optimization

### Prisma Indexes

The schema already includes optimized indexes:

```prisma
// User lookups
@@index([email])
@@index([createdAt])

// Search history
@@index([userId])
@@index([timestamp])
@@index([isPinned])

// Saved offers
@@index([userId])
@@index([savedAt])
@@index([score])

// Projects
@@index([userId])
@@index([createdAt])

// Credits tracking
@@index([userId])
@@index([createdAt])
@@index([action])
```

### Query Optimization Best Practices

1. **Select Only Needed Fields**
   ```typescript
   // ❌ Bad: Fetches all fields
   const user = await prisma.user.findUnique({
     where: { id: userId }
   });
   
   // ✅ Good: Fetches only needed fields
   const user = await prisma.user.findUnique({
     where: { id: userId },
     select: { id: true, email: true, name: true }
   });
   ```

2. **Avoid N+1 Queries**
   ```typescript
   // ❌ Bad: N+1 query
   const users = await prisma.user.findMany();
   for (const user of users) {
     const offers = await prisma.savedOffer.findMany({
       where: { userId: user.id }
     });
   }
   
   // ✅ Good: Single query with include
   const users = await prisma.user.findMany({
     include: {
       savedOffers: true
     }
   });
   ```

3. **Use Pagination**
   ```typescript
   const offers = await prisma.savedOffer.findMany({
     where: { userId },
     take: 20,
     skip: page * 20,
     orderBy: { savedAt: 'desc' }
   });
   ```

### Connection Pooling

MongoDB connection string should include:
```
mongodb+srv://...?retryWrites=true&w=majority&maxPoolSize=10
```

For Vercel serverless:
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

---

## 10.4 Caching Strategy

### HTTP Caching

#### Next.js Static Pages
```typescript
// app/about/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default function AboutPage() {
  return <div>About content</div>;
}
```

#### API Routes
```typescript
// app/api/stats/route.ts
export async function GET() {
  const data = await getStats();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

### Redis Caching (Optional)

For high-traffic deployments, add Redis:

1. **Install Redis Client**
   ```bash
   npm install ioredis
   ```

2. **Configure Redis**
   ```typescript
   // lib/redis.ts
   import Redis from 'ioredis';
   
   export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
   ```

3. **Cache Server Actions**
   ```typescript
   import { redis } from '@/lib/redis';
   
   export async function getOffers(domain: string) {
     // Check cache
     const cached = await redis.get(`offers:${domain}`);
     if (cached) return JSON.parse(cached);
     
     // Fetch fresh data
     const offers = await fetchOffersFromAPI(domain);
     
     // Cache for 1 hour
     await redis.setex(`offers:${domain}`, 3600, JSON.stringify(offers));
     
     return offers;
   }
   ```

### Client-Side Caching

Using localStorage (already implemented):
```typescript
// hooks/use-dashboard-state.ts
const savedState = localStorage.getItem('dashboardState');
if (savedState) {
  return JSON.parse(savedState);
}
```

For more advanced caching, consider TanStack Query:
```bash
npm install @tanstack/react-query
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured in Vercel
- [ ] Database schema pushed to MongoDB
- [ ] OAuth providers configured (Google, GitHub)
- [ ] Custom domain configured (if applicable)
- [ ] Email service configured (Resend)
- [ ] File storage configured (Tigris)

### Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test authentication flows
- [ ] Test API endpoints
- [ ] Check database connections
- [ ] Monitor error logs in Vercel
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy

### Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Database monitoring in MongoDB Atlas
- [ ] Set up alerts for critical issues

---

## Performance Targets

- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

Monitor these with the Web Vitals tracking implemented in Phase 9.

---

## Scaling Considerations

### Horizontal Scaling
- Vercel automatically scales serverless functions
- MongoDB Atlas auto-scales with cluster tier
- Cloudflare CDN handles traffic spikes

### Database Scaling
- Start with M0 (Free tier) for development
- Upgrade to M2/M5 for production traffic
- Enable sharding for 10M+ documents

### Cost Optimization
- Use ISR (Incremental Static Regeneration) for cacheable pages
- Optimize image sizes with Next.js Image component
- Monitor API usage and implement rate limiting
- Use edge functions for global performance

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Cloudflare Docs**: https://developers.cloudflare.com/

---

*Last updated: January 2026*
*Status: Production Ready ✅*
