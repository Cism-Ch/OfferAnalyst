# 📋 OfferAnalyst - Complete Implementation Plan 2026

**Document Version:** 1.0  
**Created:** January 2026  
**Status:** 🟢 Active Development Roadmap

---

## 🎯 Executive Summary

This document consolidates all planned features, technical debt, and TODOs identified across the codebase and documentation. It serves as the master implementation guide for completing OfferAnalyst development.

**Current Status:**
- ✅ Core MVP features operational
- ✅ Deployment configuration fixed
- 🟡 Authentication partially complete
- 🟡 Advanced features in progress
- 🔴 Premium features planned

---

## 🚨 Priority 0: Critical Fixes (IMMEDIATE)

### Deployment Issues ✅ COMPLETED
- [x] **Fix vercel.json secret references**
  - **Issue:** Environment variables referenced non-existent secrets
  - **Solution:** Removed `@secret_name` syntax, use Vercel dashboard instead
  - **Files:** `vercel.json`, `docs/DEPLOYMENT.md`, `QUICKSTART.md`, `README.md`
  - **Status:** ✅ Fixed and documented

---

## 🔴 Priority 1: High Priority Features (Next 2-4 Weeks)

### 1.1 Authentication Completion

#### Email Verification Flow
**File:** `src/app/auth/verify/page.tsx`  
**Current State:** UI exists, API integration missing  
**TODOs:**
- [ ] Implement `/api/auth/verify-email` endpoint
- [ ] Add email token generation and storage (MongoDB)
- [ ] Integrate with Resend for email delivery
- [ ] Implement resend verification email functionality
- [ ] Add token expiration logic (24h recommended)
- [ ] Handle already-verified users gracefully

**Implementation Notes:**
```typescript
// Example structure
POST /api/auth/verify-email
Body: { token: string }
Response: { success: boolean, message: string }

// Token storage in MongoDB
interface VerificationToken {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
```

#### Password Reset Flow
**File:** `src/app/auth/reset/page.tsx`  
**Current State:** UI exists, backend missing  
**TODOs:**
- [ ] Implement `/api/auth/reset-password` endpoint
- [ ] Generate secure reset tokens
- [ ] Send reset emails via Resend
- [ ] Create password update endpoint
- [ ] Add rate limiting (prevent spam)
- [ ] Implement token expiration (1h recommended)

**Dependencies:**
- Resend API key configuration
- MongoDB schema for reset tokens
- Email templates

### 1.2 Agent Modernization (High Impact)

#### Fetch Agent V1 Improvements
**File:** `src/app/actions/fetch.ts`  
**References:** `docs/FETCH_AGENT_IMPROVEMENT.md`, `docs/AGENT_OPTIMIZATION_PLAN.md`

**Issues:**
1. Manual JSON parsing with regex (fragile)
2. No schema validation
3. Mock data fallbacks (misleading users)
4. Limited error handling

**Implementation Plan:**
- [ ] **Phase 1: Parsing Reliability**
  - [ ] Migrate to `parseJSONFromText` from `agent-utils.ts`
  - [ ] Test with various AI response formats
  - [ ] Remove manual string manipulation
  
- [ ] **Phase 2: Validation**
  - [ ] Create `OfferSchema` with Zod
  - [ ] Integrate `validateWithZod` helper
  - [ ] Validate each offer before returning
  
- [ ] **Phase 3: Error Handling**
  - [ ] Remove mock data fallbacks (`mock-1`, `mock-2`)
  - [ ] Implement `retryWithBackoff` for transient failures
  - [ ] Return typed `AgentError` on failure
  
- [ ] **Phase 4: Optimization**
  - [ ] Support dynamic result limits
  - [ ] Improve system instructions for better data quality
  - [ ] Add source URL validation

**Success Metrics:**
- 95%+ success rate for JSON parsing
- Zero mock data fallbacks
- Proper error propagation to UI

#### Fetch Agent V2 Caching
**File:** `src/app/actions/fetchV2.ts`  
**TODOs:** Lines 64, 165, 185

