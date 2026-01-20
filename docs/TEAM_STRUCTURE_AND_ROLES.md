# Spécialistes & Rôles Recommandés - OfferAnalyst

**Document**: Structuration de l'équipe pour exécuter la roadmap 2026
**Créé**: 11 Janvier 2026
**Durée**: Q1-Q2 2026 (20 semaines)

---

## 🎯 Vue d'Ensemble de l'Équipe

```
┌────────────────────────────────────────────────────────┐
│              OfferAnalyst Squad (5-6 people)          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Product Manager (0.5 FTE)  ← Optionnel mais utile   │
│       ↓                                                │
│  Cloud Architect (1.0 FTE, Lead) ← Décisions clés   │
│  │                                                    │
│  ├─ Backend Lead (1.0 FTE) ← Implémentation APIs   │
│  │   ├─ Backend Engineer #2 (1.0 FTE)              │
│  │   └─ DevOps Engineer (0.7 FTE)                  │
│  │                                                  │
│  └─ Frontend Lead (1.0 FTE) ← React/Hooks         │
│      ├─ Frontend Engineer #2 (0.7 FTE)            │
│      └─ QA Automation (0.8 FTE)                   │
│                                                    │
└────────────────────────────────────────────────────────┘
```

**Total**: 5.8 FTE (Budget pour 6 personnes)

---

## 👤 Rôle 1: Cloud Architect & Lead (1.0 FTE)

### Profil Idéal
- **Expérience**: 8+ ans
- **Stack**: Full-stack (Node.js/TypeScript, React, Database Design)
- **Spécialités**: 
  - Architecture distribuée
  - Database design & normalization
  - API design (REST/GraphQL)
  - Security & authentication
  - Event-driven systems

### Responsabilités Principales
1. **Decisions Architecturales Stratégiques**
   - Valider les choix tech (MongoDB vs PostgreSQL, Tigris vs Elasticsearch)
   - Design du système de cache
   - Stratégie de synchronisation offline-first

2. **Leadership Technique**
   - Reviews de PR sur architecture
   - Mentoring du team
   - Escalation des blockers techniques

3. **Communication Stakeholders**
   - Weekly status reports
   - Sprint planning
   - Risk identification

### Tâches Spécifiques

#### Phase 1: Architecture Design (Week 1-4)
```typescript
// Livrables:
// 1. Architecture Diagram (Excalidraw)
//    - Client/Server/Database layers
//    - Data flow diagrams
//    - Cache strategy

// 2. API Specification (OpenAPI 3.0)
//    src/docs/openapi.yaml
//    - 30+ endpoints documented
//    - Request/response schemas
//    - Error codes & handling

// 3. Database Schema Design
//    docs/MONGODB_SCHEMAS.md
//    - Collections definition
//    - Indexes strategy
//    - Validation rules
//    - Relationships & FKs

// 4. Tech Stack Rationale Document
//    docs/TECH_DECISIONS.md
//    - Why MongoDB over PostgreSQL
//    - Why React Query over Redux
//    - Why Tigris over Elasticsearch
//    - Cost analysis
```

**Deliverable Example**:
```yaml
# docs/MONGODB_SCHEMAS.md Structure

## Collections

### offers
- Fields: id, title, description, price, location, category, url
- Indexes: 
  - { saved: 1, createdAt: -1 } for listing
  - { domain: 1, finalScore: -1 } for ranking
- Validation: Zod schema + MongoDB schema validation

### searches
- Fields: domain, criteria, context, results, userId, pinned, createdAt
- Indexes:
  - { userId: 1, createdAt: -1 }
  - { $text: { $search: description } } for full-text
- Retention: Keep last 500/user

### projects
- Fields: name, description, searches[{ searchId, addedAt }], offers[{ offerId, savedAt }]
- Relations: offers.find({ _id: { $in: offers[*].offerId } })
- Cascade: Delete project → orphan searches NOT deleted

### audit_logs
- Fields: userId, action, resourceId, resourceType, metadata, timestamp
- Immutable: Set TTL 90 days
```

