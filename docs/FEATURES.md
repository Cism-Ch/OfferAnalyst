# OFFERAN — Functional Specifications & Platform Features

This document provides a comprehensive overview of the core capabilities, architectural modules, and workflows built into **OFFERAN**.

---

## 🎯 1. Contextual AI Analysis & Multi-Axis Scoring

OFFERAN uses advanced LLMs (via OpenRouter) to evaluate and rank opportunities according to both explicit requirements and subtle subjective context.

### Scoring Dimensions:
1. **Match Relevance (40%)**: Strict mathematical adherence to mandatory criteria (salary/compensation, location, remote policy, technical stack).
2. **Structural Quality (30%)**: Solidity of company backing, team reputation, organizational health, and role clarity.
3. **Market Benchmark & Trends (20%)**: Competitive positioning against current market rates and macroeconomic growth indicators.
4. **Living Standard & Net Value (10%)**: Cost-of-living index, purchasing power adjustments, and tax burdens based on geographic reality.

### Anti-Hallucination Guardrails:
- Verified web citations and source links accompany all market insights.
- Multi-model switcher: Support for DeepSeek R1, GPT-4 Turbo, Claude 3.5 Sonnet, and NVIDIA Nemotron.
- Bring Your Own Key (BYOK) mode with AES-256-GCM encryption for unlimited, zero-quota searches.

---

## 📥 2. Multi-Source Ingestion Hub (`/data-source`)

Frictionless data capture tailored for fast multi-platform browsing:

1. **Universal 1-Click Bookmarklet**:
   - Drag-and-drop browser bookmarklet compatible with Chrome, Firefox, Safari, Edge, and Brave.
   - 1-click DOM text extraction on LinkedIn, Indeed, Welcome to the Jungle, or custom job boards, pre-populating `/data-source`.
2. **Plain-Text LLM Extraction**:
   - Paste raw job descriptions or unstructured text; the fast LLM pipeline automatically structures fields into standardized `Offer[]` schema.
3. **File & CSV Importer**:
   - Automated column mapping for CSV spreadsheets and text files.
4. **Link / URL Importer**:
   - Direct web scraping with anti-SSRF protection and host validation.
5. **Developer JSON Mode**:
   - Raw JSON editing and schema validation for API power users.

---

## 💼 3. Post-Scoring Action Suite (Monetization & Conversion)

Transforming passive rankings into actionable career and sourcing leverage:

1. **Negotiation Pitch Generator (`NegotiationPitchModal`)**:
   - Generates counter-offers, leverage arguments, and customized compensation negotiation scripts based on the user's specific context.
2. **Tailored Application Builder (`TailoredApplicationModal`)**:
   - Automatically writes highly personalized outreach messages and application letters directly highlighting the strongest match points.

---

## 👥 4. B2B Multi-Tenancy & Collaborative Workspaces (`/dashboard/workspace`)

Built for recruitment firms, corporate talent acquisition, and deal sourcing teams:

- **Espace Collaboratif**: Create, manage, and switch between shared workspaces.
- **RBAC Security**: Role-based access control with 4 distinct permission levels:
  - `OWNER`: Full administrative authority, billing control, and workspace deletion.
  - `ADMIN`: Member management, invitations, and workspace settings.
  - `MEMBER`: Search creation, offer analysis, and collaborative review.
  - `VIEWER`: Read-only access to scores, reports, and saved pipelines.
- **Member Invitations**: Email-based invitations with instant role assignment and revocation.

---

## 🔔 5. High-Match Alerts & Asynchronous Webhooks

Automated dispatching of high-value opportunities:

- **Configurable Score Threshold**: Trigger notifications only when an offer meets or exceeds a desired score (e.g., 80% or 85%).
- **HMAC SHA-256 Signing**: Every outgoing webhook is cryptographically signed (`X-OfferAnalyst-Signature`) with timestamp headers to guarantee authenticity.
- **Platform Integrations**: Compatible with Slack, Discord, Zapier, Make, and custom HTTP endpoints.
- **Upstash QStash Queue**: Dispatches asynchronously to prevent blocking user requests or hitting edge timeout limits.

---

## 🎨 6. Presentation Showcase & Luxury UI/UX

- **Vitrine Showcase (`/landing` & `/`)**: B2B position statement, interactive 1-click live demo, and cookie-based navigation persistence (`offeranalyst_app_mode`).
- **Floating Preference Dock**: Ergonomic floating dock (`fixed bottom-5 right-5 z-50`) hosting language toggle and theme selector.
- **Mobile-First Responsive Header**: 2-line layout on small screens preventing button collisions down to 320px viewport widths.
- **Signature Neon Theme System**: Contrast-checked color palettes (Gold Luxury, Neon Cyber, Ocean Saphir, Emerald Forest, Rose Crimson) alongside standard Light/Dark/System modes.
- **Bilingualism**: Complete FR/EN translation parity across 100% of routes and interactive dialogs.

---

## 🔐 7. Identity & Database Provisioning

- **Better-Auth Integration**: Stateless session management with native MongoDB ObjectIds (`advanced.database.generateId: false`).
- **Automated Admin Seeding**: Idempotent CLI script (`pnpm run db:seed-admin`) leveraging `.env` variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) to initialize the master administrator identity.
- **Strict Data Isolation**: Prisma relational mapping with MongoDB document databases.