**Implementation:**
- [ ] Design caching strategy
  - Key: `${domain}:${context}` hash
  - TTL: 1 hour (3600 seconds)
  - Storage: Redis (optional) or in-memory Map
  
- [ ] Implement cache functions:
  ```typescript
  async function getCachedOffers(domain: string, context: string): Promise<Offer[] | null>
  async function cacheOffers(domain: string, context: string, offers: Offer[], ttl: number): Promise<void>
  async function invalidateCache(pattern: string): Promise<void>
  ```

- [ ] Add cache hit/miss tracking
- [ ] Implement cache warming for popular queries
- [ ] Add cache invalidation on demand

**Benefits:**
- Reduced AI API costs
- Faster response times
- Lower rate limit impact

### 1.3 Analysis & Organization Features

#### Analyze V2 Enhancements
**File:** `src/app/actions/analyzeV2.ts`  
**TODOs:** Lines 211-218

**Features to Implement:**
- [ ] **MongoDB Storage** (Line 211-214)
  - [ ] Create `AnalysisResult` schema in Prisma
  - [ ] Store results with user association
  - [ ] Add timestamps and metadata
  - [ ] Implement result retrieval by ID
  - [ ] Add pagination for history

- [ ] **Webhook Notifications** (Line 216-218)
  - [ ] Accept webhook URL in request
  - [ ] Send POST request on completion
  - [ ] Include result summary in payload
  - [ ] Implement retry logic for failed webhooks
  - [ ] Add webhook security (HMAC signatures)

**Schema Example:**
```prisma
model AnalysisResult {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  domain      String
  criteria    String
  results     Json
  modelUsed   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId, createdAt])
}
```

#### Organize V2 Export Functions
**File:** `src/app/actions/organizeV2.ts`  
**TODOs:** Lines 242-257

**Export Formats:**
- [ ] **CSV Export** (Line 244)
  - [ ] Flatten organized data structure
  - [ ] Generate CSV with proper escaping
  - [ ] Support custom column selection
  - [ ] Add headers and metadata

- [ ] **PDF Export** (Line 246)
  - [ ] Use library like `pdfkit` or `jsPDF`
  - [ ] Create professional layout
  - [ ] Include charts/visualizations (optional)
  - [ ] Support custom branding

- [ ] **JSON Export** (existing, ensure completeness)
  - [ ] Full data structure
  - [ ] Minified option
  - [ ] Pretty-print option

**Implementation Notes:**
```typescript
function convertToCSV(data: OrganizedOffersV2): string {
  // Flatten nested structure
  // Escape special characters
  // Return CSV string
}

async function generatePDF(data: OrganizedOffersV2): Promise<Buffer> {
  // Create PDF document
  // Add header, content, footer
  // Return PDF buffer
}
```

### 1.4 Workflow Orchestration

#### Progress Storage & Retrieval
**File:** `src/app/actions/workflow/orchestrator.ts`  
**TODO:** Line 258-260

**Implementation:**
- [ ] **Progress Storage**
  - [ ] Create `WorkflowProgress` schema in MongoDB
  - [ ] Store state transitions
  - [ ] Track timing and performance
  - [ ] Handle concurrent workflows per user

- [ ] **Progress Retrieval**
  - [ ] Implement `getWorkflowProgress(workflowId)` function
  - [ ] Support polling for updates
  - [ ] Consider WebSocket for real-time updates (future)

**Schema:**
```prisma
model WorkflowProgress {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  workflowId    String   @unique
  userId        String   @db.ObjectId
  state         String   // pending, fetching, analyzing, organizing, complete, error
  progress      Int      // 0-100
  currentStep   String
  error         String?
  result        Json?
  startedAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  completedAt   DateTime?
  
  user          User     @relation(fields: [userId], references: [id])
  @@index([userId, workflowId])
  @@index([state, updatedAt])
}
```

---

## 🟡 Priority 2: Medium Priority Features (4-8 Weeks)

