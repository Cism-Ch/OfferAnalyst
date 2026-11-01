<div align="center">

# OFFERAN (OfferAnalyst)

**AI-Powered Contextual Recommendation & Multi-Axis Arbitrage Engine**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-1.7.13-red)](https://better-auth.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2.1-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![pnpm](https://img.shields.io/badge/pnpm-12.15.0-orange?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

A modern B2B and Prosumer SaaS platform for AI-powered offer analysis, contextual ranking, and automated opportunity arbitrage.

</div>

---

## 📖 Overview

**OFFERAN** is an enterprise-grade contextual recommendation platform designed to analyze, score, and rank offers against complex explicit constraints and subjective user preferences. It leverages multi-model AI reasoning (DeepSeek R1, GPT-4, Claude 3.5 Sonnet, NVIDIA Nemotron) coupled with real-time web citations, multi-tenant team collaboration, and server-side encryption.

### ✨ Core Capabilities

- **Multi-Axis Evaluation**: Real-time scoring across Match Relevance, Structural Quality, Market Salary/Living Standards, and Industry Trends.
- **Evidence-Based Insights**: Transparent citations and verification links to eliminate AI hallucinations.
- **Ingestion Hub (`/data-source`)**: Universal 1-Click Bookmarklet, Plain-Text LLM structuring, CSV/File parsing, and anti-SSRF URL imports.
- **Post-Scoring Action Suite**: Instant generation of tailored application pitches and concrete salary negotiation arguments.
- **B2B Multi-Tenancy (`/dashboard/workspace`)**: Role-based access control (OWNER, ADMIN, MEMBER, VIEWER) for collaborative hiring, procurement, and deal sourcing teams.
- **High-Match Alerts & Webhooks**: HMAC SHA-256 signed webhooks (Slack, Discord, Zapier) dispatched via Upstash QStash async queues.
- **Zero-Leak Security & BYOK**: AES-256-GCM encrypted guest/user API key storage and Better-Auth server-side identity protection.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20.x or higher
- **Package Manager**: `pnpm` (v12.15+ strictly enforced)
- **Database**: MongoDB (Atlas cluster or local replica set)
- **AI Gateway**: OpenRouter API key ([openrouter.ai](https://openrouter.ai/))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Cism-Ch/OfferAnalyst.git
cd OfferAnalyst
pnpm install
```

### 2. Configure Environment Variables

Create your local `.env` file by copying the template:

```bash
cp .env.example .env
```

Configure your core secrets in `.env`:

```env
# Database & Authentication
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/offeranalyst?retryWrites=true&w=majority
BETTER_AUTH_SECRET=your_32_chars_random_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Administrator Credentials (Auto-provisioned)
ADMIN_NAME="Admin"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

# AI Inference Gateway
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

### 3. Provision Admin Account in MongoDB

Run the idempotent database seeding script:

```bash
pnpm run db:seed-admin
```

This verifies or provisions your master administrator account with the `ADMIN` role and sets `emailVerified: true`.

### 4. Start Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🛠️ Technology Stack

| Domain | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.4.3 | RSC, Server Actions, Dynamic Routes |
| **UI Library** | React | 19.3.1 | Core UI Components |
| **Type Safety** | TypeScript | 5.9.3 | Strict end-to-end typing |
| **Styling** | Tailwind CSS & shadcn/ui | v4.3.3 | Luxury "Neon" Theme, Responsive Layouts |
| **Authentication** | Better-Auth | 1.7.13 | Native MongoDB ObjectIds, Sessions, RBAC |
| **ORM / ODM** | Prisma Client | 6.2.1 | MongoDB Schema & Relationship Management |
| **Async Queues** | Upstash QStash & Redis | Serverless | Webhook delivery & background caching |
| **Package Manager** | pnpm | 12.15.0 | Deterministic monorepo-grade package lock |

---

## 📂 Architecture & Directory Layout

```
OfferAnalyst/
├── docs/                 # Documentation SSOT, Architecture ADRs & Archives
│   ├── TASKS.md          # Central Task SSOT (< 250 lines ceiling)
│   ├── FEATURES.md       # Exhaustive functional specification
│   ├── QUICKSTART.md     # Express deployment guide
│   └── DEPLOYMENT.md     # Production deployment instructions
├── evals/                # Deterministic Evaluation Judges & Telemetry
│   ├── run_fullstack_eval.py # 100-point deterministic judge (tsc, lint, hygiene)
│   └── version_manager.py    # Automated semver management
├── prisma/               # Database Schema
│   └── schema.prisma     # MongoDB models (User, Session, Account, Workspace, etc.)
├── scripts/              # Automation & Seeding CLI Tools
│   └── seed-admin.mjs    # Idempotent admin account provisioning script
├── src/
│   ├── app/              # Next.js App Router (RSC by default)
│   │   ├── actions/      # Type-safe Server Actions with Zod validation
│   │   ├── api/auth/     # Better-Auth catch-all route handler
│   │   ├── auth/         # Authentication views (Login, Signup, Verify)
│   │   ├── dashboard/    # Workspace management & Analytics
│   │   ├── data-source/  # Multi-source ingestion page
│   │   └── landing/      # SaaS Vitrine Showcase
│   ├── components/       # Colocated UI Components
│   │   ├── brand/        # OFFERAN Monogram & Logo System
│   │   ├── data-source/  # Ingestion tabs (Bookmarklet, Text, CSV, URL)
│   │   ├── landing/      # SaaSPresentationView & Floating Dock
│   │   ├── layout/       # ModernHeader, ModernSidebar, AppShell
│   │   ├── offers/       # OfferCard, Action Modals (Pitch, Tailored App)
│   │   └── ui/           # Radix Primitives & shadcn UI components
│   ├── contexts/         # React Contexts (Language FR/EN, Analysis, Theme)
│   └── lib/              # Centralized Singletons (Prisma, Auth, AI Models, Cache)
└── package.json          # Dependencies & Scripts (100% pnpm)
```

---

## 🧰 Available Scripts & Tooling

All operations strictly utilize `pnpm`:

```bash
# Development server
pnpm run dev

# Code hygiene & Static Analysis
pnpm exec tsc --noEmit           # Strict TypeScript check (0 errors tolerated)
pnpm run lint                   # ESLint check with caching

# Deterministic Quality Gates
pnpm run eval:quick             # Quick validation: Typecheck + Lint + Prisma Hygiene
pnpm run eval:fullstack         # Comprehensive fullstack evaluation suite

# Database Operations
pnpm run db:validate            # Validate schema.prisma without engine locks

# Production Build
pnpm run build                  # Production Next.js build
pnpm run start                  # Start production build server
```

---

## 🚢 Production Deployment (Vercel + MongoDB Atlas)

1. **Database Setup**: Create an M0 or dedicated cluster on MongoDB Atlas and obtain your `DATABASE_URL`.
2. **Environment Configuration**: Set all required variables in Vercel Project Settings:
   - `DATABASE_URL` (Required at build time and runtime)
   - `BETTER_AUTH_SECRET` (Generated via `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` & `NEXT_PUBLIC_APP_URL` (Your production domain)
   - `OPENROUTER_API_KEY`
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD`
3. **Database Seeding**: Run `pnpm run db:seed-admin` locally or as a post-deploy step to initialize the admin identity.
4. **Deploy**: Build and deploy with zero downtime.

For detailed deployment guides, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/QUICKSTART.md](docs/QUICKSTART.md).

---

## 🤝 Contributing & Engineering Rules

This repository enforces strict engineering rules:
- **Task-Driven Development**: No code without formal registration in [`docs/TASKS.md`](docs/TASKS.md).
- **RSC Default**: Server Components by default; colocate client components.
- **Zero Secrets in Git**: Sensitive credentials belong solely in `.env`.
- **Zero Native Emojis in Code**: Pure Lucide SVG icons only.

---

<div align="center">
Developed with Next.js 16, React 19, Prisma & OpenRouter AI.
</div>
