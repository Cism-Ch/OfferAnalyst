# OfferAnalyst - Feuille de Route 2026 : Architecture & Intégration
## Modernisation avec Tigris & MongoDB

---

## 🎯 Executive Summary

Ce document trace la stratégie de transformation architecturale de OfferAnalyst pour passer d'une stack **localStorage-only** à une architecture **cloud-native full-stack** avec:
- **Backend Data Store**: MongoDB (données métier)
- **Search & Analytics**: Tigris (indexation & recherche)
- **Architecture**: Event-driven avec synchronisation bidirectionnelle

**Objectif Principal**: Éliminer les incohérences de communication des données entre pages et créer un système de référentiel unique (Single Source of Truth).

---

## 📋 Équipe de Spécialistes Requise

### 1. **Architect Cloud & Data (Lead)**
- Responsabilités:
  - Design de l'architecture globale (client/server/database)
  - Stratégie de synchronisation offline-first
  - Patterns de cache et invalidation
  - Sécurité des données et authentification
- Priorité: **Critique** (P0)
- Tâches clés:
  - [ ] Définir le schema MongoDB avec versioning
  - [ ] Concevoir les APIs RESTful/GraphQL
  - [ ] Implémenter le système de cache avec React Query

### 2. **Backend Engineer (Node.js/TypeScript)**
- Responsabilités:
  - Implémenter les APIs serveur (Next.js App Router)
  - Intégration MongoDB & Tigris
  - Gestion des transactions et événements
  - Tests d'intégration
- Priorité: **Critique** (P0)
- Tâches clés:
  - [ ] Créer les route handlers RESTful
  - [ ] Implémenter les migrations MongoDB
  - [ ] Synchronisation Tigris en temps réel

### 3. **Frontend Engineer (React/TypeScript)**
- Responsabilités:
  - Migration des hooks vers une architecture serveur
  - Implémentation du système de state management unifié
  - Gestion du cache client
  - Tests d'UI et d'intégrité des données
- Priorité: **Critique** (P0)
- Tâches clés:
  - [ ] Remplacer localStorage par une architecture serveur
  - [ ] Implémenter React Query pour le cache distribué
  - [ ] Créer des composants côté serveur

### 4. **DevOps & Infrastructure Engineer**
- Responsabilités:
  - Configuration MongoDB Atlas ou auto-hébergé
  - Configuration Tigris Cloud
  - CI/CD pipeline amélioré
  - Monitoring et observabilité
- Priorité: **Élevée** (P1)
- Tâches clés:
  - [ ] Configurer MongoDB avec replication
  - [ ] Mettre en place Tigris indexing
  - [ ] GitHub Actions pour déploiement

### 5. **QA & Test Automation**
- Responsabilités:
  - Tests d'intégration end-to-end
  - Tests de synchronisation des données
  - Scénarios de régression
  - Validation de la cohérence cross-page
- Priorité: **Élevée** (P1)
- Tâches clés:
  - [ ] Suite de tests Cypress pour les workflows
  - [ ] Tests de synchronisation temps réel
  - [ ] Tests des cas limites

---

## 🏗️ Architecture Cible

### Architecture Actuelle (Problèmes)
```
┌─────────────────────────────────────────────┐
│          Next.js Pages (Siloed)             │
├─────────────────────────────────────────────┤
│  Dashboard  │  Saved  │  History  │ Compare │
├─────────────────────────────────────────────┤
│            localStorage (Isolé)             │
│  - useSavedOffers                           │
│  - useSearchHistory                         │
│  - useDashboardState                        │
│  - useProjects                              │
└─────────────────────────────────────────────┘

❌ Problème: Chaque page a son propre état local
❌ Synchronisation manuelle entre pages
❌ Incohérences lors de navigation
```

