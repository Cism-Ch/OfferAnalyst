# 🚀 TODO Quick Reference Guide

**Quick access to all TODOs found in the codebase**

---

## 🔧 In Progress (Current PR)

### Deployment Configuration
- **File:** `vercel.json`, documentation files
- **Status:** ⏳ PENDING MERGE (January 2026)
- **Issue:** Secret references causing deployment failure
- **Solution:** Removed `@secret_name` syntax, updated documentation
- **Note:** Will be marked complete after PR merge and successful deployment

---

## 🔴 Critical (Fix Immediately)

### 1. Fetch Agent Modernization
**Files:** `src/app/actions/fetch.ts`  
**Reference Doc:** `docs/FETCH_AGENT_IMPROVEMENT.md`, `docs/AGENT_OPTIMIZATION_PLAN.md`

**Problems:**
- Manual JSON parsing with regex (fragile)
- No schema validation (Zod)
- Mock data fallbacks (misleading)

**Action Items:**
```typescript
// TODO: Migrate to parseJSONFromText from agent-utils.ts
// TODO: Add Zod schema validation for Offer[]
// TODO: Remove mock-1 and mock-2 fallbacks
// TODO: Implement retryWithBackoff for failures
// TODO: Return typed AgentError on permanent failure
```

**Estimated Effort:** 4-6 hours  
**Priority:** 🔴 HIGH

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
1. Choose cache backend (Redis or in-memory Map)
2. Implement `getCachedOffers()` function
3. Implement `cacheOffers()` function
4. Add cache key generation (hash of domain + context)
5. Set TTL to 3600 seconds (1 hour)
6. Update return metadata with cache hit/miss

**Estimated Effort:** 3-4 hours  
**Priority:** 🟡 HIGH

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
3. Associate results with user ID
4. Add timestamps and metadata
5. Implement result retrieval endpoints

**Estimated Effort:** 2-3 hours  
**Priority:** 🟡 HIGH

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
1. Accept `webhookUrl` parameter
2. Create `sendWebhook()` function
3. POST result summary on completion
4. Implement retry logic (exponential backoff)
5. Add HMAC signature for security

**Estimated Effort:** 2-3 hours  
**Priority:** 🟡 HIGH

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
1. Implement `convertToCSV()` - flatten data, escape special chars
2. Implement `preparePDFData()` - use pdfkit or jsPDF
3. Add export format parameter to action
4. Support custom column selection (CSV)
5. Add headers and metadata

**Estimated Effort:** 4-5 hours  
**Priority:** 🟡 HIGH

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
1. Create `WorkflowProgress` model in Prisma
2. Store state transitions in MongoDB
3. Implement `saveWorkflowProgress()` function
4. Implement `getWorkflowProgress()` function
5. Track timing and performance metrics

**Estimated Effort:** 3-4 hours  
**Priority:** 🟡 HIGH

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
2. Generate and store verification tokens
3. Send emails via Resend
4. Implement token expiration (24h)
5. Add resend functionality with cooldown

**Estimated Effort:** 4-5 hours  
**Priority:** 🟢 MEDIUM  
**Dependencies:** Resend API key

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
2. Generate secure reset tokens
3. Send reset emails via Resend
4. Create password update page
5. Add rate limiting

**Estimated Effort:** 4-5 hours  
**Priority:** 🟢 MEDIUM  
**Dependencies:** Resend API key

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
2. Save use case selection
3. Store preferences (theme, model, etc.)
4. Mark onboarding as completed
5. Redirect to personalized dashboard

**Estimated Effort:** 2-3 hours  
**Priority:** 🟢 MEDIUM

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
1. Create `/api/admin/feature-flags` endpoint
2. Store flags in MongoDB
3. Implement flag caching
4. Add flag evaluation middleware
5. Support user-level and global flags

**Estimated Effort:** 3-4 hours  
**Priority:** 🟢 MEDIUM

### 11. API Key Management Completion
**File:** `src/app/dashboard/api-keys/page.tsx`  
**Lines:** 88-95

**TODOs:**
```typescript
// Line 88: TODO: Show toast notification
const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    // TODO: Show toast notification
};

// Line 94: TODO: Call delete API
const deleteKey = (id: string) => {
    if (confirm('Are you sure?')) {
        setApiKeys(keys => keys.filter(k => k.id !== id));
        // TODO: Call delete API
    }
};
```

**Implementation Steps:**
1. Install toast library (sonner or react-hot-toast)
2. Add toast on copy/create/delete actions
3. Create `/api/keys/delete` endpoint
4. Implement soft delete
5. Add proper confirmation dialogs

**Estimated Effort:** 2-3 hours  
**Priority:** 🟢 MEDIUM

---

## ⚪ Low Priority (Future Sprints)

### 12. Analytics Dashboard
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.3  
**Page:** `/dashboard/analytics`

**Components:**
- KPI cards (searches, results, avg score, saved)
- Line chart: Searches over time
- Pie chart: Top categories
- Histogram: Score distribution
- Bar chart: Model usage

**Estimated Effort:** 8-12 hours  
**Priority:** ⚪ LOW

### 13. Workspace Settings
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 3.4  
**Page:** `/dashboard/workspace`

**Features:**
- Team management (future)
- Workspace name
- Default preferences
- Theme selection

**Estimated Effort:** 6-8 hours  
**Priority:** ⚪ LOW

### 14. Premium Theme System
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 7.1

**Themes to Add:**
- Ocean Blue
- Forest Green
- Sunset Orange
- Midnight Purple

**Estimated Effort:** 4-6 hours  
**Priority:** ⚪ LOW

### 15. Animation Library
**Reference:** `docs/PREMIUM_ROADMAP_2026.md` Phase 1.2

**Components:**
- Page transitions
- Card hover effects
- Button interactions
- Loading states
- Modal transitions

**Estimated Effort:** 6-8 hours  
**Priority:** ⚪ LOW

---

## 📊 Summary by Priority

| Priority | Count | Total Effort (hours) |
|----------|-------|---------------------|
| 🔴 Critical | 1 | 4-6 |
| 🟡 High | 5 | 14-19 |
| 🟢 Medium | 5 | 17-23 |
| ⚪ Low | 5 | 24-34 |
| **TOTAL** | **16** | **59-82** |

**Estimated Completion:**
- Critical: 1 day
- High Priority: 3-4 days
- Medium Priority: 4-5 days
- Low Priority: 6-8 days
- **Total: ~3-4 weeks** (single developer)

---

## 🎯 Recommended Sprint Planning

### Sprint 1 (Week 1-2): Critical & High Priority
- ✅ Deployment fix (DONE)
- 🔴 Fetch agent modernization
- 🟡 FetchV2 caching
- 🟡 AnalyzeV2 storage & webhooks
- 🟡 Workflow progress storage

### Sprint 2 (Week 3-4): Medium Priority Auth & UI
- 🟢 Email verification
- 🟢 Password reset
- 🟢 API key management
- 🟢 Toast notifications

### Sprint 3 (Week 5-6): Medium Priority Features
- 🟡 OrganizeV2 exports
- 🟢 Onboarding profile save
- 🟢 Admin feature flags

### Sprint 4+ (Week 7+): Premium & Polish
- ⚪ Analytics dashboard
- ⚪ Premium themes
- ⚪ Animation system
- ⚪ Workspace settings

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

**Document Last Updated:** January 2026  
**For Full Details:** See `/docs/IMPLEMENTATION_PLAN_2026.md`
