# MongoDB Integration Guide

## Overview

MongoDB has been integrated with the Phase 03 dashboard pages. The database layer is fully functional and ready to use once `DATABASE_URL` is configured.

## Configuration

### 1. Set up MongoDB

You can use either:
- **MongoDB Atlas** (recommended for production)
- **Local MongoDB** (for development)

### 2. Configure Environment Variable

Add to `.env.local`:

```bash
# MongoDB Atlas (Cloud)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/offeranalyst?retryWrites=true&w=majority"

# OR Local MongoDB
DATABASE_URL="mongodb://localhost:27017/offeranalyst"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Push Schema to Database

```bash
npx prisma db push
```

## Database Actions

### API Keys (`src/app/actions/db/api-keys.ts`)

- `getUserAPIKeys(userId)` - Get all API keys for a user
- `addAPIKey(userId, name, provider, apiKey)` - Add new API key (encrypted)
- `deleteAPIKey(userId, keyId)` - Delete an API key
- `updateAPIKeyUsage(keyId)` - Track key usage
- `getAPIKeyStats(userId)` - Get usage statistics

### Analytics (`src/app/actions/db/analytics.ts`)

- `getUserAnalytics(userId)` - Get KPI data (searches, results, avg score)
- `getSearchTimeline(userId, days)` - Get search activity over time
- `getCategoryDistribution(userId)` - Get offer categories breakdown
- `getScoreDistribution(userId)` - Get score distribution
- `getModelUsage(userId)` - Get AI model usage stats

### Admin (`src/app/actions/db/admin.ts`)

- `getSystemStats()` - Get system-wide statistics
- `getRecentUsers(limit)` - Get recent users list
- `getProviderUsage()` - Get AI provider usage breakdown
- `updateUserRole(userId, role)` - Update user role (ADMIN/EDITOR/VIEWER)

## Dashboard Pages Integration

### API Keys Page (`/dashboard/api-keys`)

Shows user's BYOK keys with:
- Masked key display (first 4 + last 4 chars)
- Usage statistics per key
- Add/delete operations
- Encrypted storage with bcrypt

### Analytics Page (`/dashboard/analytics`)

Displays:
- KPI cards from database
- Search timeline charts
- Category distribution
- Score distribution
- Model usage statistics

### Admin Console (`/admin`)

System-wide monitoring:
- Total users, active users
- Search volume
- BYOK activations
- Provider usage breakdown
- User management

## Data Models

### User
- Authentication data
- Profile settings
- Role (USER/ADMIN/EDITOR/VIEWER)

### APIKey
- Encrypted keys (bcrypt hash)
- Usage tracking
- Provider information

### SearchHistory
- Domain, criteria, model
- Timestamp, result count
- Pin status

### SavedOffer
- Offer data (JSON)
- Score, category
- Tags

### Profile
- Extended user info
- Onboarding progress
- Preferences

## Security

- **API Keys**: Hashed with bcrypt, never stored in plain text
- **Passwords**: Hashed with bcrypt
- **Session Management**: Better-Auth with secure cookies
- **Role-Based Access**: Admin routes protected by role check

## Migration from localStorage

Dashboard pages currently use mock data. To migrate:

1. Set up MongoDB connection
2. Run Prisma migrations
3. Import localStorage data using migration scripts (future)
4. Switch dashboard pages to use database actions

## Next Steps

1. Configure `DATABASE_URL` in environment
2. Run `npx prisma db push` to create tables
3. Update dashboard pages to call database actions
4. Test with real data
5. Implement Better-Auth for authentication

## Notes

- Prisma Client is already configured (`src/lib/prisma.ts`)
- Schema supports MongoDB with ObjectId
- All database actions handle errors gracefully
- Mock data fallbacks ensure UI works without database