### Architecture Nouvelle (Solution)
```
┌──────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
├──────────────┬──────────────┬──────────────┬──────────────┤
│ Dashboard    │  Saved       │  History     │  Compare     │
│ /            │  /saved      │  /history    │  /compare    │
├──────────────┴──────────────┴──────────────┴──────────────┤
│                React Query + Suspense                      │
│           (Centralized Caching & Revalidation)             │
├──────────────────────────────────────────────────────────┤
│          Server Actions (Next.js 14+)                     │
│  - useOfferData()     - useSearches()                      │
│  - useSavedOffers()   - useHistory()                       │
└──────────────┬───────────────────────────┬────────────────┘
               │                           │
        ┌──────▼──────────┬────────────────▼──────┐
        │  API Routes     │   Webhooks            │
        │  /api/*         │   Event Bus           │
        └──────┬──────────┴────────────┬──────────┘
               │                       │
    ┌──────────▼────────┐    ┌────────▼─────────┐
    │   MongoDB Atlas   │    │   Tigris Cloud   │
    │  (Source of Truth)│    │  (Search Index)  │
    │                  │    │                  │
    │ Collections:     │    │ Indexes:         │
    │ - offers         │    │ - offers_search  │
    │ - searches       │    │ - history_search │
    │ - projects       │    │                  │
    │ - audit_logs     │    │                  │
    └──────┬───────────┘    └──────────────────┘
           │
    ┌──────▼──────────────┐
    │   Event Streaming   │
    │   (Pub/Sub Pattern) │
    │                     │
    │ Events:            │
    │ - offer.saved      │
    │ - search.completed │
    │ - history.updated  │
    └─────────────────────┘
```

---

## 📊 Problèmes Identifiés & Solutions

### Problème 1: Siloisage des États (State Silos)
**Impact**: Incohérence entre pages, impossibilité de synchroniser les données sauvegardées

```typescript
// ❌ ACTUELLEMENT (Problématique)
// src/hooks/use-saved-offers.ts
const [savedOffers, setSavedOffers] = useState<Offer[]>([]);
// localStorage["offeranalyst_saved_offers"]

// Dashboard: voir les offres sauvegardées ≠ Saved page
// Compare: charge depuis URL params, pas synchronisé avec Saved

// Même hook utilisé partout, mais états divergent à la navigation
```

**Solution**: Centralisé Server-First avec React Query
```typescript
// ✅ NOUVEAU
// src/app/api/offers/saved/route.ts
export async function GET() {
  const offers = await db.offers.find({ saved: true });
  return Response.json(offers);
}

// src/hooks/use-saved-offers.ts
export function useSavedOffers() {
  const { data } = useSuspenseQuery({
    queryKey: ['offers', 'saved'],
    queryFn: () => fetch('/api/offers/saved').then(r => r.json())
  });
  return data;
}
// ✓ Synchronisé partout (Dashboard, Saved, Compare, History)
```

### Problème 2: Historique Non Persistant
**Impact**: Perte de recherches, contexte oublié entre sessions

```typescript
// ❌ ACTUELLEMENT
const [history, setHistory] = useState<SearchHistoryItem[]>([]);
// Limité à 50 items, pas de backup, volonté inefficace

// Limitations:
// - MAX_HISTORY = 50 (trop peu)
// - Pas de pagination
// - Pas de search full-text
// - Pas d'exports
```

**Solution**: MongoDB comme source de vérité
```typescript
// ✅ NOUVEAU: src/app/api/history/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const query = searchParams.get('q');
  
  // MongoDB query + Tigris full-text search
  const results = await db.collection('searches')
    .find(query ? { $text: { $search: query } } : {})
    .skip((Number(page) - 1) * 20)
    .limit(20)
    .sort({ timestamp: -1 });
  
  return Response.json(results);
}
```

### Problème 3: Pas de Audit Trail
**Impact**: Impossible de retracer qui a fait quoi, quand, et pourquoi

```typescript
// ❌ ACTUELLEMENT: Pas de logs
// Les modifications sont silencieuses

// ✅ NOUVEAU: Audit complet
db.collection('audit_logs').insertOne({
  userId: user.id,
  action: 'offer.saved',
  offerId: offer.id,
  timestamp: Date.now(),
  metadata: { userAgent, ip }
});
```

### Problème 4: Incohérence Compare Page
**Impact**: Données inconsistantes entre savedOffers et compare?ids=

