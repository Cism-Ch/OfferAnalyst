# Analysis: Incohérences de Communication des Données - OfferAnalyst

**Document**: Diagnostic détaillé des problèmes de synchronisation et recommandations de fix
**Date**: 11 Janvier 2026
**Scope**: Dashboard + 4 Satellite Pages (Saved, History, Compare, Projects)

---

## 🔴 Problème #1: Siloisage des États (State Silos)

### Symptôme
Chaque page a son propre état local dérivé de localStorage, créant des **copies divergentes** de la même donnée.

### Root Cause Analysis

```
┌─────────────────────────────────────────────────────┐
│                    Problème Core                    │
├─────────────────────────────────────────────────────┤
│  Chaque hook gère son propre localStorage key      │
│  Pas de source unique de vérité (Single Source)    │
│  Modifications locales ne se propagent pas          │
└─────────────────────────────────────────────────────┘

  useSavedOffers()
        ↓
  [localStorage: "offeranalyst_saved_offers"]
        ↓
  ❌ À /saved: shows correct
  ❌ À /dashboard: shows stale
  ❌ À /compare: uses URL params, ignores localStorage!
```

### Scénarios d'Incohérence

#### Scénario 1: Save Flow Broken
```typescript
// Step 1: User à /dashboard
const { saveOffer } = useSavedOffers();
saveOffer(offer1); 
// localStorage["offeranalyst_saved_offers"] = [offer1]

// Step 2: Navigate à /saved
// useSavedOffers() se remonte depuis localStorage ✓
// Affiche: [offer1] ✓

// Step 3: Navigate à /compare
// URL: /compare
// Pas de offres sélectionnées (new page state)
// useSavedOffers() non appelé ❌
// selectedOffers = [] ❌
```

**Fix Actuel**: Néant
**Impact**: Flux utilisateur brisé, UX confus

#### Scénario 2: History Restore Incohérent
```typescript
// /history page
const { history } = useSearchHistory();
const handleRestoreSearch = (item) => {
  sessionStorage.setItem('restore_search', JSON.stringify(item));
  router.push('/');
};

// /dashboard page (page.tsx)
useRestoreSearch({...}); // useEffect qui regarde sessionStorage

// Problème: 
// - sessionStorage borné au contexte tab
// - Si localStorage a changé pendant navigation → données obsolètes
// - Pas de synchronisation avec le state du dashboard
```

### Code Impacté
```
src/hooks/
├── use-saved-offers.ts         ❌ Siloed
├── use-search-history.ts       ❌ Siloed  
├── use-dashboard-state.ts      ❌ Siloed (ephemeral + persistent mélangés)
├── use-projects.ts             ❌ Siloed
└── use-restore-search.ts       ❌ Session storage! (worst practice)

src/app/
├── page.tsx                    ❌ Mixe localStorage + props
├── saved/page.tsx              ❌ Appel useSavedOffers() seul
├── history/page.tsx            ❌ Appel useSearchHistory() seul
├── compare/page.tsx            ❌ URL params + localStorage mismatch
└── projects/page.tsx           ❌ Références orphelines
```

### Recommendation
**Priority**: 🔴 CRITICAL
**Timeline**: Week 5-9 (Phase 2)
**Owner**: Frontend Engineer Lead

```typescript
// ✅ SOLUTION: React Query + Server-side state
// src/hooks/use-saved-offers.ts (v2)
export function useSavedOffers() {
  return useSuspenseQuery({
    queryKey: ['offers', 'saved'],
    queryFn: async () => {
      const res = await fetch('/api/offers/saved');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    // ✓ Automatique: Synchronisé partout
  });
}

// Avantage:
// ✓ Single source: /api/offers/saved
// ✓ Auto-invalidation
// ✓ Cross-tab sync (si query invalidée)
// ✓ Optimistic updates support
```

---

## 🔴 Problème #2: Incohérence de la Page Compare