### 2.1 Dashboard & UI Enhancements

#### Onboarding Profile Save
**File:** `src/app/onboarding/page.tsx`  
**TODO:** Line 68-70

**Implementation:**
- [ ] Create `/api/profile/onboarding` endpoint
- [ ] Save use case selection
- [ ] Store preferences (theme, default model, etc.)
- [ ] Mark onboarding as completed
- [ ] Redirect to dashboard with personalized setup

#### API Key Management
**File:** `src/app/dashboard/api-keys/page.tsx`  
**TODOs:** Lines 88-95

**Features:**
- [ ] **Toast Notifications** (Line 88-89)
  - [ ] Install toast library (e.g., `sonner`, `react-hot-toast`)
  - [ ] Add success/error toasts
  - [ ] Show on copy, create, delete actions

- [ ] **Delete API** (Line 94-95)
  - [ ] Create `/api/keys/delete` endpoint
  - [ ] Implement soft delete (mark as inactive)
  - [ ] Add confirmation dialog
  - [ ] Revoke key immediately

**Complete CRUD Operations:**
- [ ] Create: Generate secure keys, store hashed
- [ ] Read: List user's keys (masked)
- [ ] Update: Regenerate key
- [ ] Delete: Soft delete implementation

#### Admin Console Feature Flags
**File:** `src/app/admin/page.tsx`  
**TODO:** Line 68-69

**Implementation:**
- [ ] Create `/api/admin/feature-flags` endpoint
- [ ] Store flags in MongoDB
- [ ] Implement caching for flags (Redis/memory)
- [ ] Add flag evaluation middleware
- [ ] Support user-level and global flags

**Flags to Implement:**
```typescript
interface FeatureFlags {
  enableFetchV2: boolean;
  enableOrganizeV2: boolean;
  enableDualWorkflow: boolean;
  enableTigrisSearch: boolean;
  enableWebhooks: boolean;
  enableCaching: boolean;
}
```

### 2.2 Analytics Dashboard
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.3

**Page:** `/dashboard/analytics`

**Components to Build:**
- [ ] **KPI Cards**
  - Total searches
  - Results found
  - Average score
  - Saved offers count

- [ ] **Charts** (using Recharts)
  - [ ] Line chart: Searches over time
  - [ ] Pie chart: Top categories
  - [ ] Histogram: Score distribution
  - [ ] Bar chart: Model usage comparison

- [ ] **Filters**
  - Date range selector (7/30/90 days)
  - Domain filter
  - Model filter

- [ ] **Export**
  - CSV download
  - PDF report generation

### 2.3 Workspace Settings
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.4

**Page:** `/dashboard/workspace`

**Features:**
- [ ] Team members management (future phase)
- [ ] Workspace name and settings
- [ ] Default preferences
  - Theme selection
  - Language (i18n future)
  - Region settings
  - Default AI model

### 2.4 Support & Donations Page
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.5

**Page:** `/dashboard/support`

**Components:**
- [ ] "Buy me a coffee" integration
- [ ] BYOK instructions and FAQ
- [ ] Model recommendations table
- [ ] Provider limits reference
- [ ] Support contact form (optional)

---

## 🔵 Priority 3: Premium Features (8-12 Weeks)

### 3.1 Animation System
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 1.2

**Library:** Framer Motion (already installed)

**Components to Animate:**
- [ ] Page transitions (fade, slide)
- [ ] Card hover effects (lift, shadow)
- [ ] Button interactions (scale, ripple)
- [ ] Loading states (skeleton, spinner)
- [ ] Modal transitions (scale, fade)
- [ ] Success celebrations (confetti, checkmark)

**Create Reusable Presets:**
```typescript
// src/lib/motion-presets.ts
export const fadeIn = { ... };
export const slideUp = { ... };
export const scaleIn = { ... };
export const spring = { ... };
```

### 3.2 Theme System Extension
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 7.1

**Current:** 2 themes (Light, Dark)  
**Target:** 5+ premium themes

