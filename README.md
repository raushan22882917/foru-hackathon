# ThreadSense AI - Intelligent Community Brain

*AI-powered forum enhancement system for the Foru Hackathon*

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🧠 Overview

ThreadSense AI transforms traditional online forums into intelligent community platforms. Built for the Foru Hackathon, this system provides real-time AI insights, automated moderation, smart reply assistance, and comprehensive community health analytics.

## ✨ Features

- **🤖 Smart Reply Assistant** - AI-powered contextual response suggestions
- **📝 TL;DR Bot** - Automatic summarization for long discussions
- **🛡️ AI Moderator** - Real-time content analysis and safety screening
- **💭 Sentiment Meter** - Community mood and emotional tone analysis
- **📊 Community Health Dashboard** - Comprehensive analytics and insights
- **🔗 Smart Suggestions** - Intelligent content recommendations

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/raushan22882917/foru-hackathon.git
   cd foru-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys (see ENV_VARIABLES.md for details)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **AI Engine**: Google Gemini AI
- **Styling**: Tailwind CSS with custom gradients
- **UI Components**: shadcn/ui with Radix UI
- **Backend Integration**: Foru.ms API
- **State Management**: React hooks with intelligent caching

## 📖 Documentation

- **[Project Story](ThreadSense_AI_Story.md)** - Complete development journey and technical details
- **[Technical Report](ThreadSense_AI_Project_Report.txt)** - LaTeX-formatted comprehensive report
- **[Environment Setup](ENV_VARIABLES.md)** - API keys and configuration guide

## 🎯 Key Components

### ThreadSense AI Engine (`lib/threadsense-ai.ts`)
Central intelligence system that coordinates all AI features with caching and error handling.

### Smart Components
- `components/smart-reply-assistant.tsx` - Contextual response generation
- `components/tldr-bot.tsx` - Automatic content summarization
- `components/ai-moderator.tsx` - Content safety analysis
- `components/sentiment-meter.tsx` - Emotional tone detection
- `components/threadsense-dashboard.tsx` - Community health analytics

## 🔧 Configuration

The system requires several API keys and configuration options. See `ENV_VARIABLES.md` for detailed setup instructions.

## 🤝 Contributing

This project was built for the Foru Hackathon. Feel free to explore the code, suggest improvements, or adapt it for your own forum platform.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🏆 Hackathon Submission

ThreadSense AI represents a comprehensive solution to modern forum challenges, demonstrating how AI can enhance rather than replace human community interaction. The system successfully integrates multiple AI capabilities into a cohesive, user-friendly platform that makes online communities more accessible, safer, and more engaging.

---

*Built with ❤️ for the Foru Hackathon by [Raushan Kumar](https://github.com/raushan22882917)*