### Symptôme
Les offres affichées à `/compare?ids=A,B,C` ne correspondent pas toujours aux offres sauvegardées actuelles.

### Root Cause
```typescript
// src/app/compare/page.tsx (ligne 18-34)
const selectedOffers = useMemo(() => {
  const idsParam = searchParams.get('ids');
  if (!idsParam) {
    return [];
  }
  const ids = idsParam.split(',');
  
  // ❌ Filtre depuis savedOffers (localStorage)
  return savedOffers.filter(offer => {
    if (!ids.includes(offer.id)) return false;
    const scoredOffer = offer as ScoredOffer;
    return scoredOffer.finalScore !== undefined;
  }) as ScoredOffer[];
}, [searchParams, savedOffers]);

// Problème:
// 1. URL dit: ids=A,B,C
// 2. localStorage dit: [A, C, D] (B supprimée pendant navigation?)
// 3. Result: compare montre A, C (B disparu!)
```

### Scénario de Reproduction

```
Time  Action                           localStorage              URL           Screen
----  --------                         -----                     ---           ------
T0    User à /saved                    [A, B, C, D]              /saved        Shows A, B, C, D
      Sélectionne A, B, C              [A, B, C, D]              /saved        Compare btn active
      
T1    Click Compare                    [A, B, C, D]              /compare?ids=A,B,C  Montre A, B, C ✓

T2    User revient à /saved           [A, B, C, D]              /saved        
      Supprime B                       [A, C, D]                 /saved        Shows A, C, D
      
T3    User revient à /compare         [A, C, D]                 /compare?ids=A,B,C  
      ❌ Affiche A, C                 (B disparu!)              /compare?ids=A,B,C  Should show?
      
      Attendu: Redirect à /saved (B n'existe plus)
      Réalité: Silencieusement affiche moins d'offres
```

### Code Impacté
```
src/app/compare/page.tsx:
  - Line 18-34: selectedOffers meMo (filtrage depuis localStorage)
  - Line 34-38: Redirect check (basé sur count, pas validation)
  - Line 45+: No real-time sync
```

### Issues Identifiés
1. **URL source unique décalée**: URL knows A,B,C but DB doesn't
2. **Pas de validation côté serveur**: Compare page charge aveuglément
3. **Pas de notification utilisateur**: B disparaît en silence
4. **No real-time updates**: Page compare frozen

### Recommendation
**Priority**: 🔴 CRITICAL
**Timeline**: Week 15-16 (Phase 4, Task 4.1)
**Owner**: Frontend Engineer + Backend Engineer

```typescript
// ✅ SOLUTION (src/app/compare/page.tsx v2)
export default function ComparePage({ searchParams }) {
  const ids = searchParams.ids?.split(',') || [];
  
  // 1. Fetch depuis DB (source of truth), pas localStorage
  const { data: offers } = useSuspenseQuery({
    queryKey: ['offers', 'compare', ids],
    queryFn: async () => {
      const res = await fetch(`/api/offers?ids=${ids.join(',')}`);
      if (!res.ok) throw new Error('Offers not found');
      
      const data = await res.json();
      
      // 2. Validate: Tous les IDs trouvés?
      if (data.length !== ids.length) {
        // 3. Redirect si offres manquantes
        redirect(`/saved?missing=${ids.filter(id => !data.find(o => o.id === id)).join(',')}`);
      }
      
      return data;
    },
  });
  
  // ✓ Toujours synchronisé
  // ✓ Validation côté serveur
  // ✓ Clear error messaging
}

// Backend: src/app/api/offers/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll('ids[0]')?.split(',') || [];
  
  const offers = await db.offers.find({ _id: { $in: ids } });
  
  return Response.json(offers);
  // Retourne seulement les offres existantes
}
```

---

## 🟡 Problème #3: Projects Page Disconnected from Data

### Symptôme
Projects accumulate références à des searchs obsolètes. Sup deleting un search ne cascade-delete pas les projects associés.

