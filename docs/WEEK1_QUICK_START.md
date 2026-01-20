# Quick Start: Key Decisions & Setup Checklist

**Purpose**: First steps to begin the OfferAnalyst transformation  
**Timeline**: Week 1 Actions  
**Owner**: Cloud Architect + Tech Leads

---

## ⚡ Critical Decisions (Must Be Made This Week)

### Decision 1: MongoDB Hosting
- **Option A**: MongoDB Atlas (Managed, Recommended)
  - Pros: Managed backups, auto-scaling, free tier available
  - Cons: Vendor lock-in, pricing
  - **Recommendation**: ✅ **CHOOSE THIS** for production
  - **Action**: Create MongoDB Atlas account, setup Project

- **Option B**: Self-hosted MongoDB
  - Pros: Full control, no vendor lock-in
  - Cons: Maintenance burden, ops overhead
  - **Recommendation**: ❌ Not for MVP, maybe later for cost optimization

**Decision**: ✅ **MongoDB Atlas Pro Tier** ($57/month)

```bash
# Week 1 Action (DevOps):
# 1. Go to https://www.mongodb.com/products/platform/atlas
# 2. Create Organization "OfferAnalyst"
# 3. Create Project "prod"
# 4. Deploy M2 Cluster (free tier for dev, M10 for prod)
# 5. Enable backup (daily snapshots)
# 6. Create database user: offeranalyst / [secure-password]
# 7. Whitelist IP ranges (0.0.0.0/0 for dev, specific for prod)
# 8. Export connection string
```

### Decision 2: Search & Indexing Strategy
- **Option A**: Tigris Cloud (Recommended)
  - Pros: Purpose-built for search, fast, simple
  - Cons: Younger product, smaller ecosystem
  - **Recommendation**: ✅ **CHOOSE THIS** for specialized search

- **Option B**: Elasticsearch
  - Pros: Mature, powerful
  - Cons: Infrastructure overhead, cost
  - **Recommendation**: ❌ Overkill for our scale

- **Option C**: MongoDB Atlas Search
  - Pros: Integrated with MongoDB
  - Cons: Limited faceting, slower iteration
  - **Recommendation**: ⚠️ Could work, but Tigris better

**Decision**: ✅ **Tigris Cloud** ($25/month)

```bash
# Week 1 Action (Backend):
# 1. Go to https://www.tigrisdata.com
# 2. Create account & project
# 3. Setup API key
# 4. Plan indexes: offers, searches, projects
# 5. Configure sync from MongoDB
```

### Decision 3: Frontend State Management
- **Option A**: React Query + Server State (Recommended)
  - Pros: Automatic sync, built for server-state, modern
  - Cons: Learning curve
  - **Recommendation**: ✅ **CHOOSE THIS**

- **Option B**: Redux Toolkit
  - Pros: Familiar to team
  - Cons: Overkill, requires more boilerplate
  - **Recommendation**: ❌ Don't use for this

- **Option C**: Zustand
  - Pros: Simple
  - Cons: Not designed for server-state
  - **Recommendation**: ❌ Not suitable

**Decision**: ✅ **React Query** (TanStack Query v5)

```bash
# Week 2 Action (Frontend):
# pnpm add @tanstack/react-query @tanstack/react-query-devtools
# pnpm add -D @testing-library/react-query  # for tests
```

### Decision 4: API Design Pattern
- **Option A**: RESTful APIs (Recommended)
  - Pros: Standard, cacheable, simple
  - Cons: Can be verbose for complex operations
  - **Recommendation**: ✅ **CHOOSE THIS**

- **Option B**: GraphQL
  - Pros: Flexible queries
  - Cons: Overkill for MVP, ops overhead
  - **Recommendation**: ❌ Too complex for stage

**Decision**: ✅ **RESTful with OpenAPI 3.0 Docs**

### Decision 5: Real-time Synchronization
- **Option A**: Event-driven with Redis Pub/Sub
  - Pros: Scalable, industry standard
  - Cons: Infrastructure overhead
  - **Recommendation**: 🟠 Phase 3 (not MVP)

- **Option B**: Database Polling
  - Pros: Simple, no infra
  - Cons: Latency, scalability issues
  - **Recommendation**: 🟡 Phase 2 interim solution

