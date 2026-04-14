# ProxiSense – Hyperlocal Service Marketplace

ProxiSense is a production-grade, full-stack service marketplace designed to connect customers with local experts in seconds. Built with a focus on speed, reliability, and modern aesthetics, it provides a seamless end-to-end experience for both users and service providers.

![ProxiSense Banner](https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features

- **Hyperlocal Discovery**: Real-time geolocation-based search to find the nearest professionals.
- **Smart Booking System**: Streamlined, secure booking flow with instant confirmations.
- **Real-time Tracking**: Live status updates for all active service requests.
- **Professional Dashboards**: Tailored experiences for both Customers and Service Providers.
- **Rich Communication**: Integrated messaging system for direct interaction with experts.
- **Verified Trust**: Comprehensive rating system and identity verification badges.
- **Responsive Design**: Premium, glassmorphic UI that works perfectly on all devices.## 🤖 AI Core (New)

- **Gemini NLP Search**: Search using natural language (e.g. "My sink is leaking urgently") powered by Gemini 1.5 Flash.
- **AI Recommendation Engine**: Intelligent, location-aware service suggestions with trending "AI Choice" picks.
- **Smart Chat Assistant**: Global AI guide (💬) to help you troubleshoot repairs and navigate the platform.
- **Auto-Diagnosis**: AI-powered problem identifier with estimated repair costs.

## 🛠️ Tech Stack

### Frontend
- **React 18** (Modern functional components & Hooks)
- **Tailwind CSS & Framer Motion** (Premium UI/UX and micro-animations)
- **Lucide React** (Clean, professional iconography)
- **Axios** (Centralized API client with JWT interceptors)

### Backend
- **Spring Boot 3** (Secure, scalable REST architecture)
- **Google Gemini 1.5 Flash** (State-of-the-art LLM provider)
- **Spring Security** (JWT-based session management)
- **MySQL (TiDB Cloud)** (Production-grade database)

## 📦 Getting Started

### 1. Environment Config
Add your Gemini API key to `backend/src/main/resources/application.properties`:
```properties
gemini.api.key=YOUR_GEMINI_API_KEY
```

### 2. Run the App
- **Backend**: `mvn spring-boot:run`
- **Frontend**: `npm start`

## 🔐 Security & Reliability

- **JWT Auth**: Secure stateless sessions.
- **AI Fallback**: The app automatically uses standard filters if the AI engine is unavailable.
- **Performance**: AI Search response target is sub-1.5s.

---

© 2026 ProxiSense AI. All rights reserved.
oxiSense AI. All rights reserved.