### Root Cause
```typescript
// src/hooks/use-projects.ts
export interface Project {
  id: string;
  sourceIds: string[]; // ❌ Weak references!
  sources: SearchHistoryItem[];
  ...
}

// Problème:
// 1. sourceIds sont des strings
// 2. Si useSearchHistory() supprime un search
// 3. useProjects() n'a pas notification
// 4. Project garde orphan reference

// Scénario:
// Project A contains searches [S1, S2, S3]
// User deletes S2 from history
// Project A now has [S1, broken-S2, S3]
// ❌ No cascade validation
```

### Code Impacté
```typescript
// src/hooks/use-projects.ts (line 47-52)
const createProject = (name: string, description: string, sources) => {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: Date.now(),
    sourceIds: sources.map(s => s.id), // ❌ Loose references
    sources: sources,
    status: "active"
  }
  setProjects(prev => [newProject, ...prev])
};

// src/app/projects/page.tsx (line 25-32)
const { projects, createProject, deleteProject, syncProjectSources } = useProjects();
const { history, isLoading: historyLoading } = useSearchHistory();

useEffect(() => {
  if (!historyLoading && history.length > 0) {
    syncProjectSources(history); // ❌ Manual sync!
  }
}, [history, historyLoading, syncProjectSources]);
```

### Scenarios d'Incohérence

#### Scenario 1: Orphan References
```
T0: Create Project "Q1 Research"
    - sourceIds: [search-uuid-1, search-uuid-2]
    
T1: Delete search-uuid-1 from history
    - useSearchHistory() updates: [search-uuid-2]
    
T2: Open /projects
    - Project still shows sourceIds: [search-uuid-1, search-uuid-2]
    - search-uuid-1 not found in history
    - ❌ Broken reference
```

#### Scenario 2: Stale Data
```
T0: Create Project with 3 searches
    - Stale Time: undefined (rechargé à chaque reload)
    
T1: Update a search result
    - useSearchHistory() gets new data
    - useProjects() doesn't get notification
    
T2: Open /projects
    - Project shows old cached search results
    - ❌ Stale data
```

### Recommendation
**Priority**: 🟡 HIGH
**Timeline**: Week 16-18 (Phase 4, Task 4.2)
**Owner**: Backend Engineer

```typescript
// ✅ SOLUTION: MongoDB foreign keys + cascade

// MongoDB Collections:
db.projects.schema = {
  _id: ObjectId,
  userId: String,
  name: String,
  searches: [
    { searchId: ObjectId, addedAt: Date } // ← Real FK
  ],
  offers: [
    { offerId: ObjectId, savedAt: Date }  // ← Real FK
  ]
};

db.searches.schema = {
  _id: ObjectId,
  domain: String,
  results: Object,
  // ... other fields
};

// Avec MongoDB:
// ✓ Validation référentielle au insert
// ✓ Cascade delete possible
// ✓ Indexed lookups performants

// Frontend: src/hooks/use-projects.ts (v2)
export function useProjects() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then(r => r.json()),
  });

  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectDto) =>
      fetch('/api/projects', { 
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  // ✓ Server validates FKs
  // ✓ Auto-invalidation on history change
  // ✓ No orphan references
}

// Backend: src/app/api/projects/route.ts
export async function POST(req: Request) {
  const { name, description, searchIds } = await req.json();
  
  // Validate all searches exist
  const searches = await db.searches.find({ _id: { $in: searchIds } });
  if (searches.length !== searchIds.length) {
    return Response.json(
      { error: 'Some searches not found' },
      { status: 400 }
    );
  }
  
  // Insert with FKs
  const project = await db.projects.insertOne({
    name,
    description,
    searches: searchIds.map(id => ({ searchId: id, addedAt: new Date() })),
    userId: user.id,
    createdAt: new Date()
  });
  
  return Response.json(project);
}
```

---