#### Phase 2-4: Architecture Review (Week 5-18)
- Approuve tous les PR > 200 lignes
- Weekly architecture call (1h)
- Performance reviews trimestriels

### Success Criteria
- ✅ Tous designs approved sans major rework
- ✅ Zéro architectural debt introduced
- ✅ Team alignment > 95%
- ✅ Deployment success rate > 99%

### Tools & Access
- **IDE**: VS Code
- **Databases**: MongoDB Atlas, Tigris
- **Communication**: Slack, GitHub
- **Architecture Diagramming**: Excalidraw, Miro
- **API Docs**: Swagger/OpenAPI

---

## 👤 Rôle 2: Backend Lead (1.0 FTE)

### Profil Idéal
- **Expérience**: 6+ ans backend
- **Stack**: Node.js, TypeScript, SQL/NoSQL
- **Spécialités**:
  - RESTful API design
  - Database optimization
  - Testing (Jest, Cypress)
  - DevOps fundamentals

### Responsabilités Principales
1. **API Development**
   - Implement 30+ API endpoints
   - Database queries optimization
   - Error handling & validation

2. **Code Quality**
   - Write tests (target: >80% coverage)
   - Code reviews for backend team
   - Performance profiling

3. **Database Management**
   - Schema migrations
   - Index optimization
   - Query analysis

### Tâches Spécifiques

#### Phase 1: API Skeleton (Week 1-4)
```bash
# Deliverables:
src/app/api/
├── offers/                          # 6 endpoints
│   ├── route.ts                     # GET /api/offers (list + search)
│   ├── [id]/route.ts                # GET/PUT/DELETE
│   ├── [id]/saved/route.ts          # PUT (toggle saved)
│   └── saved/route.ts               # GET (list saved)
│
├── searches/                        # 5 endpoints
│   ├── route.ts                     # GET/POST
│   └── [id]/route.ts                # GET/DELETE
│
├── projects/                        # 5 endpoints
│   ├── route.ts                     # GET/POST
│   └── [id]/route.ts                # GET/PUT/DELETE
│
├── admin/
│   ├── audit-logs/route.ts          # GET (admin only)
│   └── health/route.ts              # GET
│
└── tests/
    ├── offers.test.ts               # Jest tests
    ├── searches.test.ts
    └── projects.test.ts
```

**Code Example** (Week 2):
```typescript
// src/app/api/offers/route.ts (initial)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OfferSchema } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const limit = 20;
  
  const offers = await db.offers
    .find({})
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  return NextResponse.json({
    success: true,
    data: offers,
    meta: {
      page,
      limit,
      timestamp: Date.now()
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validation
  const parsed = OfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  const offer = await db.offers.insertOne(parsed.data);
  
  return NextResponse.json(
    { success: true, data: offer },
    { status: 201 }
  );
}
```

#### Phase 2-4: Full Implementation
- Implement all 30+ endpoints
- Database optimization
- Error handling & logging
- API documentation

#### Phase 5: Testing
- Write Jest tests for all routes
- Integration tests
- Load testing with k6

### Success Criteria
- ✅ All endpoints implemented & tested
- ✅ Query response time < 100ms (p95)
- ✅ Zero N+1 query issues
- ✅ API documentation 100% complete

### Tools & Access
- **IDE**: VS Code
- **Database**: MongoDB Atlas CLI
- **Testing**: Jest, Postman/Insomnia
- **Performance**: MongoDB Compass, Chrome DevTools
- **Version Control**: Git, GitHub

---

## 👤 Rôle 3: Frontend Lead (1.0 FTE)

### Profil Idéal
- **Expérience**: 6+ years React
- **Stack**: React, TypeScript, Hooks, Tailwind CSS
- **Spécialités**:
  - React patterns (Suspense, Error Boundaries)
  - State management (React Query)
  - Performance optimization (code splitting, memoization)
  - Accessibility (A11y)