```typescript
// ❌ ACTUELLEMENT (src/app/compare/page.tsx)
const { savedOffers } = useSavedOffers();
const selectedOffers = useMemo(() => {
  const idsParam = searchParams.get('ids'); // URL params
  // Mismatch: selectedIds !== savedOffers si changements dans autre page
}, [searchParams, savedOffers]);

// Scénario: 
// 1. User va à /saved, sélectionne offres A, B, C
// 2. Navigate à /compare?ids=A,B,C
// 3. Reviens à /saved et supprime C
// 4. Retour à /compare: A,B,C toujours affichés mais C plus dans savedOffers!
```

**Solution**: URL de source unique
```typescript
// ✅ NOUVEAU: src/app/compare/page.tsx
export default async function ComparePage({ searchParams }) {
  const offerIds = searchParams.ids.split(',');
  
  // Fetch direkt depuis DB, pas depuis localStorage
  const offers = await fetch(`/api/offers?ids=${offerIds.join(',')}`);
  
  // ✓ Toujours synchronisé avec DB
}
```

### Problème 5: Projects Page Non Connectée à Dashboard
**Impact**: Projects accumulent données obsolètes, pas de synchronisation

```typescript
// ❌ ACTUELLEMENT
// useProjects() charge depuis localStorage
// Mais les données proviennent de useSearchHistory()
// Si history change, projects ne se mettent pas à jour

const [projects, setProjects] = useState<Project[]>([]);
// sourceIds: string[] - Références cassées si history.clear()
```

**Solution**: Relations normalisées
```typescript
// ✅ NOUVEAU: MongoDB schemas
// projects collection
{
  _id: ObjectId,
  name: "Q1 2026 Recruitment",
  description: "...",
  createdAt: ISODate,
  searches: [
    {
      searchId: ObjectId, // Foreign key -> searches collection
      addedAt: ISODate
    }
  ],
  offers: [
    {
      offerId: ObjectId,
      savedAt: ISODate
    }
  ]
}

// ✓ Intégrité référentielle garantie par DB
// ✓ Cascade deletes automatiques
```

---

## 🛣️ Feuille de Route Détaillée (Q1-Q2 2026)

### Phase 1: Infrastructure & Setup (Semaines 1-4)
**Objectif**: Préparer la base pour les phases suivantes

#### Tâche 1.1: Configuration MongoDB
- [ ] Créer compte MongoDB Atlas (ou auto-hébergé)
- [ ] Configurer replica set (haute disponibilité)
- [ ] Définir schemas avec Mongoose
- [ ] Configurer backup automatiques
- **Owner**: DevOps Engineer
- **Duration**: 5 jours
- **Deliverable**: `src/lib/db/schemas.ts`

```typescript
// src/lib/db/schemas.ts
import { Schema } from 'mongoose';

export const OfferSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  description: String,
  price: Schema.Types.Mixed,
  location: String,
  category: String,
  url: String,
  saved: { type: Boolean, default: false },
  savedAt: Date,
  source: String, // 'fetched' ou 'manual'
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SearchSchema = new Schema({
  domain: String,
  criteria: String,
  context: String,
  results: Schema.Types.Mixed,
  pinned: { type: Boolean, default: false },
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

export const AuditLogSchema = new Schema({
  userId: String,
  action: String, // 'offer.saved', 'search.run', etc.
  resourceId: String,
  resourceType: String,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
```

#### Tâche 1.2: Configuration Tigris
- [ ] Créer projet Tigris
- [ ] Définir indexes de recherche
- [ ] Implémenter sync MongoDB → Tigris
- [ ] Configurer webhooks
- **Owner**: Backend Engineer
- **Duration**: 4 jours
- **Deliverable**: `src/lib/tigris/config.ts`

```typescript
// src/lib/tigris/config.ts
import { Tigris } from '@tigrisdata/core';

export const tigrisClient = new Tigris();

export async function initializeTigrisIndexes() {
  await tigrisClient.getIndex('offers').create({
    name: 'offers_search',
    schema: {
      title: { type: 'string', searchable: true },
      description: { type: 'text', searchable: true },
      category: { type: 'string', facet: true },
      price: { type: 'number' },
      location: { type: 'string', facet: true }
    }
  });
}
```

#### Tâche 1.3: Setup API Routes
- [ ] Créer structure `/api` (CRUD operations)
- [ ] Implémenter middleware d'authentification (stub)
- [ ] Rate limiting
- **Owner**: Backend Engineer
- **Duration**: 6 jours
- **Deliverable**: `src/app/api/` structure

