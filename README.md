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

## 📖 Overview

**OfferAnalyst** is a high-performance recommendation engine that intelligently ranks offers based on user context. Powered by **OpenRouter AI models** (including DeepSeek R1, GPT-4, Claude, and more), it uses a Server Action backbone to secure API keys and provide robust results.

### ✨ Key Features

- 🧠 **AI Analysis**: Server-side analysis using multiple AI models via OpenRouter
- 🎨 **Modern UI**: Built with `shadcn/ui` and Tailwind CSS v4 in a clean dashboard style
- ⚡ **Next.js App Router**: Optimized performance and server actions
- 📊 **Visualizations**: Interactive charts using Recharts
- 💾 **Data Persistence**: Save offers and search history with localStorage
- 🔍 **Smart Search**: Track and restore previous searches
- 📈 **Project Management**: Organize research into projects
- 🔄 **Comparison View**: Side-by-side offer comparison

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **npm** or **pnpm** (preferred)
- **OpenRouter API Key** - Get it from [OpenRouter](https://openrouter.ai/)

### Installation

1.  **Install dependencies**
    ```bash
    npm install
    # or
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
    npm run dev
    # or
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

<div align="center">
Made with ❤️ using Next.js & OpenRouter AI
</div>