**Themes to Add:**
- [ ] Gold Luxury (enhance existing)
- [ ] Ocean Blue (data-viz friendly)
- [ ] Forest Green (eco-friendly)
- [ ] Sunset Orange (energetic)
- [ ] Midnight Purple (creative)

**Implementation:**
- [ ] Define color palettes in Tailwind config
- [ ] Create theme selector component
- [ ] Persist theme in DB + localStorage
- [ ] Support system preference detection
- [ ] Add theme preview thumbnails

### 3.3 Advanced Visualizations
**Charts beyond basic analytics:**

- [ ] Offer comparison matrix
- [ ] Heat maps for location-based offers
- [ ] Trend lines with predictions
- [ ] Interactive scatter plots (price vs score)
- [ ] Sankey diagrams for workflow visualization

**Libraries to Consider:**
- Recharts (current)
- D3.js (for custom charts)
- Chart.js (simpler alternative)

### 3.4 Project Workspaces
**Reference:** Existing `/projects` page

**Enhancements:**
- [ ] Multi-source aggregation
- [ ] Cross-project analytics
- [ ] Project templates
- [ ] Sharing and collaboration (future)
- [ ] Project export/import

---

## ⚪ Priority 4: Performance & Optimization (Ongoing)

### 4.1 Caching Strategy

**Layers:**
1. **Client-Side** (TanStack Query / SWR)
   - [ ] Install React Query
   - [ ] Cache API responses
   - [ ] Implement optimistic updates
   - [ ] Add cache invalidation

2. **Server-Side** (Redis or In-Memory)
   - [ ] Setup Redis (optional, for production)
   - [ ] Cache frequent queries
   - [ ] Implement cache warming
   - [ ] Add cache monitoring

3. **Edge Caching** (Vercel)
   - [ ] Configure ISR for static pages
   - [ ] Cache API routes with stale-while-revalidate
   - [ ] Optimize image caching

### 4.2 Database Optimization

**Prisma Schema Improvements:**
- [ ] Add missing indexes
- [ ] Optimize query patterns (prevent N+1)
- [ ] Implement connection pooling
- [ ] Add query performance monitoring

**Indexes to Add:**
```prisma
@@index([userId, createdAt])
@@index([status, updatedAt])
@@index([domain, category])
```

### 4.3 Background Jobs

**Use Case:** Long-running analyses

**Options:**
- [ ] BullMQ (Redis-based)
- [ ] Simple queue with MongoDB
- [ ] Vercel background functions (preview)

**Jobs to Implement:**
- [ ] Async offer fetching
- [ ] Batch analysis processing
- [ ] Scheduled cache warming
- [ ] Data cleanup tasks

---

## 🟢 Priority 5: Testing & Quality (Continuous)

### 5.1 Unit Tests

**Framework:** Jest + React Testing Library

**Areas to Cover:**
- [ ] Server actions (fetch, analyze, organize)
- [ ] Utility functions (agent-utils, parsers)
- [ ] React hooks (custom hooks)
- [ ] Validation schemas (Zod)

**Target:** 70%+ code coverage

### 5.2 Integration Tests

**Framework:** Playwright

**Critical Flows:**
- [ ] Authentication (signup, login, logout)
- [ ] Offer analysis workflow
- [ ] Saved offers management
- [ ] Settings updates

### 5.3 E2E Tests

**Scenarios:**
- [ ] Complete user journey (signup → analyze → save → compare)
- [ ] OAuth flows (Google, GitHub)
- [ ] Error handling and recovery
- [ ] Mobile responsiveness

### 5.4 Accessibility Testing

**Tools:**
- axe DevTools
- WAVE browser extension
- Lighthouse CI

**Checks:**
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] ARIA labels and roles

---

## 📝 Priority 6: Documentation (Ongoing)

### 6.1 Code Documentation

**Standards:**
- [ ] TSDoc comments for public APIs
- [ ] README for each major module
- [ ] Architecture decision records (ADRs)

### 6.2 API Documentation