## 🟡 Problème #4: Dashboard + Saved State Duplication

### Symptôm
`useDashboardState` et `useSavedOffers` font la même chose (save state → localStorage) mais indépendamment, créant des doublons.

### Root Cause
```typescript
// src/hooks/use-dashboard-state.ts
const [offersInput, setOffersInput] = useState(offersInput);
useEffect(() => {
  localStorage.setItem("offeranalyst_dashboard_state", JSON.stringify({
    offersInput, // ← Sauvegardé ici
    ...
  }));
}, [offersInput, ...]);

// src/hooks/use-saved-offers.ts
const [savedOffers, setSavedOffers] = useState([]);
useEffect(() => {
  localStorage.setItem("offeranalyst_saved_offers", JSON.stringify(savedOffers)); // ← Et ici
}, [savedOffers]);

// ❌ Problem:
// offersInput ≠ savedOffers
// One is text input, one is structured data
// No relationship between them
```

### Issues
1. **Dual state management**: offersInput (text) + savedOffers (array)
2. **No synchronization**: Editing one doesn't update the other
3. **Confusion in code**: 
   - Dashboard.offersInput = "raw JSON entered by user"
   - SavedOffers.savedOffers = "curated offers"
   - These are different concepts but treated same way

### Code Impacted
```
src/hooks/
├── use-dashboard-state.ts    ← Manage offersInput (ephemeral)
├── use-saved-offers.ts       ← Manage savedOffers (persistent)
  
src/app/page.tsx:
  - useDashboardState() { offersInput, ... }
  - useSavedOffers() { saveOffer() } but savedOffers not used!
  
src/components/offers/ConfigurationCard.tsx:
  - offersInput textarea (raw)
  - Not connected to saved offers
```

### Recommendation
**Priority**: 🟡 MEDIUM
**Timeline**: Week 17-18 (Phase 4, Task 4.3)
**Owner**: Frontend Engineer Lead

```typescript
// ✅ SOLUTION: Clear separation of concerns

// 1. User Input (Ephemeral) - stays in useDashboardState
export function useDashboardState() {
  const [offersInput, setOffersInput] = useState('[]');
  const [criteria, setCriteria] = useState('');
  // ... other ephemeral state
  
  // These are NOT persisted - they're session-specific
}

// 2. Saved Offers (Persistent) - React Query
export function useSavedOffers() {
  return useSuspenseQuery({
    queryKey: ['offers', 'saved'],
    queryFn: () => fetch('/api/offers/saved').then(r => r.json()),
  });
}

// 3. Dashboard renders both separately:
export default function Home() {
  const dashboardState = useDashboardState();
  const { data: savedOffers } = useSavedOffers();
  
  return (
    <>
      <ConfigurationCard
        offersInput={dashboardState.offersInput}
        setOffersInput={dashboardState.setOffersInput}
      />
      
      <ResultsSection
        savedOffers={savedOffers}  // ← From server
      />
    </>
  );
}
```

---

## 🟡 Problème #5: History Restore Flow Broken

### Symptom
Restoring search from /history to / doesn't reliably restore state.

### Root Cause
```typescript
// src/app/history/page.tsx
const handleRestoreSearch = (item: SearchHistoryItem) => {
  sessionStorage.setItem('restore_search', JSON.stringify(item)); // ❌ sessionStorage!
  router.push('/');
};

// src/hooks/use-restore-search.ts
export function useRestoreSearch({ setDomain, setExplicitCriteria, ... }) {
  useEffect(() => {
    const item = sessionStorage.getItem('restore_search');
    if (item) {
      const parsed = JSON.parse(item);
      // Only if coming from history?
      setDomain(parsed.inputs.domain);
      setExplicitCriteria(parsed.inputs.criteria);
      sessionStorage.removeItem('restore_search');
    }
  }, []);
}

// ❌ Problems:
// 1. sessionStorage !== localStorage (different DOM context)
// 2. If user opens new tab, sessionStorage empty
// 3. Race conditions: both pages read/write sessionStorage
// 4. No validation: restored state might be invalid
```