```
src/app/api/
├── offers/
│   ├── route.ts           # GET /api/offers (list + search)
│   ├── [id]/
│   │   ├── route.ts       # GET/PUT/DELETE /api/offers/[id]
│   │   └── saved/
│   │       └── route.ts   # PUT /api/offers/[id]/saved
│   └── saved/
│       └── route.ts       # GET /api/offers/saved
├── searches/
│   ├── route.ts           # GET/POST /api/searches
│   └── [id]/
│       └── route.ts       # GET/DELETE
├── projects/
│   ├── route.ts           # GET/POST
│   └── [id]/
│       └── route.ts       # GET/PUT/DELETE
└── health/
    └── route.ts           # Health check
```

---

### Phase 2: Migration Hooks (Semaines 5-9)
**Objectif**: Passer des hooks localStorage vers React Query serverState

#### Tâche 2.1: Implement React Query Setup
- [ ] Installer @tanstack/react-query
- [ ] Configurer QueryClientProvider dans layout
- [ ] Créer query key factory
- [ ] Implémenter stale-while-revalidate
- **Owner**: Frontend Engineer
- **Duration**: 3 jours
- **Deliverable**: `src/lib/query/config.ts`

```typescript
// src/lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min
      gcTime: 30 * 60 * 1000,   // 30min
      retry: 2,
      retryDelay: exponentialBackoff,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  all: ['offers'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: any) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  
  searches: () => ['searches'] as const,
  searchList: (page: number) => [...queryKeys.searches(), { page }] as const,
};
```

#### Tâche 2.2: Refactor useSavedOffers
- [ ] Créer `src/hooks/use-saved-offers.ts` (version React Query)
- [ ] Implémenter optimistic updates
- [ ] Tester synchronisation cross-tab
- **Owner**: Frontend Engineer
- **Duration**: 5 jours
- **Deliverable**: Nouveaux hooks

```typescript
// src/hooks/use-saved-offers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useSavedOffers() {
  const queryClient = useQueryClient();
  
  const { data: savedOffers = [], isLoading } = useQuery({
    queryKey: ['offers', 'saved'],
    queryFn: () => fetch('/api/offers/saved').then(r => r.json()),
  });

  const saveOfferMutation = useMutation({
    mutationFn: (offer: Offer) =>
      fetch(`/api/offers/${offer.id}/saved`, { method: 'PUT' }),
    onMutate: async (offer) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['offers', 'saved'] });
      const previous = queryClient.getQueryData(['offers', 'saved']);
      queryClient.setQueryData(['offers', 'saved'], (old: Offer[]) => [...old, offer]);
      return { previous };
    },
    onError: (err, newOffer, context) => {
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
```

#### Tâche 2.3: Refactor useSearchHistory
- [ ] Implémenter pagination
- [ ] Ajouter recherche full-text (Tigris)
- [ ] Implémenter pin/restore
- **Owner**: Frontend Engineer
- **Duration**: 5 jours

#### Tâche 2.4: Refactor useDashboardState
- [ ] Séparer: state ephemeral (session) vs persistent
- [ ] User preferences → MongoDB
- [ ] Configurer hydration correcte
- **Owner**: Frontend Engineer
- **Duration**: 4 jours

---

### Phase 3: Data Consistency & Synchronization (Semaines 10-14)
**Objectif**: Garantir la cohérence des données

#### Tâche 3.1: Implement Event Bus
- [ ] Setup Pub/Sub pattern (Redis ou DB polling)
- [ ] Event schemas (Zod validation)
- [ ] Webhooks pour real-time sync
- **Owner**: Backend Engineer
- **Duration**: 6 jours

```typescript
// src/lib/events/types.ts
import { z } from 'zod';

export const OfferSavedEvent = z.object({
  type: z.literal('offer.saved'),
  offerId: z.string(),
  userId: z.string(),
  timestamp: z.number(),
});

export const SearchCompletedEvent = z.object({
  type: z.literal('search.completed'),
  searchId: z.string(),
  resultCount: z.number(),
  duration: z.number(),
});
```

