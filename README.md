# Galileo's Lenses - AI-Powered NASA Bioscience Research Explorer

**NASA Space Apps Challenge 2025 | Build the Biosignature**

An AI-powered web application that transforms how researchers explore NASA's 608 bioscience publications through voice interactions, knowledge graphs, and intelligent analysis.

## 🏆 Challenge Overview

Galileo's Lenses addresses NASA's challenge to make decades of space biology research accessible and actionable. We've built a dynamic dashboard that enables scientists, managers, and mission architects to:

- 🔍 **Search** 608 NASA publications with AI intelligence
- 🎙️ **Talk** to Galileo AI assistant using natural voice
- 🕸️ **Visualize** research connections through knowledge graphs
- 📊 **Analyze** research gaps and opportunities
- 🔮 **Predict** health risks for Moon & Mars missions
- 🗄️ **Access** NASA OSDR primary data seamlessly

## 🚀 Features

### Core Features

- **Galileo AI Voice Chat**: Natural voice conversations about NASA space biology research
- **Intelligent Text Chat**: Ask questions and get AI-powered answers with citations
- **Knowledge Graph**: Interactive 3D visualization of research relationships and clusters
- **Gap Analysis**: Automated identification of under-studied areas and research opportunities
- **Predictive Analytics**: Health risk forecasts for space missions with countermeasures
- **OSDR Integration**: Direct access to NASA's Open Science Data Repository
- **Interactive Stories**: Guided research journeys through complex topics
- **Overview Charts**: Statistical visualizations of research distribution

### What Makes Us Special

✅ **All 608 NASA bioscience publications** fully integrated and searchable  
✅ **Multi-modal AI** combining text, voice, and visual interfaces  
✅ **Real-time gap analysis** for research planning and funding decisions  
✅ **Mission-ready predictions** for astronaut health and safety  
✅ **Evidence-based insights** from decades of space biology research

## 🎯 Target Audiences

### 1. Scientists
- Generate new hypotheses from 608 publications
- Identify research gaps for future studies
- Explore related work through knowledge graphs
- Get instant AI answers to complex questions

### 2. Managers
- Identify investment opportunities
- Review research distribution and priorities
- Make data-driven funding decisions
- Access gap analysis reports