### Responsabilités Principales
1. **Hook Architecture**
   - Design custom hooks for data fetching
   - State management patterns
   - Error handling in components

2. **Component Development**
   - Build reusable UI components
   - Implement loading states & skeletons
   - Error boundaries & fallbacks

3. **Performance**
   - Code splitting
   - Bundle analysis
   - Cache strategies

### Tâches Spécifiques

#### Phase 1: React Query Setup (Week 1-3)
```typescript
// Deliverables:
// src/lib/query/
// ├── client.ts          # QueryClient config
// ├── keys.ts            # Query key factory
// └── config.ts          # Stale times, retry logic

// src/lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5min
      gcTime: 30 * 60 * 1000,         // 30min (formerly cacheTime)
      retry: 2,
      retryDelay: exponentialBackoff,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryKeys = {
  all: ['offers'],
  lists: () => [...queryKeys.all, 'list'],
  list: (filters: any) => [...queryKeys.lists(), filters],
  details: () => [...queryKeys.all, 'detail'],
  detail: (id: string) => [...queryKeys.details(), id],
};

// src/app/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### Phase 2: Hook Migration (Week 5-9)

```typescript
// Deliverables:
// src/hooks/ (all migrated to React Query)
// ├── use-saved-offers.ts       # v2.0
// ├── use-search-history.ts     # v2.0
// ├── use-dashboard-state.ts    # v2.0 (cleaned up)
// └── use-offer-analysis.ts     # v2.0 (serverState)

// src/hooks/use-saved-offers.ts (v2)
'use client';

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Offer } from '@/types';

export function useSavedOffers() {
  const queryClient = useQueryClient();
  
  const { data: savedOffers = [], isLoading } = useSuspenseQuery({
    queryKey: ['offers', 'saved'],
    queryFn: async () => {
      const res = await fetch('/api/offers/saved');
      if (!res.ok) throw new Error('Failed to fetch saved offers');
      return res.json();
    },
  });

  const saveOfferMutation = useMutation({
    mutationFn: (offer: Offer) =>
      fetch(`/api/offers/${offer.id}/saved`, { 
        method: 'PUT',
        body: JSON.stringify({ saved: true })
      }).then(r => r.json()),
    
    onMutate: async (offer) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['offers', 'saved'] });
      const previous = queryClient.getQueryData(['offers', 'saved']);
      
      queryClient.setQueryData(['offers', 'saved'], (old: Offer[]) => 
        [...(old || []), offer]
      );
      
      return { previous };
    },
    
    onError: (err, offer, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['offers', 'saved'], context.previous);
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'saved'] });
    },
  });

  return {
    savedOffers,
    isLoading,
    saveOffer: saveOfferMutation.mutate,
    isSaving: saveOfferMutation.isPending,
  };
}

// Usage in component:
export function OfferCard({ offer }) {
  const { saveOffer, isSaving } = useSavedOffers();
  
  return (
    <button 
      onClick={() => saveOffer(offer)}
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  );
}
```

#### Phase 3-4: Component Refactoring
- Update ConfigurationCard
- Update ResultsSection
- Update Compare page
- Add Suspense boundaries

#### Phase 5: Testing
- Write Cypress tests
- Component tests with Vitest
- Accessibility testing

### Success Criteria
- ✅ All hooks migrated to React Query
- ✅ Zero localStorage references (except auth)
- ✅ All pages pass accessibility audit
- ✅ Lighthouse score > 90

### Tools & Access
- **IDE**: VS Code
- **Testing**: Vitest, Cypress
- **Performance**: Lighthouse, Bundle Analyzer
- **Debugging**: React Developer Tools

---

## 👤 Rôle 4: Backend Engineer #2 (1.0 FTE)

### Profil Idéal
- **Expérience**: 4+ years backend
- **Stack**: Node.js, TypeScript, MongoDB
- **Spécialités**: Database design, testing, migrations

### Responsabilités
1. Co-implement APIs with Backend Lead
2. Database migrations & optimization
3. Unit test coverage
4. Documentation

### Tâches
- Phase 1: Help setup MongoDB schemas
- Phase 2: Implement searches & projects endpoints
- Phase 3: Write migration scripts
- Phase 4: Optimize database queries
- Phase 5: Integration tests

### Deliverables
```
Week 1-4:
- MongoDB schema implementations
- Basic CRUD endpoints