- **Option C**: WebSockets
  - Pros: Low latency
  - Cons: Connection management, horizontal scaling harder
  - **Recommendation**: ⚠️ Use BroadcastChannel for MVP

**Decision**: ✅ **Phase 2: Polling + React Query** → **Phase 3: Event Bus**

```
MVP (Week 5-9):
  React Query auto-invalidation + manual refetch
  ├─ 5-min stale time
  └─ Manual refresh button

Phase 3 (Week 10-14):
  Event-driven sync
  ├─ MongoDB Change Streams
  ├─ Redis Pub/Sub
  └─ Real-time invalidation
```

---

## 📋 Week 1 Setup Checklist

### ✅ Infrastructure Provisioning (DevOps Engineer)

```
[ ] MongoDB Atlas
    [ ] Account created
    [ ] M2 cluster deployed
    [ ] Daily backups enabled
    [ ] Connection string exported
    [ ] Environment variable set: MONGODB_URI
    
[ ] Tigris
    [ ] Account created
    [ ] API key generated
    [ ] Environment variable set: TIGRIS_API_KEY
    
[ ] GitHub Repository
    [ ] Branch protection enabled (main)
    [ ] Required checks configured
    [ ] Environment secrets added:
        - MONGODB_URI
        - TIGRIS_API_KEY
        - OPENROUTER_API_KEY (existing)
    
[ ] CI/CD Pipeline Skeleton
    [ ] .github/workflows/ci.yml created (basic lint + build)
    [ ] .github/workflows/deploy.yml created (Vercel)
```

**Duration**: 8 hours  
**Owner**: DevOps Engineer

### ✅ Architecture Documentation (Cloud Architect)

```
[ ] docs/TECH_DECISIONS.md
    [ ] Why MongoDB (not PostgreSQL)
    [ ] Why Tigris (not Elasticsearch)
    [ ] Why React Query (not Redux)
    [ ] Why REST (not GraphQL)
    [ ] Cost analysis for each choice
    
[ ] docs/MONGODB_SCHEMAS.md
    [ ] Collections overview
    [ ] Field definitions
    [ ] Indexes strategy
    [ ] Example documents
    
[ ] docs/API_SPECIFICATION.md (stub)
    [ ] OpenAPI 3.0 template
    [ ] Base endpoint structure
    [ ] Authentication scheme
    
[ ] Architecture Diagram
    [ ] Client/Server/Database layers
    [ ] Data flow arrows
    [ ] Cache layer indication
    (Tool: Excalidraw or Miro)
```

**Duration**: 12 hours  
**Owner**: Cloud Architect

### ✅ API Skeleton (Backend Lead)

```
[ ] src/app/api/ structure created
    [ ] src/app/api/health/route.ts
    [ ] src/app/api/offers/route.ts (stub)
    [ ] src/app/api/offers/[id]/route.ts (stub)
    [ ] src/app/api/searches/route.ts (stub)
    [ ] src/app/api/projects/route.ts (stub)
    
[ ] Middleware setup
    [ ] Error handler middleware
    [ ] Request logging
    [ ] Rate limiting (stub)
    
[ ] Environment validation
    [ ] Check OPENROUTER_API_KEY exists
    [ ] Check MONGODB_URI exists
    [ ] Add .env.local template
    
[ ] Tests structure
    [ ] tests/api/ folder created
    [ ] Example test file with MongoDB mock
```

**Duration**: 10 hours  
**Owner**: Backend Lead

### ✅ React Query Setup (Frontend Lead)

```
[ ] Install dependencies
    [ ] @tanstack/react-query
    [ ] @tanstack/react-query-devtools
    
[ ] src/lib/query/client.ts
    [ ] QueryClient instantiated
    [ ] Default options configured
    [ ] Retry policy defined
    
[ ] src/lib/query/keys.ts
    [ ] Query key factory created
    [ ] Keys exported for use
    
[ ] src/app/layout.tsx
    [ ] QueryClientProvider added
    [ ] DevTools included (dev mode)
    
[ ] Browser storage backup (temporary)
    [ ] localStorage still works as fallback
    [ ] Plan for gradual migration
```

**Duration**: 6 hours  
**Owner**: Frontend Lead

