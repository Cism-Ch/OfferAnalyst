# 🚀 OfferAnalyst Premium Roadmap 2026
## Transformation vers une SaaS Premium 10k$ Website

---

## 📋 Executive Summary

**Vision** : Transformer OfferAnalyst en une **plateforme SaaS premium** avec design world-class, agentic workflows optimisés, authentification robuste, et monétisation légère (Free forever + BYO API keys + pourboires café).

**Investissement** : ~800-1200 heures de développement (8-12 semaines, 1-2 devs senior)

**Résultat** : Produit prêt pour production avec landing page, onboarding, dashboards avancés, système de crédits API, et support multi-modèles IA.

---

## 🎯 Phase 0 : Fondations Infrastructure (Semaine 1-2)

### 0.1 Database & Migrations
- [ ] **Activer MongoDB + Prisma**
  - Installer Prisma client (`pnpm add prisma @prisma/client`)
  - Écrire schemas complets pour `User`, `Profile`, `APIKey`, `Subscription`, `SearchHistory`, `SavedOffers`, `ProjectWorkspace`, `Credits`
  - Migrer données localStorage → MongoDB (script de migration)
  - Ajouter indexes MongoDB pour performances (userId, email, createdAt)

- [ ] **Fixture Data & Seeds**
  - Script seed avec utilisateurs test, offres, historiques
  - Test de chaque migration
  - Backup strategy

### 0.2 Authentication Foundation (Better-Auth)
- [ ] **Setup Better-Auth complet**
  - Configurer Better-Auth v1 avec MongoDB adapter
  - Ajouter OAuth providers : Google, GitHub (+ optionnel: LinkedIn, Microsoft)
  - Configuration du secret et middlewares
  - TOTP/2FA support pour accès premium
  - Email verification workflow

- [ ] **Middleware de protection**
  - Middleware.ts pour vérifier authentification
  - Route guards côté serveur (Server Actions)
  - Session management (cookies sécurisés)
  - Rate limiting par utilisateur

### 0.3 Architecture d'Erreurs & Logging
- [ ] **Logging local et privacy-first**
  - Utiliser Pino (console/file) sans transport externe (pas de Sentry/LogRocket)
  - Tracer les erreurs AI/API/DB avec correlation IDs en interne
  - Dashboards locaux (Next.js instrumentation) pour uptime/latence/erreurs
  - Garder les logs épurés pour limiter les coûts et la surface RGPD

---

## 🎨 Phase 1 : Design System Premium (Semaine 2-3)

### 1.1 Design Tokens & Theme Orchestration
- [ ] **Étendre Tailwind v4 avec tokens premium**
  - Ajouter gradients luxury (golds, silvers, neons)
  - Animations premium avec Framer Motion
  - Spacing scale cohérent (4px baseline)
  - Typography hiérarchie (Satoshi, Inter, ou Geist)
  - Créer 5+ themes complets (Light, Dark, Gold, Ocean, Forest)

- [ ] **Composants shadcn/ui étendus + Base UI**
  - Installer Base UI (`@base-ui/react`)
  - Créer `PremiumButton`, `PremiumCard`, `PremiumInput` avec animations
  - Storybook pour showcase (optional mais recommandé)

### 1.2 Framer Motion Animations
- [ ] **Installer Framer Motion** (`pnpm add framer-motion`)
- [ ] **Créer motion library**
  - Transition presets (smooth, bounce, spring)
  - Page transitions (fade, slide, zoom)
  - Hover effects sur cards
  - Loading states avec skeleton animations
  - Parallax scrolling sur landing page

### 1.3 Responsive Design Mobile-First
- [ ] **Breakpoints cohérents**
  - Mobile: 320px-640px
  - Tablet: 641px-1024px
  - Desktop: 1025px+
- [ ] **Touch-first interactions**
  - Buttons ≥ 48px
  - Swipe gestures (carousel, drawer)
  - Mobile menu sidebar avec Framer Motion

---

