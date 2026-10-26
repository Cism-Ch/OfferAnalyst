# 🚀 TODO Quick Reference Guide

**Quick access to all TODOs found in the codebase**  
**Last Updated:** January 23, 2026  
**Total Remaining:** 14 TODOs (down from 16)

---

## ✅ Recently Completed (January 2026)

### 1. Deployment Configuration ✅ COMPLETED
- **Files:** `vercel.json`, documentation files
- **Issue:** Secret references causing deployment failure
- **Solution:** Removed `@secret_name` syntax, updated documentation
- **Status:** Merged and verified in production

### 2. API Key Management System ✅ COMPLETED (PR #28)
- **Files:** Multiple (see DEPLOYMENT_FIX_SUMMARY.md for full list)
- **Achievement:** Complete security overhaul with AES-256-GCM encryption
- **Features:** User-scoped storage, temporary storage for guests, BYOK support
- **Status:** Production ready, 0 security vulnerabilities

### 3. Toast Notifications ✅ COMPLETED
- **Integrated:** As part of API Key Management UI
- **Library:** Sonner toast library
- **Usage:** Copy/create/delete API key actions
- **Status:** Fully operational

---

## 🔴 Critical (Fix Immediately)

### 1. Fetch Agent Modernization
**Files:** `src/app/actions/fetch.ts`  
**Reference Doc:** `docs/FETCH_AGENT_IMPROVEMENT.md`, `docs/AGENT_OPTIMIZATION_PLAN.md`

**Problems:**
- Manual JSON parsing with regex (fragile)
- No schema validation (Zod)
- Mock data fallbacks (misleading users)
- Limited error handling

**Action Items:**
```typescript
// TODO: Migrate to parseJSONFromText from agent-utils.ts
// TODO: Add Zod schema validation for Offer[]
// TODO: Remove mock-1 and mock-2 fallbacks
// TODO: Implement retryWithBackoff for failures
// TODO: Return typed AgentError on permanent failure
```

**Implementation Steps:**
1. Replace manual regex parsing with `parseJSONFromText`
2. Define `OfferSchema` with Zod
3. Use `validateWithZod` for each offer
4. Remove all mock data fallbacks
5. Integrate `retryWithBackoff` for transient failures
6. Return proper `AgentError` on permanent failure

**Estimated Effort:** 4-6 hours  
**Priority:** 🔴 CRITICAL  
**Impact:** High - Affects reliability of core feature

---

## 🟡 High Priority (Next Sprint)

### 2. FetchV2 Caching Layer
**File:** `src/app/actions/fetchV2.ts`  
**Lines:** 64, 165, 185

**TODOs:**
```typescript
// Line 64: TODO: Implement caching layer
// if (enableCaching) {
//     const cached = await getCachedOffers(domain, context);
//     if (cached) return cached;
// }

// Line 165: TODO: Cache results
// if (enableCaching) {
//     await cacheOffers(domain, context, validatedOffers, 3600); // 1h TTL
// }

// Line 185: TODO: implement caching
// cached: false
```

**Implementation Steps:**
1. Choose cache backend (Redis recommended, or in-memory Map for MVP)
2. Implement `getCachedOffers()` function
3. Implement `cacheOffers()` function with TTL
4. Add cache key generation (hash of domain + context)
5. Set TTL to 3600 seconds (1 hour)
6. Update return metadata with cache hit/miss status
7. Add cache invalidation mechanism

**Benefits:**
- Reduced AI API costs
- Faster response times (instant for cache hits)
- Lower rate limit impact

**Estimated Effort:** 3-4 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** Redis (optional) or in-memory storage

### 3. AnalyzeV2 MongoDB Storage
**File:** `src/app/actions/analyzeV2.ts`  
**Lines:** 211-214

**TODO:**
```typescript
// TODO: Store results to MongoDB
// if (storeResults) {
//     await storeAnalysisResults(profile, result, modelName);
// }
```

**Implementation Steps:**
1. Add `AnalysisResult` model to Prisma schema
2. Create `storeAnalysisResults()` function
3. Associate results with user ID (when authenticated)
4. Add timestamps and metadata (model used, criteria, domain)
5. Implement result retrieval endpoints
6. Add pagination for analysis history

**Schema Example:**
```prisma
model AnalysisResult {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String?  @db.ObjectId  // Optional for guests
  domain      String
  criteria    String
  results     Json
  modelUsed   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User?    @relation(fields: [userId], references: [id])
  @@index([userId, createdAt])
  @@index([createdAt])
}
```

**Estimated Effort:** 2-3 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** Prisma schema update, MongoDB