**Tool:** OpenAPI/Swagger or Docusaurus

**Sections:**
- [ ] Authentication endpoints
- [ ] Server actions reference
- [ ] Webhook payloads
- [ ] Rate limits and quotas
- [ ] Error codes and handling

### 6.3 User Guides

**Topics:**
- [ ] Getting started tutorial
- [ ] Feature walkthroughs (with gifs)
- [ ] BYOK setup guide
- [ ] Troubleshooting common issues
- [ ] FAQ expansion

---

## 🔐 Priority 7: Security & Compliance

### 7.1 Security Enhancements

**Immediate:**
- [ ] API key encryption at rest
- [ ] Rate limiting per user/IP
- [ ] CSRF token validation
- [ ] Input sanitization (XSS prevention)

**Future:**
- [ ] 2FA/TOTP support
- [ ] Audit logging
- [ ] Security headers (CSP, HSTS)
- [ ] Dependency vulnerability scanning

### 7.2 Compliance

**Documents:**
- [x] Privacy Policy (exists, review)
- [x] Terms of Service (exists, review)
- [ ] GDPR Data Processing Agreement
- [ ] CCPA compliance statement

**Features:**
- [ ] User data export
- [ ] Account deletion (right to be forgotten)
- [ ] Cookie consent banner
- [ ] Data retention policies

---

## 📊 Success Metrics & KPIs

### Development Velocity
- Sprints: 2-week cycles
- Target: Complete 1 priority level per month

### Quality Metrics
- Code coverage: 70%+
- Lighthouse score: 90+
- Accessibility: WCAG 2.1 AA
- Performance: FCP < 2s, LCP < 2.5s

### User Metrics (Post-Launch)
- Monthly active users: 500+
- BYOK adoption: 30%+
- User satisfaction (NPS): 50+
- Uptime: 99.9%+

---

## 🗓️ Estimated Timeline

### Month 1 (Weeks 1-4): Foundation
- ✅ Week 1: Deployment fix, planning
- Week 2-3: Authentication completion, agent improvements
- Week 4: Workflow orchestration, progress tracking

### Month 2 (Weeks 5-8): Core Features
- Week 5-6: Dashboard enhancements, API keys, admin console
- Week 7-8: Analytics dashboard, workspace settings

### Month 3 (Weeks 9-12): Premium & Polish
- Week 9-10: Animation system, theme expansion
- Week 11-12: Performance optimization, caching

### Month 4+ (Ongoing): Quality & Growth
- Testing implementation
- Documentation completion
- User feedback iteration
- New feature requests

---

## 📞 Contact & Resources

**Documentation:**
- Main README: `/README.md`
- Deployment Guide: `/docs/DEPLOYMENT.md`
- MongoDB Setup: `/docs/MONGODB_SETUP.md`
- Premium Roadmap: `/docs/PREMIUM_ROADMAP_2026.md`

**External Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better-Auth Docs](https://www.better-auth.com/docs)

**Repository:**
- GitHub: https://github.com/Cism-Ch/OfferAnalyst
- Issues: [GitHub Issues](https://github.com/Cism-Ch/OfferAnalyst/issues)

---

## 📋 Appendix: TODO Summary

### Critical TODOs (Must Fix)
1. ✅ Deployment secret references (COMPLETED)
2. Email verification API implementation
3. Password reset flow implementation
4. Fetch agent modernization

### High Priority TODOs
5. FetchV2 caching implementation (3 instances)
6. AnalyzeV2 MongoDB storage and webhooks
7. OrganizeV2 export functions
8. Workflow progress storage

### Medium Priority TODOs
9. Onboarding profile save
10. API key management completion
11. Admin feature flag API
12. Toast notifications

### Future Enhancements
13. Advanced analytics dashboard
14. Premium theme system
15. Animation library
16. Testing infrastructure
17. Comprehensive documentation

---

**Document End** - Updated January 2026  
**Next Review:** February 2026  
**Owner:** OfferAnalyst Development Team