#### Tâche 3.2: Cross-Tab Synchronization
- [ ] Broadcast Channel API ou WebSocket
- [ ] Synchroniser state entre onglets
- [ ] Test scenarios
- **Owner**: Frontend Engineer
- **Duration**: 4 jours

```typescript
// src/lib/sync/broadcast.ts
export function useBroadcastSync() {
  useEffect(() => {
    const channel = new BroadcastChannel('offer-analyst-sync');
    
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SAVED_OFFER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['offers', 'saved'] });
      }
    };
    
    return () => channel.close();
  }, []);
}
```

#### Tâche 3.3: Data Validation Layer
- [ ] Schemas partagés client/server
- [ ] Type-safe API contracts
- [ ] Zod integration testing
- **Owner**: Backend Engineer
- **Duration**: 5 jours

---

### Phase 4: UI Consistency & Fix Incohérences (Semaines 15-18)
**Objective**: Fixer les problèmes de communication entre pages

#### Tâche 4.1: Unify Compare Page
- [ ] Charger offers depuis DB, pas URL params uniquement
- [ ] Implémenter bidirectional sync
- [ ] Tester scénarios edge cases
- **Owner**: Frontend Engineer
- **Duration**: 3 jours

```typescript
// src/app/compare/page.tsx (NEW)
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

export default function ComparePage({ searchParams }) {
  const ids = searchParams.ids?.split(',') || [];
  
  const { data: offers } = useSuspenseQuery({
    queryKey: ['offers', 'compare', ids],
    queryFn: () => 
      fetch(`/api/offers?ids=${ids.join(',')}`).then(r => r.json()),
  });
  
  // ✓ Toujours à jour avec DB
  // ✓ Même données que /saved
}
```

#### Tâche 4.2: Fix Projects Page
- [ ] Implémenter OneToMany relationships (MongoDB)
- [ ] Auto-sync when history updated
- [ ] Cascade deletes
- **Owner**: Backend Engineer
- **Duration**: 4 jours

#### Tâche 4.3: Unified Dashboard
- [ ] Centraliser state management
- [ ] Single fetching source
- [ ] Real-time refresh
- **Owner**: Frontend Engineer
- **Duration**: 3 jours

---

### Phase 5: Testing & Quality (Semaines 19-20)
**Objective**: Validation complète et hardening

#### Tâche 5.1: E2E Tests (Cypress)
- [ ] Workflows complets (dashboard → save → history → compare)
- [ ] Cross-page synchronization
- [ ] Offline scenarios
- **Owner**: QA Engineer
- **Duration**: 5 jours

```typescript
// e2e/offer-workflow.cy.ts
describe('Complete Offer Workflow', () => {
  it('should sync offer across all pages', () => {
    cy.visit('/');
    cy.get('[data-testid="start-workflow"]').click();
    cy.get('[data-testid="offer-card"]').first().then($card => {
      cy.wrap($card).find('[data-testid="save-btn"]').click();
      cy.visit('/saved');
      cy.contains($card.find('[data-testid="title"]').text());
    });
  });
});
```

#### Tâche 5.2: Data Integrity Tests
- [ ] Validation schemas
- [ ] Missing data scenarios
- [ ] Concurrent modifications
- **Owner**: QA Engineer
- **Duration**: 3 jours

#### Tâche 5.3: Performance Optimization
- [ ] Query optimization
- [ ] Index tuning
- [ ] Cache invalidation strategy
- **Owner**: DevOps Engineer + Backend
- **Duration**: 4 jours

---

## 📈 Métriques de Succès

| Métrique | Baseline | Target | Critère |
|----------|----------|--------|---------|
| **Coherence Score** | 0% (localStorage) | 100% (single source) | Toutes pages syncronisées |
| **Data Stale Time** | N/A | < 1s | Real-time updates |
| **Cross-page Sync** | Manual | Automatic | Events-driven |
| **History Size** | 50 items | Unlimited | MongoDB pagination |
| **Search Latency** | N/A | < 200ms | Tigris indexing |
| **API Availability** | N/A | 99.9% | MongoDB + replicas |
| **Test Coverage** | ~30% | >80% | E2E + Unit + Integration |

---

## 💰 Estimation Ressources