### 4. AnalyzeV2 Webhook Notifications
**File:** `src/app/actions/analyzeV2.ts`  
**Lines:** 216-218

**TODO:**
```typescript
// TODO: Send webhook notification
// if (webhookUrl) {
//     await sendWebhook(webhookUrl, { status: 'completed', result });
// }
```

**Implementation Steps:**
1. Accept `webhookUrl` parameter in action
2. Create `sendWebhook()` function
3. POST result summary on completion
4. Implement retry logic (exponential backoff, 3 retries)
5. Add HMAC signature for security (optional but recommended)
6. Log webhook delivery status

**Payload Example:**
```typescript
{
  status: 'completed',
  workflowId: string,
  timestamp: string,
  result: {
    topOffers: number,
    averageScore: number,
    domain: string
  }
}
```

**Estimated Effort:** 2-3 hours  
**Priority:** 🟡 HIGH  
**Use Case:** Notify external systems when analysis completes

### 5. OrganizeV2 Export Functions
**File:** `src/app/actions/organizeV2.ts`  
**Lines:** 242-257

**TODOs:**
```typescript
// Line 242: TODO: Export handling
// if (exportFormat === 'csv') {
//     return convertToCSV(result);
// } else if (exportFormat === 'pdf') {
//     return preparePDFData(result);
// }

// Line 255: TODO: Export functions
// function convertToCSV(data: OrganizedOffersV2): string { ... }
// function preparePDFData(data: OrganizedOffersV2): any { ... }
```

**Implementation Steps:**

**CSV Export:**
1. Flatten nested timeline/category structure
2. Escape special characters (quotes, commas, newlines)
3. Generate CSV headers
4. Add metadata row (export date, domain, etc.)
5. Support custom column selection (optional)

**PDF Export:**
1. Choose library: `pdfkit` (Node.js) or `jsPDF` (browser)
2. Create professional layout with headers/footers
3. Include charts/visualizations (optional, using Chart.js)
4. Support custom branding (logo, colors)
5. Return PDF buffer or download link

**Estimated Effort:** 4-5 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** CSV: none, PDF: pdfkit or jsPDF

### 6. Workflow Progress Storage
**File:** `src/app/actions/workflow/orchestrator.ts`  
**Lines:** 258-260

**TODO:**
```typescript
// TODO: Implement progress storage and retrieval
export async function getWorkflowProgress(_workflowId: string): Promise<WorkflowProgress | null> {
    // For now, return null
    return null;
}
```

**Implementation Steps:**
1. Create `WorkflowProgress` model in Prisma schema
2. Store state transitions in MongoDB (pending → fetching → analyzing → organizing → complete)
3. Implement `saveWorkflowProgress()` function
4. Implement `getWorkflowProgress()` function
5. Track timing and performance metrics
6. Handle concurrent workflows per user

**Schema Example:**
```prisma
model WorkflowProgress {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  workflowId    String   @unique
  userId        String?  @db.ObjectId
  state         String   // pending, fetching, analyzing, organizing, complete, error
  progress      Int      // 0-100
  currentStep   String
  error         String?
  result        Json?
  startedAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  completedAt   DateTime?
  
  user          User?    @relation(fields: [userId], references: [id])
  @@index([userId, workflowId])
  @@index([state, updatedAt])
}
```

**Use Cases:**
- Resume interrupted workflows
- Show progress to users in real-time
- Analytics on workflow performance

**Estimated Effort:** 3-4 hours  
**Priority:** 🟡 HIGH  
**Future:** Consider WebSocket for real-time updates

---

## 🟢 Medium Priority (This Month)

### 7. Email Verification Implementation
**File:** `src/app/auth/verify/page.tsx`  
**Lines:** 35-37, 64-66

**TODOs:**
```typescript
// Line 35: TODO: Implement email verification API call
const response = await fetch("/api/auth/verify-email", {
  method: "POST",
  body: JSON.stringify({ token })
});

// Line 64: TODO: Implement resend verification email
const handleResendEmail = async () => {
  console.log("Resending verification email...");
};
```

**Implementation Steps:**
1. Create `/api/auth/verify-email` endpoint
2. Generate and store verification tokens in MongoDB
3. Send emails via Resend API
4. Implement token expiration (24h recommended)
5. Add resend functionality with cooldown (5 min between resends)
6. Handle already-verified users gracefully

**Estimated Effort:** 4-5 hours  
**Priority:** 🟢 MEDIUM  
**Dependencies:** Resend API key, MongoDB token storage