### ✅ Database Setup (Backend #2)

```
[ ] MongoDB connection test
    [ ] Connect from Node.js
    [ ] Verify auth works
    [ ] Ping cluster
    
[ ] Mongoose/native driver decision
    [ ] Install: mongodb (native) or mongoose
    [ ] Recommendation: Use native + Zod (type-safe)
    
[ ] Sample collection creation
    [ ] Create 'offers' collection with example doc
    [ ] Create 'searches' collection
    [ ] Verify indexing works
    
[ ] Backup/restore scripts
    [ ] Create bin/backup-db.sh
    [ ] Create bin/restore-db.sh
    [ ] Document procedures
```

**Duration**: 8 hours  
**Owner**: Backend Engineer #2

### ✅ Testing Infrastructure (QA)

```
[ ] Cypress setup
    [ ] pnpm add -D cypress
    [ ] Create e2e/ folder
    [ ] Write first dummy test
    [ ] Verify CI runs tests
    
[ ] Jest configuration
    [ ] pnpm add -D jest @types/jest
    [ ] Create jest.config.js
    [ ] Write sample unit test
    
[ ] GitHub Actions
    [ ] .github/workflows/test.yml
    [ ] Runs both Cypress + Jest
    [ ] Reports results
```

**Duration**: 6 hours  
**Owner**: QA Automation

---

## 🎯 Immediate Quick Wins (Week 1-2)

### Quick Win #1: Fix History Restore Bug
**Priority**: 🔴 CRITICAL  
**Effort**: 2 hours  
**Owner**: Frontend Lead  
**Impact**: Unblocks history workflow

```typescript
// src/app/history/page.tsx
// BEFORE (sessionStorage-based):
const handleRestoreSearch = (item) => {
  sessionStorage.setItem('restore_search', JSON.stringify(item));
  router.push('/');
};

// AFTER (URL-based):
const handleRestoreSearch = (item) => {
  const params = new URLSearchParams({
    restore: 'true',
    domain: item.inputs.domain,
    criteria: item.inputs.criteria,
    context: item.inputs.context,
  });
  router.push(`/?${params.toString()}`);
};

// src/hooks/use-restore-search.ts
// Extract from URL, not sessionStorage
```

**Benefit**: History page works reliably, cross-tab safe

### Quick Win #2: Add Compare Page Validation
**Priority**: 🟡 MEDIUM  
**Effort**: 1 hour  
**Owner**: Frontend Engineer  
**Impact**: Prevents silent failures

```typescript
// src/app/compare/page.tsx
useEffect(() => {
  if (selectedOffers.length < 2) {
    // Add explicit redirect message
    router.push('/saved?reason=insufficient-offers');
  }
}, [selectedOffers, router]);
```

**Benefit**: User gets feedback why they're redirected

### Quick Win #3: Document Architecture
**Priority**: 🟠 HIGH  
**Effort**: 4 hours  
**Owner**: Cloud Architect  
**Impact**: Aligns team on strategy

**Deliverable**: Finalized versions of:
- ROADMAP_2026_ARCHITECTURE.md
- TEAM_STRUCTURE_AND_ROLES.md
- EXECUTIVE_SUMMARY.md
- ANALYSIS_DATA_INCONSISTENCIES.md

---

## 📊 Week 1 Timeline

```
Monday 8am     Team kickoff meeting (30 min)
Monday 9am     Infrastructure setup begins (DevOps)
Monday 10am    Architecture review (Arch Lead + Backend Lead)
Monday 2pm     React Query training (Frontend)

Tuesday 10am   Daily standup (15 min)
Tuesday 2pm    Database design review
Wednesday 10am Daily standup
Wednesday 2pm  API design review

Thursday 10am  Daily standup
Thursday 2pm   Infrastructure readiness check
Thursday 4pm   Code review of all skeleton PRs

Friday 10am    Demo of setup (5 min per area)
Friday 2pm     Week 1 retrospective
Friday 3pm     Week 2 planning
```

---

## 🔧 Environment Variables Setup

Create `.env.local`:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://offeranalyst:PASSWORD@cluster.mongodb.net/offeranalyst?retryWrites=true&w=majority

# Tigris
TIGRIS_API_KEY=sk_...
TIGRIS_URL=https://api.tigristry.io

