# Galileo's Lenses - Architecture Documentation

## 🏗️ System Architecture Overview

Galileo's Lenses is built as a modern single-page application (SPA) with a clear separation between the user interface, AI services, and data layer.

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  (React Components + TypeScript + Tailwind CSS)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     APPLICATION CORE                         │
│  • State Management  • Routing  • Event Handling            │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼──────────┐
    │   AI SERVICES     │   │   DATA LAYER      │
    │   • Gemini API    │   │   • 608 Pubs      │
    │   • Voice Chat    │   │   • Graph Data    │
    │   • Text Chat     │   │   • OSDR API      │
    └───────────────────┘   └───────────────────┘
```

---

## 📦 Component Architecture

### Layer 1: Presentation Components (`src/components/`)

These are the UI building blocks users interact with:

#### **HomePage.tsx**
- **Purpose:** Landing page and entry point
- **Key Features:**
  - Hero section with mission statement
  - Feature overview cards
  - Statistics dashboard
  - Call-to-action buttons
- **Data Flow:** Displays static content + real-time stats from data layer

#### **VoiceChat.tsx** (Galileo AI)
- **Purpose:** Voice-based AI interaction
- **Key Features:**
  - Audio input/output handling
  - Real-time transcription display
  - Animated avatar (3D face)
  - Connection status indicator
- **Dependencies:**
  - `voiceService.ts` for AI responses
  - `audio-recorder.ts` for microphone capture
  - `audio-streamer.ts` for playback
  - `genai-live-client.ts` for Gemini Live API

#### **ChatInterface.tsx**
- **Purpose:** Text-based AI chat
- **Key Features:**
  - Message history
  - Typing indicators
  - Citation display
  - Copy/share functionality
- **Dependencies:**
  - `geminiService.ts` for AI responses
  - `processedPublications.ts` for context

#### **KnowledgeGraph.tsx**
- **Purpose:** 3D visualization of research relationships
- **Key Features:**
  - Force-directed graph layout
  - Node clustering by topic
  - Interactive zoom/pan/rotate
  - Click for details
- **Dependencies:**
  - `graphData.ts` for node/edge data
  - Three.js or similar for rendering

#### **GapAnalysisView.tsx**
- **Purpose:** Display research opportunity analysis
- **Key Features:**
  - Gap categories (organism, methodology, duration)
  - Severity indicators (high/medium/low)
  - Evidence lists
  - Recommendations
- **Dependencies:**
  - `gapAnalysisService.ts` for analysis computation

#### **ForecastView.tsx**
- **Purpose:** Predictive health analytics
- **Key Features:**
  - Mission duration selector
  - Risk timeline charts
  - Countermeasure suggestions
  - Confidence intervals
- **Dependencies:**
  - `predictiveService.ts` for forecasting algorithms

#### **OSDRPanel.tsx**
- **Purpose:** NASA OSDR database integration
- **Key Features:**
  - Study search interface
  - Metadata display
  - Link to raw data
  - File listings
- **Dependencies:**
  - `osdrService.ts` for API calls

#### **OverviewCharts.tsx**
- **Purpose:** Statistical visualizations
- **Key Features:**
  - Publication distribution charts
  - Research area breakdowns
  - Timeline views
  - Summary metrics
- **Dependencies:**
  - `graphData.ts` for aggregated data
  - Recharts library for charting

---

### Layer 2: Service Layer (`src/services/`)

These handle business logic and external API interactions:

#### **geminiService.ts**
```typescript
Purpose: Text-based AI interactions using Google Gemini

Key Functions:
- ask(prompt, options): Send question, get AI response
- Context building from 608 publications
- Relevance scoring for publication search
- Response formatting with citations

Flow:
1. User asks question
2. Search 608 publications for relevant content
3. Build context prompt with relevant papers
4. Send to Gemini API
5. Parse and format response
6. Return with citations
```

#### **voiceService.ts**
```typescript
Purpose: Voice chat using Gemini Live API

Key Functions:
- initializeVoiceSession(): Setup audio streams
- sendAudioChunk(): Stream microphone data
- receiveAudioResponse(): Get AI voice response
- transcribeAudio(): Convert speech to text

Flow:
1. User speaks into microphone
2. Audio recorder captures chunks
3. Send to Gemini Live API
4. Receive AI response (audio + text)
5. Stream audio to speakers
6. Display transcript
```

#### **gapAnalysisService.ts**
```typescript
Purpose: Identify research gaps in 608 publications

Key Functions:
- analyzeResearchGaps(): Main analysis function
- identifyOrganismGaps(): Find understudied species
- identifyMethodologyGaps(): Find unused techniques
- calculateCoverageScore(): Overall completeness metric

Algorithm:
1. Load all 608 publications
2. Extract metadata (organisms, methods, topics)
3. Build frequency distributions
4. Identify statistical outliers (gaps)
5. Rank by severity
6. Generate recommendations
```

#### **predictiveService.ts**
```typescript
Purpose: Health risk forecasting for space missions