### 8. Password Reset Implementation
**File:** `src/app/auth/reset/page.tsx`  
**Lines:** 32-34

**TODO:**
```typescript
// TODO: Implement password reset email sending
const response = await fetch("/api/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({ email })
});
```

**Implementation Steps:**
1. Create `/api/auth/reset-password` endpoint
2. Generate secure reset tokens (crypto.randomBytes)
3. Send reset emails via Resend
4. Create password update page (`/auth/reset/[token]`)
5. Add rate limiting (3 attempts per hour per email)
6. Token expiration (1h recommended)

**Estimated Effort:** 4-5 hours  
**Priority:** 🟢 MEDIUM  
**Dependencies:** Resend API key, rate limiting logic

### 9. Onboarding Profile Save
**File:** `src/app/onboarding/page.tsx`  
**Lines:** 68-70

**TODO:**
```typescript
// TODO: Save onboarding data to profile
await fetch("/api/profile/onboarding", {
  method: "POST",
  body: JSON.stringify(data)
});
```

**Implementation Steps:**
1. Create `/api/profile/onboarding` endpoint
2. Save use case selection to user profile
3. Store preferences (theme, default model, etc.)
4. Mark onboarding as completed (onboarded: true flag)
5. Redirect to personalized dashboard
6. Skip onboarding for returning users

**Estimated Effort:** 2-3 hours  
**Priority:** 🟢 MEDIUM  
**Impact:** Improves user experience and personalization

### 10. Admin Feature Flag API
**File:** `src/app/admin/page.tsx`  
**Lines:** 68-69

**TODO:**
```typescript
const toggleFeature = (feature: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
    // TODO: Call API to update feature flag
};
```

**Implementation Steps:**
1. Create `/api/admin/feature-flags` endpoint (GET, POST)
2. Store flags in MongoDB (FeatureFlag model)
3. Implement flag caching (Redis or in-memory, 5min TTL)
4. Add flag evaluation middleware
5. Support user-level and global flags
6. Admin UI for toggling flags

**Feature Flags to Support:**
```typescript
interface FeatureFlags {
  enableFetchV2: boolean;
  enableOrganizeV2: boolean;
  enableDualWorkflow: boolean;
  enableCaching: boolean;
  enableWebhooks: boolean;
  enableExports: boolean;
}
```

**Estimated Effort:** 3-4 hours  
**Priority:** 🟢 MEDIUM  
**Use Case:** Safe rollout of new features

---

## ⚪ Low Priority (Future Sprints)

### 11. Analytics Dashboard
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.3  
**Page:** `/dashboard/analytics`

**Components to Build:**
- **KPI Cards:** Total searches, results found, average score, saved offers count
- **Line Chart:** Searches over time (using Recharts)
- **Pie Chart:** Top categories distribution
- **Histogram:** Score distribution across offers
- **Bar Chart:** Model usage comparison

**Data Requirements:**
- Query MongoDB for user's analysis history
- Aggregate statistics by date range
- Support filters (7/30/90 days, domain, model)

**Estimated Effort:** 8-12 hours  
**Priority:** ⚪ LOW  
**Dependencies:** Analytics data collection, Recharts library

### 12. Workspace Settings
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.4  
**Page:** `/dashboard/workspace`

**Features:**
- Workspace name and description
- Default preferences (theme, language, model)
- Team management (future phase)
- Region settings
- Export/import workspace configuration

**Estimated Effort:** 6-8 hours  
**Priority:** ⚪ LOW

### 13. Premium Theme System
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 7.1

**Current:** 2 themes (Light, Dark)  
**Target:** 5+ premium themes

**Themes to Add:**
- Ocean Blue (data-viz friendly)
- Forest Green (eco-friendly)
- Sunset Orange (energetic)
- Midnight Purple (creative)

**Implementation:**
- Define color palettes in Tailwind config
- Create theme selector component
- Persist theme choice in DB + localStorage
- Add theme preview thumbnails

**Estimated Effort:** 4-6 hours  
**Priority:** ⚪ LOW

### 14. Animation Library
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 1.2

**Library:** Framer Motion (already installed)

**Components to Animate:**
- Page transitions (fade, slide)
- Card hover effects (lift, shadow)
- Button interactions (scale, ripple)
- Loading states (skeleton, spinner)
- Modal transitions (scale, fade)

**Create Reusable Presets:**
```typescript
// src/lib/motion-presets.ts
export const fadeIn = { ... };
export const slideUp = { ... };
export const scaleIn = { ... };
```

**Estimated Effort:** 6-8 hours  
**Priority:** ⚪ LOW

---