# OpenAI/OpenRouter (existing)
OPENROUTER_API_KEY=sk-...

# Vercel (deployment)
VERCEL_URL=https://offeranalyst.vercel.app

# Feature flags
ENABLE_TIGRIS_SEARCH=false  # Enable in Phase 3
ENABLE_EVENTS=false         # Enable in Phase 3
```

---

## ✅ Definition of Done: Week 1

**Infrastructure**:
- ✅ MongoDB Atlas cluster running with daily backups
- ✅ Tigris account created with API key
- ✅ GitHub Actions CI/CD pipeline executing

**Architecture**:
- ✅ All tech decisions documented with rationale
- ✅ Database schemas finalized & documented
- ✅ API specification (OpenAPI) created
- ✅ Architecture diagram completed

**Code**:
- ✅ API route skeleton created (all placeholders)
- ✅ React Query client configured & integrated
- ✅ Health check endpoint responding
- ✅ Quick wins #1 & #2 implemented & merged

**Testing**:
- ✅ Cypress installed & configured
- ✅ First dummy test passing in CI
- ✅ Jest setup for unit tests

**Documentation**:
- ✅ All roadmap docs finalized
- ✅ Team structure & roles documented
- ✅ Quick start guide created
- ✅ Known issues/gotchas documented

---

## 🚨 Blockers & Support

**Infrastructure Issues**:
- MongoDB Atlas not connecting? → DevOps + Architect
- Tigris API key issues? → Backend Lead

**Architecture Questions**:
- API design debate? → Cloud Architect (final say)
- Database schema concern? → Architect + Backend Lead

**Team Friction**:
- Timeline concerns? → Product Manager
- Technical disagreement? → Architecture review meeting

**Escalation Path**:
1. Ask in Slack #blockers channel (2h response)
2. Schedule 30min sync with relevant lead (same day)
3. If still stuck → Escalate to Architect (architecture) or PM (timeline)

---

## 📚 Required Reading for All

**Monday Morning (Before Kickoff)**:
1. EXECUTIVE_SUMMARY.md (15 min)
2. ROADMAP_2026_ARCHITECTURE.md (30 min)
3. TEAM_STRUCTURE_AND_ROLES.md (20 min)

**Tuesday-Friday (During Phase 1)**:
- Role-specific docs (see below)

### Role-Specific Reading

**Cloud Architect**:
- ANALYSIS_DATA_INCONSISTENCIES.md
- MONGODB_SCHEMAS.md (create this)
- API_SPECIFICATION.md (create this)

**Backend Lead**:
- API_SPECIFICATION.md
- Next.js API Routes documentation
- MongoDB query patterns

**Frontend Lead**:
- React Query documentation
- React 18 Suspense patterns
- TypeScript strict mode

**DevOps**:
- MongoDB Atlas operations guide
- GitHub Actions documentation
- Vercel deployment guide

**QA**:
- Cypress best practices
- Testing strategy document
- Accessibility guidelines

---

## 🎁 Week 1 Deliverables Summary

| Role | Deliverable | Status |
|------|-------------|--------|
| **Cloud Arch** | Architecture docs, decision rationale | 📝 In Progress |
| **Backend Lead** | API skeleton, health check | 📝 In Progress |
| **Backend #2** | MongoDB setup, schemas | 📝 In Progress |
| **Frontend Lead** | React Query config | 📝 In Progress |
| **DevOps** | Infrastructure, CI/CD | 📝 In Progress |
| **QA** | Test framework setup | 📝 In Progress |

**All Deliverables Due**: Friday EOD

---

## 🏁 Success Criteria: Week 1 Complete

- ✅ Team on-boarded and understanding strategy
- ✅ Infrastructure provisioned and tested
- ✅ Quick wins deployed (History + Compare fixes)
- ✅ Code skeleton ready for Phase 2
- ✅ Zero architecture disagreements unresolved
- ✅ All documentation completed & reviewed

---

**Next Phase Starts**: Monday of Week 2 (Phase 2: Core Migration)

**Questions?** Schedule a 1-on-1 with your role lead.

---

*This checklist is authoritative for Week 1 execution. Update as you progress. Mark items ✅ as complete.*
