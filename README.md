<div align="center">

# 🎯 OfferAnalyst (Next.js Edition)

**AI-Powered Contextual Recommendation Engine**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

Migrated from Vite to Next.js for better performance and server-side security.

</div>

---

## 📖 Overview

**OfferAnalyst** is a high-performance recommendation engine that intelligently ranks offers based on user context. Powered by **Google's Gemini 2.5 Flash**, it uses a Server Action backbone to secure API keys and provide robust results.

### ✨ Key Features

- 🧠 **AI Analysis**: Server-side analysis using Gemini 2.5 Flash.
- 🎨 **Modern UI**: Built with `shadcn/ui` and Tailwind CSS v4 in a clean "Income Tracker" style dashboard.
- ⚡ **Next.js App Router**: Optimized performance and server actions.
- 📊 **Visualizations**: Interactive charts using Recharts.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **pnpm** (preferred)
- **Google Gemini API Key**

### Installation

1.  **Install dependencies**
    ```bash
    pnpm install
    ```

2.  **Configure API Key**
    Create a `.env.local` file:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
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
| **Gemini 2.5 Flash** | AI Model |
| **Recharts** | Data Visualization |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── actions/      # Server Actions (analyze.ts)
│   ├── page.tsx      # Main Dashboard Page
│   └── globals.css   # Global Styles (Tailwind v4)
├── components/
│   ├── dashboard/    # Dashboard Components
│   └── ui/           # Shadcn UI Components
├── lib/              # Utilities
└── types/            # TypeScript Interfaces
```

---

<div align="center">
Made with Next.js & Gemini
</div>