### Timeline Total
- **Phase 1**: 4 semaines (Setup)
- **Phase 2**: 5 semaines (Migration)
- **Phase 3**: 5 semaines (Sync)
- **Phase 4**: 4 semaines (UI Fixes)
- **Phase 5**: 2 semaines (Testing)
- **TOTAL**: **20 semaines** (5 mois)

### Team Composition
```
Full-time: 4-5 people
├─ 1x Cloud Architect (Lead)
├─ 2x Backend Engineers
├─ 1x Frontend Engineer (Lead)
└─ 1x DevOps Engineer

Part-time: 1-2 people
├─ 1x QA Automation
└─ 0.5x Product Manager (optional)
```

### Coûts Infrastructure (Estimé)
```
MongoDB Atlas:
  - Free tier: $0/mo (dev)
  - Pro: $57/mo (prod, 2GB)
  
Tigris:
  - Free tier: $0/mo (dev)
  - Pro: $25/mo (prod)
  
Vercel (Next.js):
  - Pro: $20/mo

Total: ~$100-150/mo (production)
```

---

## 🚀 Mise en Œuvre Immédiate

### Semaines 1-2: Quick Win (Préparation)

**Spécialiste**: Architect + Backend Lead

1. **Créer la structure API skeleton**
   ```bash
   mkdir -p src/app/api/{offers,searches,projects}
   touch src/app/api/health/route.ts
   ```

2. **Définir les types partagés**
   ```typescript
   // src/types/api.ts
   export interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: { message: string; code: string };
     meta?: { timestamp: number };
   }
   ```

3. **Implémenter health check API**
   ```typescript
   // src/app/api/health/route.ts
   export async function GET() {
     return Response.json({ status: 'ok', timestamp: Date.now() });
   }
   ```

4. **Documenter schemas MongoDB**
   ```typescript
   // docs/MONGODB_SCHEMAS.md
   // [Document avec les schemas)
   ```

---

## 📋 Checklist de Décisions Architecturales

- [ ] **Database**: MongoDB Atlas vs Auto-hébergé?
- [ ] **Search**: Tigris vs Elasticsearch vs Algolia?
- [ ] **Auth**: NextAuth.js vs Supabase vs Custom?
- [ ] **Cache**: Redis vs Memcached vs In-memory?
- [ ] **Real-time**: WebSocket vs Server-Sent Events?
- [ ] **Event Bus**: Redis Pub/Sub vs Database polling?
- [ ] **Deployment**: Vercel vs Self-hosted?

---

## 🔄 Synchronisation Avec Équipe

### Réunions Recommandées
- **Weekly Standup**: Mardi 10h00 (15 min) - État général
- **Architecture Review**: Mercredi 14h00 (30 min) - Décisions bloquantes
- **Testing Session**: Vendredi 16h00 (30 min) - Demo & blockers

### Documentation à Maintenir
- [ ] API Documentation (OpenAPI/Swagger)
- [ ] Database Schema Docs (Miro/Excalidraw)
- [ ] Deployment Runbook
- [ ] Troubleshooting Guide

---

## 🎓 Knowledge Transfer

### Sessions de Formation (Mandatory)
1. **MongoDB for Node.js Developers** (4h)
2. **React Query Deep Dive** (3h)
3. **API Design Best Practices** (2h)
4. **Testing Strategies** (3h)

### Ressources Disponibles
- [MongoDB Docs](https://docs.mongodb.com)
- [React Query Guide](https://tanstack.com/query/latest)
- [Tigris Documentation](https://www.tigrisdata.com/docs)
- [Next.js 14 API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 📞 Points de Contact

**Architecture Lead** (Architect Cloud & Data)
- Décisions structurelles
- Reviews de design
- Escalation blockers

**Backend Lead** (Backend Engineer Senior)
- Implémentation APIs
- Intégration DB
- Performance tuning

**Frontend Lead** (React/TypeScript Expert)
- Hooks design
- Component architecture
- UX consistency

---

## Version & Historique

| Version | Date | Auteur | Changements |
|---------|------|--------|------------|
| 1.0 | 2026-01-11 | AI Copilot | Initial roadmap |

---

**Prochain Checkpoint**: Validation équipe → Démarrage Phase 1