### 3. Mission Architects
- Plan safe Moon and Mars missions
- Review health risk forecasts
- Access evidence-based countermeasures
- Link to OSDR experimental data

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Getting a Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173/` (or the next available port).

## 🎙️ Using Galileo AI Voice Chat

1. Click the "Voice Chat" button in the navigation
2. Click "Connect Voice" to initialize the voice system
3. Unmute the microphone and start speaking
4. Galileo AI will respond with audio and animate the face

**Voice Commands:**
- "Tell me about bone loss in space"
- "What research exists on radiation effects?"
- "Explain microgravity countermeasures"

## 🔒 Security Notes

- **Never commit `.env` files** - They are ignored by git
- The `.env` file contains your private API key
- Share `.env.example` with your team (without real keys)
- For production, use proper environment variable management

## 📁 Project Structure

```
galileo-lenses/
├── src/
│   ├── components/          # UI components
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── VoiceChat.tsx    # Galileo AI voice interface
│   │   ├── ChatInterface.tsx # Text chat
│   │   ├── KnowledgeGraph.tsx # 3D graph visualization
│   │   ├── GapAnalysisView.tsx # Research gaps
│   │   ├── ForecastView.tsx  # Health predictions
│   │   └── OSDRPanel.tsx     # OSDR integration
│   ├── services/            # Business logic & AI
│   │   ├── geminiService.ts  # Text chat with Gemini
│   │   ├── voiceService.ts   # Voice chat
│   │   ├── gapAnalysisService.ts # Gap identification
│   │   ├── predictiveService.ts  # Health forecasting
│   │   └── osdrService.ts    # NASA OSDR API
│   ├── data/                # 608 NASA publications
│   │   ├── nasaPapersData.ts # All 608 papers
│   │   ├── processedPublications.ts
│   │   └── graphData.ts      # Knowledge graph data
│   ├── lib/                 # Core libraries
│   │   ├── genai-live-client.ts # Gemini Live API
│   │   ├── audio-recorder.ts
│   │   └── audio-streamer.ts
│   └── types/               # TypeScript types
├── docs/                    # Documentation
│   ├── PROJECT_OVERVIEW.md  # Hackathon submission overview
│   └── ARCHITECTURE.md      # Technical architecture
└── package.json
```

## 🧪 Technologies

## 🧪 Technologies

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite 6.3.5** - Lightning-fast build tool
- **Tailwind CSS** - Responsive styling
- **Radix UI** - Accessible components

### AI & Intelligence
- **Google Gemini API** - Text & voice AI
- **Gemini Live API** - Real-time voice conversations
- **Web Audio API** - Audio processing
- **Natural Language Processing** - Context-aware responses

### Data & Visualization
- **608 NASA Publications** - Complete bioscience dataset
- **Recharts** - Statistical visualizations
- **Three.js** - 3D knowledge graphs
- **OSDR API** - NASA data repository integration

## 📊 By The Numbers

| Metric | Value |
|--------|-------|
| **Publications Indexed** | 608 |
| **AI Models** | 2 (Text + Voice) |
| **Interactive Features** | 8+ |
| **Visualization Types** | 5 |
| **Search Methods** | 4 (Text, Voice, Visual, Semantic) |
| **API Integrations** | 2 (Gemini + OSDR) |

## 📚 Documentation

## 📚 Documentation

### Hackathon Submission Documents
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete project overview and challenge compliance
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and data flow documentation

### Additional Resources
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Future enhancements roadmap
- [OSDR_API_INTEGRATION.md](./OSDR_API_INTEGRATION.md) - NASA OSDR integration details
- [GAP_ANALYSIS.md](./OSDR_AND_GAP_ANALYSIS.md) - Gap analysis methodology
- [Gemini API Docs](https://ai.google.dev/api) - Official API documentation

## 🏆 NASA Space Apps Challenge Compliance

### ✅ Requirements Met
- [x] Uses all 608 NASA bioscience publications
- [x] Functional web application (React + TypeScript)
- [x] Leverages AI (Google Gemini for text and voice)
- [x] Knowledge graphs for visualization
- [x] Interactive search and exploration
- [x] Summarizes research impacts and results
- [x] Enables gap analysis and insights
- [x] OSDR integration for primary data
- [x] Multiple target audience support

### 🌟 Bonus Features
- [x] Voice-based interaction (Galileo AI)
- [x] Predictive health analytics
- [x] Automated gap analysis
- [x] Real-time OSDR integration
- [x] Multi-modal search (text, voice, visual)
- [x] Interactive storytelling
- [x] Mission planning tools

## 🎯 Quick Start Guide

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd galileo-lenses
   npm install
   ```

2. **Configure API Key**
   ```bash
   copy .env.example .env
   # Add your Gemini API key to .env
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Explore Features**
   - Click "Launch Galileo's Lenses" on homepage
   - Try voice chat with Galileo AI
   - Explore knowledge graphs
   - View gap analysis
   - Test predictive analytics

## 🤝 Contributing

Built for NASA Space Apps Challenge 2025. Contributions welcome for future enhancements!

## 📞 Contact

- **Project Name**: Galileo's Lenses
- **Challenge**: Build the Biosignature
- **Event**: NASA Space Apps Challenge 2025
- **Category**: AI & Machine Learning, Data Management

## 🙏 Acknowledgments

- **NASA** - For the 608 bioscience publications and OSDR data
- **Google** - For Gemini AI API
- **Open Source Community** - For amazing tools and libraries

---

**Galileo's Lenses** - *Illuminating the path to safe human space exploration through AI-powered research insights*
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio processing

## 🐛 Troubleshooting

**"Missing API key" error:**
- Make sure you created a `.env` file
- Check that `VITE_GEMINI_API_KEY` is set correctly
- Restart the dev server after changing `.env`

**Voice not working:**
- Ensure you're using Chrome, Firefox, or Edge (Safari not fully supported)
- Check microphone permissions in browser settings
- Make sure you're on HTTPS or localhost

**TypeScript errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that `src/vite-env.d.ts` exists

## 🤝 Contributing

1. Check [IMPROVEMENTS.md](./IMPROVEMENTS.md) for enhancement ideas
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request

## 📄 License

This project uses NASA public research data and Google's Gemini API.
  