Key Functions:
- forecastHealthRisks(): Generate risk timeline
- calculateRadiationDose(): Cumulative exposure
- predictBoneLoss(): Skeletal health trajectory
- suggestCountermeasures(): Evidence-based interventions

Algorithm:
1. Accept mission parameters (duration, destination)
2. Query 608 publications for relevant data
3. Apply mathematical models (exponential decay, etc.)
4. Calculate confidence intervals
5. Match countermeasures from literature
6. Generate visualizable forecast
```

#### **osdrService.ts**
```typescript
Purpose: Integration with NASA OSDR API

Key Functions:
- searchOSDRStudies(): Query OSDR database
- getStudyMetadata(): Fetch detailed study info
- getStudyFiles(): List available data files
- linkPublicationToStudy(): Connect paper to dataset

API Endpoints:
- Search: https://osdr.nasa.gov/osdr/data/search
- Metadata: https://osdr.nasa.gov/osdr/data/osd/meta
- Files: https://osdr.nasa.gov/osdr/data/osd/files
```

#### **knowledge608.ts**
```typescript
Purpose: Utilities for working with 608 publications

Key Functions:
- is608Publication(): Validate publication source
- loadAllPublications(): Load full dataset
- filterByTags(): Search by metadata
- getPublicationById(): Retrieve single paper
```

---

### Layer 3: Data Layer (`src/data/`)

#### **nasaPapersData.ts**
```typescript
Structure: Array of 608 publication objects

Each publication contains:
{
  id: string              // Unique identifier (csv-1 to csv-608)
  title: string           // Full paper title
  link: string            // URL to full text
  abstract: string        // Paper abstract
  summary: string         // Short summary
  source: "csv608"        // Source identifier
}

Size: ~4800 lines of code
Total: 608 publications
Format: TypeScript array literal
```

#### **processedPublications.ts**
```typescript
Purpose: Load and enhance publication data

Key Functions:
- getPublications(): Async loader with caching
- loadRealPublications(): Convert raw data to typed format
- Adds tags for categorization
- Adds metadata (authors, dates, topics)

Enhancements:
- Tag extraction from abstracts
- Topic classification
- Organism detection
- Methodology identification
```

#### **graphData.ts**
```typescript
Purpose: Knowledge graph structure data

Key Functions:
- getGraphData(): Returns nodes and edges
- getClusters(): Returns topic groupings
- getMetrics(): Returns time-series data
- getSampleStory(): Returns interactive narrative

Data Structures:
- Nodes: {id, label, type, metadata}
- Edges: {source, target, weight, type}
- Clusters: {id, name, nodeIds, color}
```

---

## 🔄 Data Flow Examples

### Example 1: User Asks a Question via Text Chat

```
User Types: "What causes bone loss in space?"
       ↓
ChatInterface.tsx captures input
       ↓
Calls geminiService.ask()
       ↓
geminiService searches 608 publications
  - Keyword match: "bone", "loss", "space"
  - Finds 15 relevant papers
  - Extracts key excerpts
       ↓
Builds prompt: "Based on these NASA publications: [excerpts]
                Answer: What causes bone loss in space?"
       ↓
Sends to Gemini API
       ↓
Receives AI response with analysis
       ↓
Formats response with citations
       ↓
Returns to ChatInterface.tsx
       ↓
Displays in chat window with clickable paper links
```

### Example 2: Gap Analysis Generation

```
User clicks "Gap Analysis" tab
       ↓
GapAnalysisView.tsx loads
       ↓
Calls gapAnalysisService.analyzeResearchGaps()
       ↓
Service loads all 608 publications
       ↓
Statistical analysis:
  - Count publications per organism
  - Count publications per methodology
  - Count publications per research area
  - Identify outliers (< 5 publications)
       ↓
Rank gaps by severity:
  - High: < 2 publications
  - Medium: 2-5 publications
  - Low: 5-10 publications
       ↓
Generate recommendations using AI
       ↓
Return structured gap report
       ↓
Display in categorized lists with visualizations
```

### Example 3: Voice Chat Interaction

```
User clicks "Connect Voice"
       ↓
VoiceChat.tsx initializes
       ↓
Calls voiceService.initializeVoiceSession()
       ↓
Sets up:
  - Audio recorder (microphone)
  - Audio streamer (speakers)
  - WebSocket to Gemini Live API
       ↓
User speaks: "Tell me about radiation effects"
       ↓
Audio recorder captures PCM data
       ↓
Chunks sent to Gemini Live API in real-time
       ↓
API processes speech:
  - Transcribes to text
  - Searches 608 publications
  - Generates response
  - Synthesizes speech
       ↓
Audio chunks received
       ↓
Audio streamer plays response
       ↓
Transcript displayed in UI
       ↓