Week 5-9:
- Search endpoints with Tigris
- Project relationships

Week 10-14:
- Migration scripts
- Backup/restore procedures

Week 15-18:
- Query optimization
- Performance tests

Week 19-20:
- E2E tests
- Documentation
```

---

## 👤 Rôle 5: Frontend Engineer #2 (0.7 FTE)

### Profil Idéal
- **Expérience**: 3+ years React
- **Stack**: React, TypeScript, Tailwind CSS
- **Spécialités**: UI components, testing

### Responsabilités
1. Build UI components
2. Implement Suspense boundaries
3. Write component tests
4. Accessibility compliance

### Tâches
- Phase 1-2: Help setup React Query providers
- Phase 3: Build Suspense-wrapped components
- Phase 4: Update pages for new hooks
- Phase 5: Component & accessibility tests

---

## 👤 Rôle 6: DevOps Engineer (0.7 FTE)

### Profil Idéal
- **Expérience**: 4+ years DevOps
- **Stack**: GitHub Actions, Vercel, MongoDB Atlas
- **Spécialités**: CI/CD, monitoring, infrastructure

### Responsabilités
1. **MongoDB Setup & Maintenance**
   - Atlas configuration
   - Backup/restore procedures
   - Replication setup
   - Performance monitoring

2. **CI/CD Pipeline**
   - GitHub Actions workflows
   - Automated testing
   - Deployment automation

3. **Monitoring & Observability**
   - Error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - Logging (Logtail or similar)

### Tâches Specifiques

#### Phase 1: Infrastructure Setup (Week 1-4)
```yaml
# Deliverables:

# .github/workflows/
# ├── ci.yml                 # Lint, test, build
# ├── deploy.yml             # Deploy to Vercel
# └── db-backup.yml          # Daily MongoDB backup

# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm lint
      
      - run: pnpm test
      
      - run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v5
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### Phase 2-5: Maintenance
- Weekly backup verification
- Performance monitoring
- Scaling decisions
- Security patches

### Success Criteria
- ✅ CI/CD pipeline 100% automated
- ✅ MongoDB 99.9% uptime
- ✅ Zero production data loss
- ✅ Deployment time < 5 min

---

## 👤 Rôle 7: QA & Test Automation (0.8 FTE)

### Profil Idéal
- **Expérience**: 4+ years QA automation
- **Stack**: Cypress, Jest, TypeScript
- **Spécialités**: E2E testing, test strategy, automation

### Responsabilités
1. **Test Strategy**
   - Test plan for all features
   - Coverage targets
   - Regression testing

2. **Automation**
   - E2E tests with Cypress
   - Component tests with Vitest
   - Performance tests

3. **Quality Gates**
   - Merge blocking if tests fail
   - Coverage reporting
   - Performance benchmarks

### Tâches

