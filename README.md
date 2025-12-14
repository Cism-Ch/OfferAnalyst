<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎯 OfferAnalyst

**AI-Powered Contextual Recommendation Engine**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

[View in AI Studio](https://ai.studio/apps/drive/1yGU78ZJv5M14UiOI2a92sDQySFzcYbR_) • [Report Bug](https://github.com/Cism-Ch/OfferAnalyst/issues) • [Request Feature](https://github.com/Cism-Ch/OfferAnalyst/issues)

</div>

---

## 📖 Overview

**OfferAnalyst** is a high-performance recommendation engine that intelligently ranks offers (real estate, jobs, products, etc.) based on user context, intrinsic quality, and real-time web trends. Powered by **Google's Gemini 2.5 Flash** with **Search Grounding**, it goes beyond simple filtering to provide contextual, data-driven recommendations.

### ✨ Key Features

- 🧠 **Multi-Phase AI Analysis**: Combines explicit criteria, implicit user context, and web-enriched insights
- 🔍 **Real-Time Web Grounding**: Leverages Google Search to verify facts, check reputations, and identify trends
- 📊 **Transparent Scoring**: Detailed breakdowns showing relevance, quality, and trend scores (0-100)
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- ⚡ **Fast Performance**: Optimized with Vite for instant hot module replacement
- 🔗 **Source Citations**: All recommendations include verifiable web sources

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cism-Ch/OfferAnalyst.git
   cd OfferAnalyst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:3000` (or the port shown in your terminal)

---

## 📚 Usage

### Basic Workflow

1. **Input Offers**: Add offers you want to analyze (e.g., apartments, job postings, products)
2. **Set Context**: Define your user profile with:
   - **Explicit Criteria**: Budget, location, specific requirements
   - **Implicit Context**: Personal situation, priorities, preferences
   - **Domain**: Category of offers (Real Estate, Jobs, Products, etc.)
3. **Analyze**: Click "Analyze" to trigger AI-powered ranking
4. **Review Results**: Explore scored offers with detailed justifications and web insights

### Example Use Case: Real Estate

```
User Profile:
- Explicit: "Budget 800k EUR, Paris, family with 2 kids"
- Implicit: "Safety priority, near schools, quiet neighborhood"
- Domain: "Real Estate"

Offers: [Various Paris apartments with different prices and locations]

Result: Ranked list with safety ratings, school proximity data, 
        neighborhood trends, and market analysis from recent web sources
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 19.2** | UI framework with latest concurrent features |
| **TypeScript 5.8** | Type-safe development |
| **Vite 6.2** | Lightning-fast build tool and dev server |
| **Gemini 2.5 Flash** | AI model for analysis and search grounding |
| **Recharts 3.5** | Data visualization for score breakdowns |
| **Tailwind CSS** | Utility-first styling (via inline classes) |

---

## 📁 Project Structure

```
OfferAnalyst/
├── components/
│   ├── InputSection.tsx      # User input form for offers and profile
│   └── ResultCard.tsx         # Display component for scored offers
├── services/
│   └── geminiService.ts       # Gemini API integration and analysis logic
├── App.tsx                    # Main application component
├── types.ts                   # TypeScript interfaces and types
├── constants.tsx              # Sample data and reusable components
├── index.tsx                  # Application entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 🧮 How It Works

OfferAnalyst uses a **3-Phase Algorithm**:

### Phase 1: Internal Analysis
Matches offers against explicit user criteria (price, location, specifications)

### Phase 2: Web Enrichment
Uses Gemini's `googleSearch` tool to gather real-time data:
- Reputation checks (reviews, ratings)
- Trend analysis (market movements, popularity)
- Contextual facts (neighborhood safety, company reviews, etc.)

### Phase 3: Final Scoring
Combines all factors into a weighted score (0-100) with breakdown:
- **Relevance** (40%): Match to user criteria
- **Quality** (35%): Intrinsic value and condition
- **Trend** (25%): Market momentum and reputation

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build production-ready bundle
npm run preview   # Preview production build locally
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and TypeScript conventions
- Test your changes thoroughly
- Update documentation if needed
- Keep commits atomic and descriptive

---

## 📄 License

This project is available as open source. Feel free to use it for personal or commercial projects.

---

## 🙏 Acknowledgments

- **Google Gemini Team** for the powerful 2.5 Flash model and search grounding capabilities
- **React Team** for the excellent framework
- **Vite Team** for blazing-fast tooling

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/Cism-Ch/OfferAnalyst/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/Cism-Ch/OfferAnalyst/issues)
- 📧 **Questions**: Create a discussion in the repository

---

<div align="center">

**Made with ❤️ using React, TypeScript, and Google Gemini**

⭐ Star this repo if you find it useful!

</div>