3D avatar animates while speaking
```

---

## 🗄️ State Management

### Global State (React Context/Hooks)
```typescript
App.tsx maintains:
- activeView: Current page ('home', 'chat', 'graph', etc.)
- selectedNode: Currently selected graph node
- graphData: Full knowledge graph
- analysisResult: Latest gap analysis
- publications: All 608 papers (cached)
```

### Component State (useState)
Each component manages its own UI state:
- Loading indicators
- Form inputs
- Expanded/collapsed sections
- Temporary selections

---

## 🔌 External API Integration

### Google Gemini API
```
Purpose: AI intelligence
Authentication: API key in environment variables
Endpoints:
  - Text: generateContent()
  - Voice: bidiGenerateContent() (streaming)
Rate Limits: Managed by SDK
Error Handling: Fallback to cached responses
```

### NASA OSDR API
```
Purpose: Dataset access
Authentication: Public (no key required)
Base URL: https://osdr.nasa.gov/osdr/data/
Endpoints:
  - /search: Query studies
  - /osd/meta: Study details
  - /osd/files: Data files
Error Handling: Display user-friendly messages
```

---

## 🎨 UI Component Library

### Radix UI (Accessible Primitives)
- Dialog, Popover, Tooltip
- Tabs, Accordion, Dropdown
- All keyboard-navigable
- Screen reader friendly

### Custom Components (`src/components/ui/`)
- Button: Styled action buttons
- Card: Content containers
- Badge: Status indicators
- Input: Form fields
- All built with Tailwind CSS

---

## 🔧 Build & Deployment

### Development
```bash
npm run dev
# Starts Vite dev server on localhost:5173
# Hot module replacement enabled
# Environment variables from .env
```

### Production Build
```bash
npm run build
# Creates optimized bundle in /build
# Minifies JavaScript and CSS
# Generates source maps
# Output size: ~2-3 MB
```

### Deployment Options
- **Vercel:** Auto-deploy from Git
- **Netlify:** Drag-and-drop /build folder
- **GitHub Pages:** Static hosting
- **AWS S3:** Cloud storage + CloudFront

---

## 📊 Performance Optimizations

### Code Splitting
- Lazy load components not needed immediately
- Separate bundles for voice chat (large audio libs)
- Dynamic imports for heavy visualizations

### Data Caching
- 608 publications loaded once, cached in memory
- Graph data pre-computed, not generated on-demand
- API responses cached with timestamp expiry

### Asset Optimization
- Images lazy-loaded and sized appropriately
- Icons from icon font (Lucide React)
- CSS purged of unused styles (Tailwind)

---

## 🔒 Security Considerations

### API Keys
- Never committed to Git (.env in .gitignore)
- Stored in environment variables
- Different keys for dev/production

### User Data
- No personal data collected
- No user authentication required
- All processing client-side

### External APIs
- All HTTPS connections
- CORS properly configured
- Error messages don't leak sensitive info

---

## 🧪 Testing Strategy

### Manual Testing
- Feature walkthroughs
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness
- Voice chat in various conditions

### Future Automated Testing
- Unit tests for services
- Integration tests for API calls
- E2E tests for user flows
- Performance benchmarks

---

## 📈 Scalability

### Current Capacity
- 608 publications: Loads in < 1 second
- Knowledge graph: Handles 500+ nodes smoothly
- Concurrent users: Unlimited (client-side processing)

### Future Growth
- Could handle 10,000+ publications
- Graph algorithms optimized for large datasets
- Consider backend API for very large scales
- Database for real-time publication updates

---

## 🛠️ Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 | UI components |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite 6.3 | Fast bundling |
| **Styling** | Tailwind CSS | Responsive design |
| **UI Library** | Radix UI | Accessible components |
| **AI** | Google Gemini | Text & voice AI |
| **Audio** | Web Audio API | Voice processing |
| **Charts** | Recharts | Data visualization |
| **3D Graphics** | Three.js | Knowledge graph |
| **Icons** | Lucide React | UI icons |
| **Deployment** | Vite Build | Static files |

---

## 📁 Project Structure
```
galileo-lenses/
├── src/
│   ├── components/          # UI components
│   │   ├── HomePage.tsx
│   │   ├── VoiceChat.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── KnowledgeGraph.tsx
│   │   ├── GapAnalysisView.tsx
│   │   ├── ForecastView.tsx
│   │   └── ui/             # Reusable UI elements
│   ├── services/           # Business logic
│   │   ├── geminiService.ts
│   │   ├── voiceService.ts
│   │   ├── gapAnalysisService.ts
│   │   ├── predictiveService.ts
│   │   └── osdrService.ts
│   ├── data/               # 608 publications
│   │   ├── nasaPapersData.ts
│   │   ├── processedPublications.ts
│   │   └── graphData.ts
│   ├── lib/                # Core libraries
│   │   ├── genai-live-client.ts
│   │   ├── audio-recorder.ts
│   │   └── audio-streamer.ts
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── public/                 # Static assets
├── docs/                   # Documentation
└── package.json           # Dependencies
```

---

**Galileo's Lenses** - Built for scale, designed for clarity
