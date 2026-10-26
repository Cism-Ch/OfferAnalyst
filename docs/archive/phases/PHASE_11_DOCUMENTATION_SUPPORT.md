# Phase 11: Documentation & Support

This document provides comprehensive documentation for developers and users of OfferAnalyst.

---

## 11.1 Developer Documentation

### API Overview

OfferAnalyst uses **Next.js Server Actions** for its API layer. All actions are server-side functions that can be called directly from React components.

#### Available Server Actions

##### 1. Fetch Offers Action

**Location**: `src/app/actions/fetch.ts`

**Purpose**: Retrieves offers from the web based on domain and search criteria using AI-powered search.

**Function**: `fetchOffersAction`

**Parameters**:
```typescript
{
  domain: string;        // Search domain (e.g., "seloger.com")
  criteria: string;      // Search criteria
  limit?: number;        // Max number of offers (default: 5)
  model?: string;        // AI model to use
}
```

**Response**:
```typescript
AgentActionResult<Offer[]>
```

**Example**:
```typescript
import { fetchOffersAction } from '@/app/actions/fetch';

const result = await fetchOffersAction({
  domain: 'seloger.com',
  criteria: 'Appartement 3 pièces à Paris',
  limit: 10,
  model: 'google/gemini-2.0-flash-001'
});

if (result.success) {
  console.log('Offers:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

##### 2. Analyze Offers Action

**Location**: `src/app/actions/analyze.ts`

**Purpose**: Ranks and analyzes offers based on user criteria using AI.

**Function**: `analyzeOffersAction`

**Parameters**:
```typescript
{
  offers: Offer[];           // Offers to analyze
  criteria: string;          // Analysis criteria
  implicitContext?: string;  // Additional context
  model?: string;            // AI model to use
}
```

**Response**:
```typescript
AgentActionResult<AnalysisResponse>
```

**AnalysisResponse Structure**:
```typescript
{
  topOffers: ScoredOffer[];    // Top 3 offers with scores
  marketSummary: string;       // AI-generated market insights
  sources: string[];           // Data sources used
}
```

**Example**:
```typescript
import { analyzeOffersAction } from '@/app/actions/analyze';

const result = await analyzeOffersAction({
  offers: fetchedOffers,
  criteria: 'Budget 200k€, 3 chambres, proche métro',
  implicitContext: 'Recherche pour famille avec 2 enfants',
  model: 'openai/gpt-4o'
});

if (result.success) {
  console.log('Top offers:', result.data.topOffers);
  console.log('Market summary:', result.data.marketSummary);
}
```

---

##### 3. Organize Offers Action

**Location**: `src/app/actions/organize.ts`

**Purpose**: Categorizes and organizes offers into timelines using AI.

**Function**: `organizeOffersAction`

**Parameters**:
```typescript
{
  offers: Offer[];       // Offers to organize
  categories: string[];  // Target categories
  model?: string;        // AI model to use
}
```

**Response**:
```typescript
AgentActionResult<OrganizedOffers>
```

**Example**:
```typescript
import { organizeOffersAction } from '@/app/actions/organize';

const result = await organizeOffersAction({
  offers: savedOffers,
  categories: ['urgent', 'consideration', 'long-term'],
  model: 'anthropic/claude-3.5-sonnet'
});

if (result.success) {
  console.log('Organized:', result.data);
}
```

---

### API Endpoints

#### Analytics Events

**Endpoint**: `POST /api/analytics/event`

**Purpose**: Track user events for analytics.

**Request Body**:
```json
{
  "type": "search_started" | "search_completed" | "analysis_started" | ...,
  "metadata": { ... },
  "path": "/dashboard"
}
```

**Response**:
```json
{ "success": true }
```

---

#### Web Vitals

**Endpoint**: `POST /api/analytics/web-vitals`

**Purpose**: Track Core Web Vitals metrics.

**Request Body**:
```json
{
  "name": "LCP" | "FCP" | "CLS" | "TTFB" | "INP",
  "value": 1234.56,
  "rating": "good" | "needs-improvement" | "poor",
  "path": "/dashboard"
}
```

**Response**:
```json
{ "success": true }
```

---

### Error Handling

All server actions return a discriminated union type:

```typescript
type AgentActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: AgentError }

interface AgentError {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
}
```

**Example Error Handling**:
```typescript
const result = await fetchOffersAction(params);

if (!result.success) {
  // Handle error
  switch (result.error.code) {
    case 'RATE_LIMIT':
      alert('Rate limit exceeded. Please try again later.');
      break;
    case 'INVALID_API_KEY':
      alert('Invalid API key. Please check your configuration.');
      break;
    default:
      alert(result.error.message);
  }
  return;
}