## 🔐 Phase 2 : Authentification & Onboarding (Semaine 3-4)

### 2.1 Pages d'Auth (Composants Réutilisables)
- [ ] **Login Page** (`/auth/login`)
  - Form avec email/password validation
  - OAuth buttons (Google, GitHub)
  - "Forgot password" flow
  - Link vers signup
  - Error handling avec toasts

- [ ] **Signup Page** (`/auth/signup`)
  - Multi-step form : Email → Password → Profile → Company (optional)
  - Validation email (envoi confirm link)
  - Terms & Privacy acceptance
  - Auto-login après signup
  - Redirect vers onboarding

- [ ] **Reset Password Flow** (`/auth/reset`)
  - Request reset via email
  - Email with unique token
  - New password form
  - Success confirmation

- [ ] **Email Verification** (`/auth/verify`)
  - Envoi via Resend (free tier) pour rester simple
  - Cooldown simple côté serveur
  - Token expiration (24h)

### 2.2 Onboarding Pro (5-step wizard)
- [ ] **Step 1 : Welcome**
  - Animation Framer Motion (pas de vidéo hébergée)
  - Key features overview
  - CTA pour continuer

- [ ] **Step 2 : Use Case Selection**
  - Liste: Real Estate / Jobs / Startups / E-commerce / Other and more
  - Personalized pitch pour chaque use case

- [ ] **Step 3 : API Key Setup**
  - Afficher les clés intégrées de dev/test déjà hardcodées (lecture seule)
  - Permettre d'ajouter ses propres API keys (BYOK) par provider
  - Recommander 1-2 modèles utiles par workflow (éviter les modèles non pertinents)
  - Document link vers guide API
  - Toggle pour masquer/afficher clé

- [ ] **Step 4 : First Search**
  - Pre-filled example (Real Estate, Tech Jobs)
  - Run analyze action avec free tier
  - Show results live
  - Celebration animation

- [ ] **Step 5 : Support CTA**
  - Rappeler le mode Free forever + BYOK
  - Bouton « Buy me a coffee » pour soutien volontaire
  - Skip button

---

## 🏢 Phase 3 : Dashboard Utilisateur Premium (Semaine 4-5)

### 3.1 Dashboard Layout Refactor
- [ ] **Nouvelle structure de dashboard**
  - Top navigation bar avec avatar, notifications, settings
  - Collapsible sidebar avec sections : Analyze, History, Projects, Settings
  - Main content area responsive
  - Right panel pour contextual info

### 3.2 API Key Management Interface
- [ ] **API Keys Page** (`/dashboard/api-keys`)
  - Table : Nom, Key (masked), Created, Last Used, Actions (Copy, Delete, Regenerate)
  - Create New Key modal avec nom + permissions (Read, Write, Admin)
  - Usage stats par clé (requests/month, bandwidth)
  - Webhooks configuration (optional Phase 2)
  - Rate limits display (Free: 100/day, Pro: 5000/day)

### 3.3 Advanced Data Visualization
- [ ] **Analytics Dashboard** (`/dashboard/analytics`)
  - Cards KPI : Searches, Results Found, Avg Score, Saved Offers
  - Graphs (Recharts / Chart.js)
    - Searches over time (line chart)
    - Top categories (pie chart)
    - Score distribution (histogram)
    - Model usage (stacked bar)
  - Date range filter (Last 7/30/90 days)
  - Export as CSV/PDF

### 3.4 Workspace & Settings
- [ ] **Workspace Settings** (`/dashboard/workspace`)
  - Team members management (invite, roles: Admin/Editor/Viewer)
  - Workspace name (sans upload de logo pour rester léger)
  - Default preferences (theme, language, region)