## 📊 Summary by Priority

| Priority | Count | Total Effort (hours) | Status |
|----------|-------|---------------------|---------|
| ✅ Completed | 3 | ~20 (achieved) | Done in Jan 2026 |
| 🔴 Critical | 1 | 4-6 | Immediate |
| 🟡 High | 5 | 14-19 | Sprint 1-2 |
| 🟢 Medium | 4 | 13-18 | Sprint 2-3 |
| ⚪ Low | 4 | 24-34 | Future |
| **REMAINING** | **14** | **55-77** | **~3 weeks** |

**Progress Since Last Update:**
- ✅ 3 TODOs completed (Deployment, API Keys, Toast notifications)
- 🎯 14 TODOs remaining (down from 16)
- ⏱️ ~20 hours of work completed in January 2026
- 📉 Reduced remaining effort from 59-82 hours to 55-77 hours

**Estimated Completion Timeline:**
- Critical: 1 day (4-6 hours)
- High Priority: 3-4 days (14-19 hours)
- Medium Priority: 3-4 days (13-18 hours)  
- Low Priority: 5-7 days (24-34 hours)
- **Total: ~2.5-3 weeks** (single developer, focused work)

---

## 🎯 Recommended Sprint Planning

### Sprint 1 (Week 1-2): Critical & High Priority Agent Work
**Focus:** Core AI functionality reliability and performance

- 🔴 **Fetch agent modernization** (4-6 hours)
  - Remove manual JSON parsing
  - Add Zod validation
  - Implement retry logic
  - Remove mock fallbacks

- 🟡 **FetchV2 caching** (3-4 hours)
  - Implement cache layer
  - Add TTL management
  - Track cache hit/miss

- 🟡 **Workflow progress storage** (3-4 hours)
  - MongoDB schema
  - State tracking
  - Progress retrieval

**Total Effort:** 10-14 hours  
**Goal:** Reliable AI operations with improved performance

### Sprint 2 (Week 3-4): AI Features & Data Management
**Focus:** Persistent storage and advanced AI capabilities

- 🟡 **AnalyzeV2 storage** (2-3 hours)
  - MongoDB integration
  - Result persistence

- 🟡 **AnalyzeV2 webhooks** (2-3 hours)
  - Webhook delivery
  - Retry logic

- 🟡 **OrganizeV2 exports** (4-5 hours)
  - CSV export
  - PDF export

**Total Effort:** 8-11 hours  
**Goal:** Complete data management and export capabilities

### Sprint 3 (Week 5-6): Authentication & User Experience
**Focus:** User account features and onboarding

- 🟢 **Email verification** (4-5 hours)
  - API endpoint
  - Resend integration
  - Token management

- 🟢 **Password reset** (4-5 hours)
  - Reset flow
  - Email sending
  - Rate limiting

- 🟢 **Onboarding save** (2-3 hours)
  - Profile persistence
  - Personalization

**Total Effort:** 10-13 hours  
**Goal:** Complete authentication flow

### Sprint 4+ (Week 7+): Polish & Premium Features
**Focus:** Admin tools and premium enhancements

- 🟢 **Admin feature flags** (3-4 hours)
- ⚪ **Analytics dashboard** (8-12 hours)
- ⚪ **Premium themes** (4-6 hours)
- ⚪ **Animation system** (6-8 hours)
- ⚪ **Workspace settings** (6-8 hours)

**Total Effort:** 27-38 hours  
**Goal:** Polish and premium features

---

## 📝 Notes for Developers

### Before Starting a TODO:
1. Read the full context in related files
2. Check for dependencies (APIs, libraries, secrets)
3. Update the TODO comment with your name and date
4. Write tests alongside implementation
5. Update documentation when complete

### Code Quality Checklist:
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Validation with Zod where applicable
- [ ] Tests written (unit + integration)
- [ ] Documentation updated
- [ ] TODO comment removed

### Common Patterns:
- **Server Actions:** Use `agent-utils.ts` helpers (parseJSONFromText, validateWithZod, retryWithBackoff)
- **Error Handling:** Return `AgentActionResult<T>` discriminated union
- **Validation:** Define Zod schemas, use `validateWithZod`
- **Caching:** Use consistent key format, set appropriate TTL
- **MongoDB:** Use Prisma, add proper indexes, handle ObjectId

---

**Document Last Updated:** January 23, 2026  
**Status:** Active - 14 TODOs remaining  
**Recent Changes:** Added completed section, updated priorities, revised effort estimates  
**For Full Details:** See `/docs/IMPLEMENTATION_PLAN_2026.md`