// Use data
const offers = result.data;
```

---

### Rate Limits

Current rate limits (subject to change):

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| Fetch Offers | 10 requests | 1 minute |
| Analyze Offers | 20 requests | 1 minute |
| Organize Offers | 20 requests | 1 minute |
| Analytics Events | 100 requests | 1 minute |

Rate limits are tracked per user session.

---

### Authentication

OfferAnalyst uses **Better-Auth** for authentication.

#### Available Methods

```typescript
import { auth } from '@/lib/auth';

// Get current session
const session = await auth.api.getSession({
  headers: await headers()
});

// Sign out
await auth.api.signOut({
  headers: await headers()
});
```

#### Protected Routes

Use middleware to protect routes:

```typescript
// middleware.ts
import { auth } from './lib/auth';

export default auth.middleware({
  // Routes that require authentication
  matcher: ['/dashboard', '/saved', '/history', '/projects']
});
```

---

## 11.2 User Documentation

### Getting Started Guide

#### 1. Sign Up / Sign In

- Visit the application homepage
- Click "Sign In" or "Get Started"
- Choose authentication method:
  - Email/Password
  - Google OAuth
  - GitHub OAuth

#### 2. Complete Onboarding

Follow the 5-step onboarding process:

1. **Welcome**: Learn about OfferAnalyst features
2. **Use Case**: Select your use case (Real Estate, Jobs, etc.)
3. **API Keys**: Add your OpenRouter API key (optional but recommended)
4. **First Search**: Try your first offer search
5. **Support**: Choose support tier and complete setup

#### 3. Configure Your First Search

**Step 1: Enter Domain**
```
Example: seloger.com, leboncoin.fr, indeed.com
```

**Step 2: Define Criteria**
```
Example: "Appartement 2-3 pièces, Paris 11e, budget max 400k€"
```

**Step 3: Add Implicit Context (Optional)**
```
Example: "Recherche pour couple sans enfants, proche transports"
```

**Step 4: Select AI Model**
```
Options: GPT-4, Claude, Gemini, Llama
```

**Step 5: Start Workflow**
Click "Start Workflow" to begin analysis.

---

### Features Guide

#### Dashboard

The main interface for searching and analyzing offers.

**Key Features**:
- Auto-fetch toggle: Automatically fetch offers before analysis
- Manual input: Paste JSON offers directly
- Model selection: Choose your preferred AI model
- Theme switcher: 8 premium themes available

#### Saved Offers

Manage your saved offers collection.

**Actions**:
- **Compare**: Select 2-3 offers to compare side-by-side
- **Smart Organize**: AI-powered categorization
- **Export**: Download your saved offers
- **Delete**: Remove unwanted offers

#### Search History

Track and restore previous searches.

**Features**:
- **Pin**: Mark important searches
- **Restore**: Re-run previous searches
- **Filter**: Search through history
- **Clear**: Remove unpinned searches

#### Projects

Multi-source research workspaces.

**Workflow**:
1. Create new project
2. Add multiple search sources
3. Aggregate results
4. Analyze across sources
5. Export findings

#### Compare

Side-by-side offer comparison.

**Comparison Includes**:
- Score breakdowns
- Key attributes
- Pros and cons
- Visual progress bars

---

### FAQ (Frequently Asked Questions)

#### General

**Q: Is OfferAnalyst free?**
A: Yes! OfferAnalyst is free forever. You can use our shared AI models with rate limits, or bring your own API key (BYOK) for unlimited usage.

**Q: What AI models are supported?**
A: We support OpenRouter models including GPT-4, Claude, Gemini, Llama, and more. See the model selector for full list.

**Q: How is my data stored?**
A: Your data is stored locally in your browser (localStorage) by default. When authenticated, data is synced to our secure MongoDB database.

**Q: Is my data private?**
A: Yes! We follow privacy-first principles. No external analytics SaaS. All tracking is internal and GDPR compliant.

---

#### API Keys

**Q: Do I need an API key?**
A: No, but recommended. Without your own key, you'll use our shared AI models with rate limits.

**Q: How do I get an OpenRouter API key?**
A: 
1. Visit https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Add it in Settings → API Keys

**Q: Are my API keys secure?**
A: Yes. Keys are encrypted before storage and never exposed in client-side code.

---

#### Troubleshooting

**Q: "Rate limit exceeded" error**
A: You've hit the rate limit for shared models. Either:
- Wait a few minutes
- Add your own API key for unlimited usage

**Q: Search returns no results**
A: Try:
- Broadening your search criteria
- Checking domain spelling
- Ensuring the domain has searchable content
- Using a different AI model

**Q: Offers not loading**
A: Check:
- Internet connection
- API key validity (if using BYOK)
- Browser console for errors
- Try refreshing the page

**Q: Theme not persisting**
A: Enable cookies and localStorage in your browser settings.

---

### Tutorials

#### Tutorial 1: Finding Your Perfect Apartment

**Objective**: Use OfferAnalyst to find and compare apartments.

**Steps**:

1. **Set Up Search**
   - Domain: `seloger.com`
   - Criteria: `"3 pièces, Paris 18e, balcon, ascenseur, budget max 500k€"`
   - Context: `"Couple avec 1 enfant, proche métro"`

2. **Run Analysis**
   - Enable auto-fetch
   - Select Gemini 2.0 Flash (fast)
   - Click "Start Workflow"

3. **Review Results**
   - Check top 3 recommended offers
   - Read AI market summary
   - Review score breakdowns

4. **Save Favorites**
   - Click "Save" on interesting offers
   - Add tags: "favorite", "good-price", "needs-visit"

5. **Compare Options**
   - Go to Saved Offers
   - Select 2-3 apartments
   - Click "Compare Selected"
   - Review side-by-side comparison

6. **Create Project**
   - Go to Projects
   - Create "Paris Apartment Search"
   - Add multiple sources (SeLoger, LeBonCoin)
   - Track across platforms

---

#### Tutorial 2: Job Search Optimization

**Objective**: Find the best job opportunities matching your profile.

**Steps**:

1. **Configure Search**
   - Domain: `indeed.com`
   - Criteria: `"Senior Frontend Developer, React, TypeScript, Remote or Paris"`
   - Context: `"5 years experience, looking for growth opportunities, tech lead path"`

2. **Analyze Opportunities**
   - Use GPT-4 for detailed analysis
   - Review scoring (salary, tech stack, company culture)
   - Check market insights

3. **Organize Timeline**
   - Save interesting positions
   - Go to Smart Organize
   - Categories: "Apply Now", "Research Company", "Follow Up"

4. **Track Applications**
   - Create "2026 Job Search" project
   - Add notes and status updates
   - Set reminders in your calendar

---

## 11.3 Support Channels

### Community Support

**GitHub Discussions**: Ask questions and share tips
- https://github.com/Cism-Ch/OfferAnalyst/discussions

**GitHub Issues**: Report bugs and request features
- https://github.com/Cism-Ch/OfferAnalyst/issues

### Documentation

**Developer Docs**: `/docs`
- API documentation
- Architecture guides
- Contributing guidelines

**User Guides**: In-app help center (coming soon)

### Future Support Features

**Planned for Phase 11.3**:
- [ ] AI-powered email support
- [ ] AI-powered chat support (Hugging Face models)
- [ ] Community Discord server
- [ ] Video tutorials
- [ ] Interactive product tours

---

## Changelog & Versioning

### Version 1.0.0 (January 2026)

**New Features**:
- ✅ Privacy-first analytics system
- ✅ Web Vitals tracking
- ✅ Analytics dashboard
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Comprehensive deployment documentation
- ✅ API documentation
- ✅ User guides and tutorials

**Improvements**:
- 🎨 8 premium themes
- ⚡ Performance optimizations
- 🔒 Enhanced security with Better-Auth
- 📊 Advanced analytics insights

**Bug Fixes**:
- Fixed build issues with font loading
- Resolved hydration errors
- Corrected type definitions

---

### Version 0.9.0 (December 2025)

**Phase 7 & 8 Completion**:
- Premium theme system
- Framer Motion animations
- Skeleton loading states
- Toast notifications
- Accessibility improvements (WCAG 2.1 AA)
- Security hardening
- GDPR compliance

---

### Version 0.8.0 (November 2025)

**Phase 5 & 6 Completion**:
- Multi-model AI support
- Better-Auth integration
- MongoDB database
- User profiles
- Projects feature
- Search history

---

## API SDK (Future)

### JavaScript/TypeScript SDK

```typescript
import { OfferAnalyst } from '@offeranalyst/sdk';

const client = new OfferAnalyst({
  apiKey: 'your-api-key'
});

// Fetch offers
const offers = await client.fetchOffers({
  domain: 'example.com',
  criteria: 'search criteria'
});

// Analyze
const analysis = await client.analyzeOffers({
  offers,
  criteria: 'analysis criteria'
});
```

### Python SDK

```python
from offeranalyst import Client

client = Client(api_key='your-api-key')

# Fetch offers
offers = client.fetch_offers(
    domain='example.com',
    criteria='search criteria'
)

# Analyze
analysis = client.analyze_offers(
    offers=offers,
    criteria='analysis criteria'
)
```

---

## Contributing

We welcome contributions! See `CONTRIBUTING.md` for guidelines.

---

## License

MIT License - see `LICENSE` file for details.

---

*Last updated: January 2026*
*Version: 1.0.0*
*Status: Production Ready ✅*