#### Phase 1-2: Test Infrastructure
```
# e2e/
# ├── dashboards.cy.ts        # Dashboard workflows
# ├── saved.cy.ts             # Saved offers CRUD
# ├── history.cy.ts           # History & restore
# ├── compare.cy.ts           # Compare page
# └── projects.cy.ts          # Projects management

# src/**/*.test.ts            # Component tests

# e2e/dashboards.cy.ts
describe('Dashboard Workflows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should analyze offers and save results', () => {
    cy.get('[data-testid="domain-input"]').type('Jobs');
    cy.get('[data-testid="criteria-input"]').type('Remote, $100k+');
    cy.get('[data-testid="start-workflow"]').click();
    
    // Wait for results
    cy.get('[data-testid="offer-card"]').should('have.length.greaterThan', 0);
    
    // Save first offer
    cy.get('[data-testid="offer-card"]').first()
      .find('[data-testid="save-btn"]').click();
    
    cy.get('[data-testid="toast"]').should('contain', 'Saved');
  });

  it('should sync saved offers with /saved page', () => {
    // Dashboard: save offer
    cy.get('[data-testid="offer-card"]').first()
      .find('[data-testid="save-btn"]').click();
    
    // Navigate to /saved
    cy.get('[data-testid="nav-saved"]').click();
    cy.url().should('include', '/saved');
    
    // Offer should appear
    cy.get('[data-testid="saved-offer"]').should('have.length', 1);
  });
});
```

#### Phase 3-5: Full Test Coverage
- 50+ E2E tests
- 30+ component tests
- Performance tests
- Security tests

### Success Criteria
- ✅ E2E test coverage > 80%
- ✅ CI/CD cannot merge without passing tests
- ✅ Zero flaky tests
- ✅ Average test run time < 10 min

---

## 👤 Rôle Optionnel: Product Manager (0.5 FTE)

### Profil Idéal
- **Expérience**: 5+ years SaaS product
- **Spécialités**: Roadmap planning, stakeholder management

### Responsabilités
1. Roadmap prioritization
2. Feature specification
3. Stakeholder communication
4. Success metrics definition

### Time Allocation
- 50% coordination (30% internal, 20% external)
- 30% planning & design
- 20% communication & reporting

---

## 📅 Rôles par Phase

```
PHASE 1: Infrastructure (Week 1-4)
├─ Cloud Architect    🔴 Critical (Design all)
├─ Backend Lead       🔴 Critical (Setup APIs)
├─ Backend #2         🟠 High    (Setup MongoDB)
├─ DevOps             🔴 Critical (Infrastructure)
├─ Frontend Lead      🟡 Medium  (React Query setup)
└─ QA                 🟢 Low     (Test framework setup)

PHASE 2: Migration (Week 5-9)
├─ Frontend Lead      🔴 Critical (Hook migration)
├─ Frontend #2        🟠 High    (Component updates)
├─ Backend Lead       🟠 High    (API completion)
├─ Backend #2         🟠 High    (Endpoint implementation)
├─ Cloud Architect    🟡 Medium  (Review & decision)
├─ DevOps             🟡 Medium  (CI/CD setup)
└─ QA                 🟡 Medium  (Test infrastructure)

PHASE 3: Sync & Events (Week 10-14)
├─ Backend Lead       🔴 Critical (Event bus)
├─ Backend #2         🟠 High    (Event handlers)
├─ Frontend Lead      🟠 High    (Cross-tab sync)
├─ Frontend #2        🟡 Medium  (Sync UI)
├─ Cloud Architect    🟡 Medium  (Architecture review)
└─ DevOps             🟠 High    (Monitoring setup)

PHASE 4: Fix UI (Week 15-18)
├─ Frontend Lead      🔴 Critical (Page consistency)
├─ Frontend #2        🟠 High    (Component fixes)
├─ Backend Lead       🟠 High    (API adjustments)
├─ QA                 🔴 Critical (E2E testing)
└─ Cloud Architect    🟡 Medium  (Reviews)

PHASE 5: Testing (Week 19-20)
├─ QA                 🔴 Critical (E2E, integration)
├─ Backend #2         🟠 High    (Unit tests)
├─ Frontend #2        🟠 High    (Component tests)
└─ DevOps             🟠 High    (Performance tests)
```

---

## 🤝 Communication & Sync

### Weekly Meetings (1 hour each)