### Scenarios
```
Scenario 1: sessionStorage Cleared
  T0: User at /history
  T1: Click "Restore" → sessionStorage['restore_search'] set
  T2: Router.push('/') 
  T3: New page mount
  T4: sessionStorage['restore_search'] might be cleared (browser policy)
  T5: useRestoreSearch() finds nothing ❌
  
Scenario 2: New Tab
  T0: User opens /history in Tab A
  T1: Click "Restore"
  T2: sessionStorage set in Tab A
  T3: Router.push('/') navigates Tab A
  T4: If user opens new tab with / → sessionStorage empty ❌
```

### Recommendation
**Priority**: 🟡 MEDIUM
**Timeline**: Week 8 (Phase 2, Task 2.2)
**Owner**: Frontend Engineer

```typescript
// ✅ SOLUTION: URL-based state transfer

// src/app/history/page.tsx
const handleRestoreSearch = (item: SearchHistoryItem) => {
  // Encode state into URL params
  const params = new URLSearchParams({
    domain: item.inputs.domain,
    criteria: item.inputs.criteria,
    context: item.inputs.context,
    restore: 'true'
  });
  
  router.push(`/?${params.toString()}`);
};

// src/hooks/use-restore-search.ts
export function useRestoreSearch() {
  const searchParams = useSearchParams();
  const dashboard = useDashboardState();
  
  useEffect(() => {
    if (searchParams.get('restore') === 'true') {
      dashboard.setDomain(searchParams.get('domain') || '');
      dashboard.setExplicitCriteria(searchParams.get('criteria') || '');
      dashboard.setImplicitContext(searchParams.get('context') || '');
      
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);
}

// ✓ URL params persist across tabs
// ✓ No sessionStorage state pollution
// ✓ Shareable links as bonus
```

---

## Summary Table: Issues & Fixes

| # | Issue | Severity | Pages Affected | Fix Phase | Owner | Effort |
|---|-------|----------|----------------|-----------|-------|--------|
| 1 | State Silos | 🔴 CRITICAL | All | Phase 2 | Frontend | 5 days |
| 2 | Compare Incohérent | 🔴 CRITICAL | Compare | Phase 4 | Frontend+Backend | 3 days |
| 3 | Projects Orphans | 🟡 HIGH | Projects | Phase 4 | Backend | 4 days |
| 4 | Dashboard Duplication | 🟡 MEDIUM | Dashboard/Saved | Phase 4 | Frontend | 3 days |
| 5 | History Restore | 🟡 MEDIUM | History/Dashboard | Phase 2 | Frontend | 2 days |

---

## Implementation Priorities

### Week 1-2: Quick Wins
1. ✅ Fix History Restore (sessionStorage → URL params)
2. ✅ Add compare button validation

### Week 5-9: Major Refactor
1. ✅ React Query setup
2. ✅ Migrate useSavedOffers
3. ✅ Migrate useSearchHistory
4. ✅ Fix useDashboardState

### Week 15-18: Final Fixes
1. ✅ Fix Compare page server-fetch
2. ✅ Fix Projects orphan references
3. ✅ Unified error handling

---

## Testing Checklist

- [ ] **State Silos**: Verify all pages see same savedOffers data
- [ ] **Compare**: Delete offer while viewing compare, verify redirect
- [ ] **Projects**: Delete search, verify projects don't show orphan
- [ ] **History**: Restore from history, verify all fields restored
- [ ] **Dashboard**: Save offer, verify appears in Saved immediately
- [ ] **Cross-tab**: Open 2 tabs, save offer in one, verify appears in other
- [ ] **Offline**: Disable network, verify cached data loads, enable, verify sync

---

**Next Step**: Validation with team → Démarrage Phase 2 (Week 5)
