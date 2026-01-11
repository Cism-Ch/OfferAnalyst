# OfferAnalyst - Features Documentation

## 🎯 Core Features

### 1. AI-Powered Offer Analysis

OfferAnalyst uses advanced AI models to analyze and rank offers based on your specific context and criteria.

#### How It Works:
1. **Context Understanding**: The AI comprehends both explicit criteria (hard requirements) and implicit context (subjective preferences)
2. **Multi-Factor Scoring**: Each offer is scored on:
   - **Relevance (50%)**: How well the offer matches your explicit criteria
   - **Quality (30%)**: Overall quality and value of the offer
   - **Trend (20%)**: Market position and timing advantages
3. **Justification**: AI provides detailed reasoning for each ranking
4. **Web Research**: Optional market insights from web search

#### Supported Domains:
- 💼 Job Opportunities
- 🏠 Real Estate
- 🛍️ Products & Services
- 💰 Investments
- 📚 Education Programs
- And more...

---

### 2. Smart Data Management

#### Saved Offers
- **Persistent Storage**: All saved offers are stored in browser localStorage
- **Quick Access**: One-click saving from analysis results
- **Bulk Operations**: Select multiple offers for comparison or organization
- **Smart Organization**: AI-powered categorization and timeline generation

#### Search History
- **Automatic Tracking**: Every analysis is automatically saved
- **Pin System**: Mark important searches for quick access
- **Full-Text Search**: Search across domain, criteria, and results
- **Selective Cleanup**: Clear old searches while preserving pinned items
- **One-Click Restore**: Restore complete search context instantly

---

### 3. Projects Management

Combine multiple research sessions into organized projects for complex decision-making.

#### Project Creation Wizard:
1. **Define**: Set project name and objectives
2. **Source**: Select relevant searches from history
3. **Review**: Confirm and create

#### Use Cases:
- 📊 Market Research: Combine insights from multiple searches
- 🎯 Decision Making: Aggregate related options
- 📁 Organization: Group related research by topic or timeframe
- 🔍 Cross-Domain Analysis: Compare options across different categories

---

### 4. Advanced Comparison

Side-by-side detailed comparison of 2-3 offers with visual analytics.

#### Comparison Features:
- **Score Breakdown**: Visual progress bars for each scoring dimension
- **AI Justification**: Understand the reasoning behind each score
- **Web Insights**: Additional market context and research
- **Category Tags**: Quick identification of offer types
- **Location & Price**: Easy comparison of key metrics

#### Best Practices:
- Select similar offer types for meaningful comparison
- Review AI justifications to understand trade-offs
- Use score breakdowns to identify strengths and weaknesses
- Consider web insights for market context

---

### 5. Multi-Model AI Support

Choose from various AI models based on your needs:

#### Available Models:

**DeepSeek R1** (Recommended)
- ✅ Advanced reasoning capabilities
- ✅ Strong context understanding
- ✅ Excellent for complex analysis
- 💰 Cost-effective

**GPT-4 Turbo**
- ✅ Industry-leading performance
- ✅ Excellent at nuanced understanding
- ✅ Great for detailed justifications
- 💰 Premium pricing

**Claude 3.5 Sonnet**
- ✅ Strong analytical capabilities
- ✅ Excellent safety and accuracy
- ✅ Great for complex criteria
- 💰 Mid-tier pricing

**Gemini 2.5 Flash Preview**
- ✅ Very fast responses
- ✅ Good for quick analyses
- ✅ Free tier available
- 💰 Free/Low-cost

#### Model Selection Tips:
- Use DeepSeek R1 for best value and performance
- Use GPT-4 for maximum accuracy on critical decisions
- Use Gemini Flash for quick testing and prototyping
- Switch models in the header dropdown anytime

---

### 6. Auto-Fetch Capability

Let AI automatically search the web for relevant offers.

#### How Auto-Fetch Works:
1. Enable "Auto-Fetch" toggle in configuration
2. AI analyzes your domain and context
3. Searches multiple sources for relevant offers
4. Returns structured offer data with URLs
5. Proceeds to analysis automatically

#### Benefits:
- ⚡ Save time on manual data collection
- 🎯 AI finds offers you might have missed
- 🔍 Access to real-time market data
- 📊 Comprehensive market coverage

#### When to Use:
- Initial market research
- Discovering new options
- Validating assumptions
- Expanding your search scope

---

## 🎨 User Interface

### Dark/Light Theme
- Toggle between dark and light modes
- System preference detection
- Smooth transitions
- Consistent styling across all pages

### Responsive Design
- Mobile-friendly layouts
- Tablet optimization
- Desktop-first approach
- Adaptive navigation

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Semantic HTML structure
- Screen reader compatibility

---

## 💾 Data & Privacy

### Local Storage
- All data stored in browser localStorage
- No server-side data persistence
- Full user control over data
- Easy export/import (future feature)

### API Key Security
- Keys stored in environment variables
- Server-side API calls only
- No exposure to client
- Secure OpenRouter integration

### Data Retention
- Offers: Until manually deleted
- History: Until cleared or unpinned items removed
- Projects: Until manually deleted
- Preferences: Persisted across sessions

---

## 🔄 Workflow Examples

### Job Search Workflow
1. Set domain to "Jobs"
2. Define criteria: "Salary > 120k, Remote, Tech Stack: React/Next.js"
3. Add context: "Looking for senior role with growth opportunities"
4. Enable Auto-Fetch or paste job listings
5. Review ranked results with AI justifications
6. Save top 3-5 candidates
7. Compare finalists side-by-side
8. Create project to track application process

### Real Estate Workflow
1. Set domain to "Real Estate"
2. Define criteria: "Budget 500k-700k, 3+ bedrooms, Paris suburbs"
3. Add context: "Family-friendly neighborhood, good schools, low crime"
4. Paste property listings from various sources
5. AI ranks based on criteria + market trends
6. Save interesting properties
7. Use Smart Organize for timeline view
8. Compare top properties for final decision

### Product Research Workflow
1. Set domain to "Products - Laptops"
2. Define criteria: "Budget $1500-2000, 16GB RAM, M3 or better"
3. Add context: "For development work, need good battery life"
4. Enable Auto-Fetch for latest models
5. Review AI rankings with spec comparisons
6. Save shortlist to collection
7. Monitor saved offers over time for price changes
8. Make final decision with comparison view

---

## 🚀 Advanced Tips

### Optimizing AI Analysis
- Be specific with explicit criteria
- Provide rich context about priorities
- Use the right model for your needs
- Review AI justifications to learn

### Managing Large Collections
- Use Smart Organize regularly
- Pin important searches
- Create projects for major decisions
- Clear old history periodically

### Efficient Workflows
- Save templates in pinned searches
- Reuse project structures
- Compare similar offer types
- Leverage search history for patterns

---

## 🔮 Upcoming Features

- 📤 Export saved offers to CSV/PDF
- 🔔 Price/status change notifications
- 🤝 Collaborative projects (share with team)
- 📈 Historical trend analysis
- 🎯 Custom scoring weights
- 🔄 Automated periodic re-analysis
- 💬 Chat with your data
- 🌐 Multi-language support

---

For more information, visit the [main README](./README.md) or explore the [documentation](./docs/).
