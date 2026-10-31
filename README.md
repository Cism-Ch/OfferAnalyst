<div align="center">

# 🎯 OfferAnalyst (Next.js Edition)

**AI-Powered Contextual Recommendation Engine**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-4285F4?logo=openai&logoColor=white)](https://openrouter.ai/)
[![Shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

A modern SaaS platform for AI-powered offer analysis and recommendation.

</div>

---

> [!IMPORTANT]
> **🔐 Security Update (January 2026)**: We've implemented a new secure API key management system with AES-256-GCM encryption.
> 
> **Action Required**: If you have existing API keys, please re-enter them after updating.
> 
> See [CHANGELOG.md](CHANGELOG.md) for full details and migration guide.

---

## 📖 Overview

**OfferAnalyst** is a high-performance recommendation engine that intelligently ranks offers based on user context. Powered by **OpenRouter AI models** (including DeepSeek R1, GPT-4, Claude, and more), it uses a Server Action backbone to secure API keys and provide robust results.

### ✨ Key Features

- 🧠 **AI Analysis**: Server-side analysis using multiple AI models via OpenRouter
- 🔐 **Secure API Keys**: AES-256-GCM encrypted storage with BYOK support ([details](docs/API_KEY_SECURITY.md))
- 🎨 **Modern UI**: Built with `shadcn/ui` and Tailwind CSS v4 in a clean dashboard style
- ⚡ **Next.js App Router**: Optimized performance and server actions
- 📊 **Visualizations**: Interactive charts using Recharts
- 💾 **Data Persistence**: Save offers and search history with localStorage
- 🔍 **Smart Search**: Track and restore previous searches
- 📈 **Project Management**: Organize research into projects
- 🔄 **Comparison View**: Side-by-side offer comparison
- 📝 **Change Tracking**: See [CHANGELOG.md](CHANGELOG.md) for latest updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **npm** or **pnpm** (preferred)
- **OpenRouter API Key** - Get it from [OpenRouter](https://openrouter.ai/)

### Installation

1.  **Install dependencies**
    ```bash
    pnpm install

    pnpm install
    ```

2.  **Configure API Key**
    Create a `.env.local` file in the root directory:
    ```env
    OPENROUTER_API_KEY=your_openrouter_api_key_here
    ```
    
    You can also copy from the example:
    ```bash
    cp .env.example .env.local
    ```

3.  **Start Dev Server**
    ```bash


    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Framework (App Router) |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | Component Library |
| **OpenRouter** | AI Model Gateway |
| **Recharts** | Data Visualization |
| **Zod** | Runtime Validation |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── actions/          # Server Actions (fetch.ts, analyze.ts, organize.ts)
│   ├── compare/          # Offer Comparison Page
│   ├── history/          # Search History Page
│   ├── projects/         # Projects Management Page
│   ├── saved/            # Saved Offers Page
│   ├── page.tsx          # Main Dashboard Page
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # Global Styles (Tailwind v4)
├── components/
│   ├── layout/           # Layout Components (Sidebar, Header)
│   ├── offers/           # Offer-related Components
│   └── ui/               # Shadcn UI Components
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities & Configurations
└── types/                # TypeScript Interfaces & Zod Schemas
```

---

## 📚 Features Guide

### 🏠 Dashboard
The main interface where you configure your search criteria and analyze offers:
- **Domain Configuration**: Specify the market domain (Jobs, Real Estate, Products, etc.)
- **Explicit Criteria**: Define hard requirements (budget, location, salary range)
- **Implicit Context**: Describe subjective preferences (work-life balance, company culture)
- **Auto-Fetch**: Enable AI to automatically search the web for live offers
- **Manual Input**: Paste JSON array of offers for analysis
- **AI Model Selection**: Choose from various AI models (DeepSeek R1, GPT-4, Claude, Gemini)

### 💾 Saved Offers
Manage your collection of interesting offers:
- **List View**: Browse all saved offers in a card grid
- **Categories View**: AI-organized offers by category (requires Smart Organize)
- **Timeline View**: Chronological organization of offers
- **Comparison**: Select 2-3 offers for side-by-side comparison
- **Smart Organize**: AI-powered categorization and timeline generation

### 📜 Search History
Track and restore previous analyses:
- **Search Tracking**: Automatically saves all analysis sessions
- **Pin Important Searches**: Keep frequently-used searches at the top
- **Quick Restore**: One-click to restore previous search context
- **Search Filter**: Find past searches by domain, criteria, or results
- **Selective Cleanup**: Clear unpinned history while preserving important items

### 📁 Projects
Combine multiple research contexts into organized projects:
- **Multi-Source Projects**: Combine insights from different searches
- **Project Wizard**: 3-step setup (Define → Source → Review)
- **Context Aggregation**: Query across combined data sources
- **Status Tracking**: Track active and archived projects

### 🔄 Comparison
Detailed side-by-side comparison of offers:
- **Score Breakdown**: View individual relevance, quality, and trend scores
- **Visual Progress Bars**: Easy-to-understand score visualization
- **AI Justification**: Understand why each offer was ranked
- **Web Insights**: See market context and additional research

---

## 🎯 Usage Example

1. **Configure Your Search**:
   - Domain: "Jobs"
   - Explicit Criteria: "Salary > 100k, Remote"
   - Implicit Context: "Seeking work-life balance, startup culture"

2. **Choose Analysis Method**:
   - Enable "Auto-Fetch" for AI to find offers, OR
   - Paste your own JSON offer data

3. **Start Analysis**:
   - Click "Start Workflow"
   - AI analyzes and ranks offers based on your context
   - View results with scores, justifications, and market summary

4. **Save Interesting Offers**:
   - Click bookmark icon on top offers
   - Access saved offers from the "Saved Offers" page

5. **Compare Options**:
   - Select 2-3 saved offers
   - Click "Compare" for detailed side-by-side analysis

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key for AI model access |

### Available AI Models

The application supports multiple AI models through OpenRouter:
- **DeepSeek R1** (Recommended) - Advanced reasoning capabilities
- **GPT-4 Turbo** - OpenAI's flagship model
- **Claude 3.5 Sonnet** - Anthropic's advanced model
- **Gemini 2.5 Flash** - Google's fast model

Select your preferred model from the header dropdown.

---

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cism-Ch/OfferAnalyst)

**Prerequisites:**
1. MongoDB Atlas account and database cluster ([Setup Guide](./docs/MONGODB_SETUP.md))
2. OpenRouter API key from [OpenRouter](https://openrouter.ai/)
3. (Optional) OAuth credentials for Google/GitHub

**Deployment Steps:**

1. **Click "Deploy with Vercel" button above**

2. **Add Required Environment Variables in Vercel Dashboard:**
   - `DATABASE_URL` - Your MongoDB connection string (required in ALL environments)
   - `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `BETTER_AUTH_URL` - Your Vercel domain (update after first deploy)
   - `NEXT_PUBLIC_APP_URL` - Same as BETTER_AUTH_URL
   - `OPENROUTER_API_KEY` - Your OpenRouter API key
   
   **Note:** Add these in Vercel Project Settings → Environment Variables, not as CLI secrets.

3. **Deploy and Update Domain**
   - After first deployment, get your Vercel domain
   - Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` with actual domain
   - Redeploy

4. **Configure OAuth (Optional):**
   - Update OAuth redirect URIs with your Vercel domain
   - Add OAuth credentials to Vercel environment variables

📚 **Detailed Guides:**
- [MongoDB Setup Guide](./docs/MONGODB_SETUP.md) - Step-by-step MongoDB Atlas configuration
- [Deployment Guide](./docs/DEPLOYMENT.md) - Complete Vercel deployment walkthrough

### Local Production Build

```bash
# Generate Prisma Client
npx prisma generate

# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is open source and available under the MIT License.

---

<div align="center">
Made with ❤️ using Next.js & OpenRouter AI
</div>