- [ ] **Account Settings** (`/dashboard/settings`)
  - Profile info (name, email, avatar choix parmi presets, pas d'upload)
  - Password change
  - Connected OAuth providers (disconnect option)
  - Notification preferences
  - Privacy settings
  - Delete account option (with confirmation)

### 3.5 Support & Donations
- [ ] **Support Page** (`/dashboard/support`)
  - Bouton « Buy me a coffee » (don volontaire)
  - Rappel des limites dépendant des providers
  - FAQ BYOK (comment ajouter ses clés, modèles recommandés)
  - Pas de facturation ni de gestion de paiement

### 3.6 Admin Console (rôle Admin uniquement)
- [ ] **Page `/admin`** protégée (Better-Auth + rôle Admin)
  - Vue usage global : recherches, analyses, saves, BYOK activations
  - Quotas/limites : consommation free-tier vs BYOK par provider
  - API keys : liste BYOK masquées, révocation, stats (requests, erreurs, modèles utilisés)
  - Utilisateurs : recherche, suspension/réactivation, reset mot de passe, rôles Admin/Editor/Viewer
  - Feature flags internes : activer/désactiver modules (fetch v2, organize v2, dual workflow)
  - Observabilité locale : journal Pino (erreurs, latence) sans export externe

---

## 🤖 Phase 4 : Agentic Workflows Optimisés (Semaine 5-6)

### 4.1 Refactor Agents Existants
- [ ] **fetchOffersAction v2**
  - Ajouter source prioritization (préférer URLs web live vs AI-generated)
  - Serpapi ou similar pour real estate data
  - Support pour custom scrapers
  - Caching des résultats (1h TTL)
  - Background jobs (async) pour large batches

- [ ] **analyzeOffersAction v2**
  - Ajouter user-defined criteria weighting (UI slider)
  - Support multi-language (FR, EN, ES, DE)
  - Async processing pour 100+ offres
  - Store analysis results → MongoDB
  - Webhook notifications quand analyse complete

- [ ] **organizeOffersAction v2**
  - Template selection (timeline, grid, kanban)
  - Custom grouping (par prix, localisation, score)
  - Export options (JSON, CSV, PDF)

### 4.2 Nouveaux Agents Spécialisés
- [ ] **enrichmentAgent**
  - Enrichit offres avec données externes (weather, crime stats, schools nearby)
  - Calls à APIs tierces (OpenWeather, pour real estate)
  - Cache résultats

- [ ] **predictiveAgent**
  - Prédit prix futur / demande
  - Trending analysis
  - Alert si bonne affaire

- [ ] **notificationAgent**
  - Envoie emails/push quand nouvelles offres matching criteria
  - Frequency control (daily digest, realtime, weekly)
  - Webhook triggers

### 4.3 Agentic Workflow Orchestration
- [ ] **État machine pour analyses multi-step**
  - State: pending → fetching → analyzing → organizing → complete
  - Retry logic avec exponential backoff
  - Cancel workflow option
  - Progress tracking real-time (WebSocket ou polling)

- [ ] **Task Queue** (Bull ou similar)
  - Background jobs pour analyses longues
  - Prioritization (Free tier: low, Pro: normal)
  - Scheduling (run at specific time)

### 4.4 Dual Workflow Modes (Free vs BYOK)
- [ ] **Mode Free tier (par défaut)**
  - Utilise les modèles free des providers + clés intégrées limitées
  - Capé par les quotas publics (similaire à l'actuel)
  - Recommandations de modèles: Gemini 2.5 Flash, DeepSeek R1 (free)

- [ ] **Mode BYOK (clés payantes utilisateur)**
  - Lève les limites produit, reste borné par le provider de l'utilisateur
  - Recommandations de modèles payants pertinents: GPT-4o mini pour synthèse rapide, Mistral Large pour multilingue précis
  - Pas de clés stockées en clair (chiffrement côté serveur)

---

## 💳 Phase 5 : Monétisation légère & BYOK (Semaine 6-7)

### 5.1 Modèle
```
┌─ FREE FOREVER ─────────────────────────────────┐
│ • SaaS gratuit, aucune facturation             │
│ • IA limitées aux free tiers ou clés intégrées │
│ • BYO API keys pour modèles payants            │
│ • 1 workspace                                  │
│ • 3 API keys BYOK stockées côté serveur        │
│ • Community support                            │
└────────────────────────────────────────────────┘

┌─ SUPPORT / DON ────────────────────────────────┐
│ • Bouton « Buy me a coffee » (volontaire)      │
│ • Pas de trial, pas d'abonnement               │
│ • Les limites restent celles des providers     │
└────────────────────────────────────────────────┘
```

### 5.2 Politique de consommation
- Respecter strictement les quotas free-tier des fournisseurs
- Si l'utilisateur renseigne ses clés payantes, le mode BYOK lève les limites côté produit mais reste borné par son provider
- Pas de crédits internes, pas de sur-facturation

### 5.3 Paiement / Facturation
- Pas de Stripe ni de billing interne
- Uniquement un lien de soutien (don volontaire)

---

## 🌐 Phase 6 : Landing Page & Marketing (Semaine 7-8)

### 6.1 Landing Page Architecture
- [ ] **Structure** (`/` landing root)
  - Hero section (Framer Motion parallax)
  - Features showcase (scrollable cards)
  - Pricing comparison table (interactive)
  - Testimonials (slider)
  - FAQ accordion
  - CTA footer (Sign up / Start free, BYOK friendly)

### 6.2 Hero Section Premium
- [ ] **Animated background** (animated gradients ou Spline 3D)
- [ ] **Hero copy** : Headline + subheading + CTA buttons
- [ ] **Scrolling parallax** : Hero image with Framer Motion
- [ ] **Demo animée** : animation Framer Motion (pas de vidéo hébergée)

### 6.3 Features Section
- [ ] **4-6 feature cards** avec icônes + descriptions
  - AI-Powered Analysis
  - Real-time Data Fetching
  - Multi-Model Support
  - Collaboration Tools
  - API-First Design
  - Security & Compliance

- [ ] **Interactive demo** : Live search form sur landing page

### 6.4 Testimonials Section
- [ ] **3-4 user testimonials** (screenshots, name, company)
- [ ] **Case studies** (une page dédiée `/case-studies`)

### 6.5 Trust Badges
- [ ] **SOC 2 Type II** (aspirational, à obtenir)
- [ ] **GDPR compliant** badge
- [ ] **Privacy shield** 
- [ ] **Customer count** + uptime stats

---

## 📱 Phase 7 : UI/UX Polish & Theming (Semaine 8)

### 7.1 Complete Theme System
- [ ] **5 Premium Themes**
  1. **Light Pro** (default, clean white + slate)
  2. **Dark Pro** (sophisticated black + neon accents)
  3. **Gold Luxury** (existing, enhance with more gradients)
  4. **Ocean Blue** (calming, data-visualization friendly)
  5. **Forest Green** (natural, eco-friendly)

- [ ] **Theme switcher** dans header
- [ ] **Auto theme detection** (system preference)
- [ ] **Persist theme** en DB + localStorage

### 7.2 Micro-interactions & Animations
- [ ] **Button hover effects** (Framer Motion)
- [ ] **Form input focus states** (glow, grow)
- [ ] **Card hover** (lift, shadow)
- [ ] **Loading animations** (spinners, skeleton loaders)
- [ ] **Success/error toasts** (slide-in animations)
- [ ] **Modal transitions** (fade + scale)
- [ ] **Page transitions** (smooth page changes)

### 7.3 Accessibility Audit
- [ ] **WCAG 2.1 AA compliance**
  - Keyboard navigation (Tab, Enter, Escape)
  - Screen reader support (ARIA labels)
  - Color contrast ratios (4.5:1 minimum)
  - Focus indicators visible
  - Skip links

### 7.4 Dark Mode Support
- [ ] **Perfect dark mode** via next-themes
- [ ] **CSS variable overrides** pour tous les colors
- [ ] **Image optimization** (dark version si needed)

---

## 🔒 Phase 8 : Security & Compliance (Semaine 8-9)

### 8.1 API Security
- [ ] **API Key hashing** (bcrypt in DB)
- [ ] **Rate limiting** per API key (Express rate-limit middleware)
- [ ] **JWT token management** (Better-Auth)
- [ ] **CORS whitelist** (only known domains)

### 8.2 Data Security
- [ ] **Encryption at rest** (MongoDB field-level encryption)
- [ ] **Encryption in transit** (HTTPS + TLS 1.3)
- [ ] **Data deletion** (GDPR right to forget)
- [ ] **Audit logs** (track user actions)

### 8.3 Compliance
- [ ] **Privacy Policy** (template from Iubenda)
- [ ] **Terms of Service** (template from Termly)
- [ ] **GDPR Data Processing Agreement**
- [ ] **CCPA compliance** (if serving California users)
- [ ] **Cookie consent banner** (Cookiebot or similar)

### 8.4 Monitoring & Incident Response
- [ ] **Monitoring léger** (health checks internes / uptime basic)
- [ ] **Security scanning** (npm audit, dependabot)
- [ ] **Incident response plan** (documentation)

---

## 📊 Phase 9 : Analytics & Insights (Semaine 9)

### 9.1 Product Analytics
- [ ] **Analytics privacy-first sans SaaS externe**
  - Instrumentation Next.js / simple events côté serveur
  - Track: Page views, Searches, Analyses, Saves
  - Segments: Free vs BYOK, modèles utilisés
  - Retention cohorts simples (hebdo) sans export externe

### 9.2 Performance Monitoring
- [ ] **Web Vitals** (Next.js analytics)
  - FCP, LCP, CLS, TTFB
  - Dashboard pour visualiser
  - Alerts si dégradation

### 9.3 Business Metrics
- [ ] **Infra cost vs donations** (suivi mensuel)
- [ ] **Activation/retention free vs BYOK**
- [ ] **Engagement** : recherches, analyses, sauvegardes

---

## 📦 Phase 10 : Deployment & Scalability (Semaine 10)

### 10.1 Infrastructure Setup
- [ ] **Hosting** : Vercel (Next.js native)
- [ ] **Database** : MongoDB Atlas (managed)
- [ ] **CDN** : Cloudflare (caching + DDoS protection)
- [ ] **File storage** : S3-compatible (Tigris S3 compatible si besoin .env deja setup)
- [ ] **Email** : Resend (free tier) pour transactional/auth

### 10.2 CI/CD Pipeline
- [ ] **GitHub Actions**
  - Lint on PR
  - Type check
  - Build verification
  - E2E tests (optionnal, Playwright)
  - Deploy to staging on PR
  - Deploy to production on merge to main

### 10.3 Database Optimization
- [ ] **Indexes** : userId, email, createdAt, subscription
- [ ] **Query optimization** : N+1 prevention (Prisma select)
- [ ] **Connection pooling** : MongoDB connection string with retryWrites

### 10.4 Caching Strategy
- [ ] **Redis** (optional, pour caching offres)
- [ ] **HTTP caching** (Vercel edge caching)
- [ ] **Client-side caching** (TanStack/React Query)

---

## 📝 Phase 11 : Documentation & Support (Semaine 11)

### 11.1 Developer Documentation
- [ ] **API Documentation** (Swagger/OpenAPI)
  - Endpoints listing
  - Request/Response examples
  - Rate limits
  - Error codes
  - SDKs (Python, JavaScript)

- [ ] **Getting Started Guide**
  - API key retrieval
  - First request example
  - Common use cases
- **Blog post and changelog page** 
  - explaining new features
  - display new changelog with versioning implemented system

### 11.2 User Documentation
- [ ] **Help Center** (Agentic AI with local documentation)
  - FAQ
  - Tutorials écrits + gifs légers (pas de vidéo hébergée)
  - Troubleshooting guides

### 11.3 Support Channels
- [ ] **Email support** (Agentic AI based on hugging face model opensource)
- [ ] **Chat support** (Agentic AI based on hugging face model opensource)

---

## 🚀 Phase 12 : Launch & Growth (Semaine 12+)

### 12.1 Soft Launch
- [ ] **Closed beta** (50 users)
- [ ] **Feedback collection** (Typeform surveys)
- [ ] **Bug fixes** + performance tuning

### 12.2 Public Launch
- [ ] **Press release** distribution
- [ ] **Social media campaign** (Twitter, LinkedIn)
- [ ] **Product Hunt submission**

### 12.3 Post-Launch Monitoring
- [ ] **Daily metrics tracking** (signups, BYOK adoption, errors)
- [ ] **Weekly retrospectives** (team sync)
- [ ] **Monthly strategy review** (coûts infra, donations, retention)

---

## 📊 Tech Stack Summary

### Core
```json
{
  "runtime": "Node.js 20+",
  "framework": "Next.js 16 App Router",
  "frontend": "React 19 + Server Components",
  "ui": "shadcn/ui + Base UI + Framer Motion",
  "styling": "Tailwind CSS v4",
  "database": "MongoDB + Prisma ORM",
  "auth": "Better-Auth v1",
  "payments": "None (donation link only)",
  "email": "Resend (free tier)",
  "ai": "OpenRouter SDK (multi-model)",
  "analytics": "Next.js instrumentation (no external)",
  "deployment": "Vercel"
}
```

### Dependencies to Add
```bash
pnpm add \
  prisma @prisma/client \
  better-auth @better-auth/prisma-adapter \
  framer-motion \
  @base-ui/react \
  recharts \
  swr \
  zod \
  lodash-es \
  resend
```

### Dev Dependencies
```bash
pnpm add -D \
  @types/node @types/react @types/react-dom \
  typescript \
  eslint eslint-config-next
```

---

## 🎯 KPIs & Success Metrics

| Métrique | Target | Timeline |
|----------|--------|----------|
| **Active users (monthly)** | 500+ | Month 3 |
| **BYOK adoption** | 30% des users | Month 3 |
| **Satisfaction (CSAT/NPS)** | 50+ | Month 2 |
| **Uptime** | 99.9%+ | Ongoing |
| **API Latency** | <500ms p95 | Ongoing |
| **Donations reçues** | Symboliques (café) | Ongoing |

---

## 🔄 Iterative Improvement Cycles

### Month 1: Foundation
- Phases 0-3 (Infrastructure + Auth + Dashboard basics)
- Internal testing + bug fixes

### Month 2: Feature Rich
- Phases 4-5 (Agentic workflows + Monetization)
- Beta launch to 50 users

### Month 3: Polish & Launch
- Phases 6-8 (Landing page + Security)
- Public launch

### Month 4+: Growth
- Phases 9-12 (Analytics + Scale + Support)
- Ongoing feature additions + user feedback

---

## ✅ Final Checklist Before Launch

- [ ] All 12 phases completed
- [ ] Zéro bug critique (observabilité locale)
- [ ] 99.9%+ uptime achieved
- [ ] Privacy policy + ToS reviewed by lawyer
- [ ] SOC 2 audit scheduled
- [ ] Customer support trained
- [ ] Documentation complete + reviewed
- [ ] Performance optimized (<2s FCP)
- [ ] Mobile responsive tested (iOS + Android)
- [ ] A/B testing framework ready
- [ ] Backup & disaster recovery tested
- [ ] Team trained on production procedures

---

## 📞 Questions & Next Steps

1. **Timeline** : Pouvez-vous commencer immédiatement (semaine 1)?
2. **Budget** : Avez-vous les ressources pour 2 devs senior?
3. **Infrastructure** : Prêt à migrer vers Vercel + MongoDB Atlas (coûts ~$300/mo)?
4. **Monetization** : Confirmez le modèle de pricing?
5. **Marketing** : Qui gère la stratégie go-to-market?

---

**Document créé** : January 2026  
**Version** : 1.0 - Draft Premium Roadmap  
**Propriétaire** : OfferAnalyst Team  
**Statut** : 🟡 En attente d'approbation