```
Monday 10:00   Technical Standup (15 min)
  └─ All team → Blockers & progress

Wednesday 14:00 Architecture Review (30 min)
  └─ Arch Lead + Tech Leads → Decisions

Friday 16:00   Demo & Planning (30 min)
  └─ All team + PO → Weekly demo + next week prep
```

### Communication Channels
```
Slack Channels:
  #offer-analyst              ← General
  #architecture               ← Design discussions
  #backend                    ← Backend work
  #frontend                   ← Frontend work
  #devops                     ← Infrastructure
  #testing                    ← QA stuff
  #blockers                   ← Urgent issues

GitHub:
  - Branch strategy: main + feature branches
  - PR reviews: 2 approval minimum
  - Commit messages: Conventional Commits
```

---

## 📊 Success Metrics by Role

| Role | Metric | Target |
|------|--------|--------|
| Cloud Architect | Architecture approval time | < 1 day |
| Backend Lead | API endpoint latency (p95) | < 100ms |
| Frontend Lead | Page load time | < 2s |
| Backend #2 | Test coverage | > 80% |
| Frontend #2 | Component test coverage | > 75% |
| DevOps | Infrastructure uptime | > 99.9% |
| QA | E2E test pass rate | > 95% |

---

## 💼 Hiring Strategy

### If Recruiting Needed

**Priority 1** (Immediately):
- Cloud Architect Lead (rare, expensive)
- Backend Lead (medium rarity)

**Priority 2** (Week 2):
- Frontend Lead (common)
- DevOps Engineer (medium rarity)

**Priority 3** (Week 4):
- Backend Engineer #2 (common)
- Frontend Engineer #2 (common)
- QA Automation (medium rarity)

### Interview Questions

**Cloud Architect**
1. "Design a system for handling 1M+ daily searches. How would you handle real-time sync?"
2. "How do you approach database normalization vs denormalization tradeoffs?"
3. "Describe your experience with event-driven architecture."

**Backend Lead**
1. "You have 1000 concurrent API requests. How do you optimize?"
2. "Design a REST API for a multi-tenancy SaaS. Show schema decisions."
3. "Walk us through your testing strategy for APIs."

**Frontend Lead**
1. "Design a client-side cache strategy for 10k+ items. How do you invalidate?"
2. "Explain your approach to React performance optimization."
3. "How do you structure custom hooks for maintainability?"

---

## 📈 Training & Onboarding

### Mandatory Training (First 2 Weeks)

```
All Team:
  - OfferAnalyst codebase walkthrough (4h)
  - Tech stack overview (2h)
  - Database schemas & APIs (3h)
  
Backend:
  - MongoDB deep dive (4h)
  - REST API design (2h)
  - Node.js performance (2h)

Frontend:
  - React 18 & Suspense (3h)
  - React Query patterns (3h)
  - Next.js 14 App Router (2h)

DevOps:
  - MongoDB Atlas operations (3h)
  - GitHub Actions CI/CD (2h)
  - Vercel deployment (2h)

QA:
  - Cypress e2e testing (3h)
  - Test strategy (2h)
  - Accessibility testing (2h)
```

### Knowledge Base
- Architecture Decision Records (ADRs) in `/docs`
- API documentation in OpenAPI format
- Database schema docs
- Troubleshooting guides
- Runbooks for common tasks

---

## 🎁 Deliverables Summary

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| **Arch** | Design | Reviews | Reviews | Reviews | Final docs |
| **BE Lead** | APIs skeleton | All endpoints | Event bus | Optimize | Perf tests |
| **BE #2** | MongoDB setup | Endpoints | Migrations | Tuning | Unit tests |
| **FE Lead** | RQ setup | Hooks v2 | Sync logic | Page fixes | Integration |
| **FE #2** | Providers | Components | Suspense | Updates | Comp tests |
| **DevOps** | Infrastructure | CI/CD | Monitoring | Logging | Performance |
| **QA** | Framework | Integration | Scenarios | E2E suite | Full coverage |

---

**Next**: Team formation → Kick-off meeting → Phase 1 starts
