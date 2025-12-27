<p align="center">
  <img src="https://img.shields.io/badge/🚨_SAARTHI-Disaster_Management_System-FF6B35?style=for-the-badge&labelColor=1a1a2e" alt="Saarthi Banner"/>
</p>

<h1 align="center">
  🛡️ SAARTHI
</h1>

<p align="center">
  <strong>Smart AI-Assisted Response & Tactical Hazard Intelligence</strong>
</p>

<p align="center">
  <em>An advanced disaster management and emergency response platform designed specifically for India</em>
</p>

<p align="center">
  <a href="https://predictaid.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-predictaid.vercel.app-2ea44f?style=for-the-badge&logo=vercel" alt="Live Demo"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square&logo=pwa" alt="PWA"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Offline-Ready-success?style=flat-square" alt="Offline Ready"/>
  <img src="https://img.shields.io/badge/AI-Powered-blueviolet?style=flat-square" alt="AI Powered"/>
  <img src="https://img.shields.io/badge/Multilingual-10+_Languages-orange?style=flat-square" alt="Multilingual"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Features in Detail](#-features-in-detail)
- [Offline Capabilities](#-offline-capabilities)
- [API Integrations](#-api-integrations)
- [Edge Functions](#-edge-functions)
- [Security](#-security)
- [Future Optimizations](#-future-optimizations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**SAARTHI** (Smart AI-Assisted Response & Tactical Hazard Intelligence) is a comprehensive disaster management and emergency response platform built specifically for India. It combines real-time disaster monitoring, AI-powered assistance, offline capabilities, and emergency services to help citizens prepare for, respond to, and recover from natural disasters.

**🔴 Live Demo:** [https://predictaid.vercel.app/](https://predictaid.vercel.app/)

### 🎯 Mission

To provide every Indian citizen with accessible, reliable, and intelligent disaster preparedness tools that work even in the most challenging conditions—including areas with poor connectivity.

### 🌍 Focus Area

The platform is specifically designed for **India**, with:
- State-level disaster tracking across all 28 states and 8 union territories
- Integration with Indian emergency services (102, 108, 100, 101)
- Support for 10+ Indian languages
- Location-aware features using Indian geographic boundaries

---

## 🚀 Key Features

### 🗺️ Real-Time Disaster Monitoring

| Feature | Description |
|---------|-------------|
| **Live Heatmap** | Interactive map showing disaster intensity and affected areas across India |
| **Multi-Source Data** | Aggregates data from USGS, GDACS, and weather services |
| **Earthquake Tracking** | Real-time earthquake monitoring with magnitude and depth information |
| **Cyclone Alerts** | Cyclone path prediction and intensity tracking |
| **Flood Monitoring** | Water level alerts and flood-prone area identification |
| **Fire Detection** | Wildfire and urban fire alerts |
| **Landslide Warnings** | Risk assessment based on terrain and rainfall data |

### 🤖 AI-Powered Assistance

| Feature | Description |
|---------|-------------|
| **Copilot Chat** | AI assistant for disaster guidance and emergency advice |
| **Disaster Predictions** | ML-based predictions for potential disaster events |
| **Intelligent Routing** | Smart evacuation route suggestions |
| **Context-Aware Responses** | Location and situation-specific recommendations |

### 🆘 Emergency SOS System

| Feature | Description |
|---------|-------------|
| **One-Touch SOS** | Quick emergency alert with single button press |
| **Emergency Contacts** | Manage and notify personal emergency contacts |
| **Location Sharing** | Automatic GPS coordinates included in alerts |
| **Offline Queuing** | Alerts queued when offline, sent when connection restored |
| **Email Notifications** | Automated emergency emails to contacts |

### 🌤️ Comprehensive Weather Intelligence

| Feature | Description |
|---------|-------------|
| **Current Conditions** | Real-time temperature, humidity, wind speed |
| **US EPA AQI** | Air Quality Index on 0-500 scale with PM2.5/PM10 data |
| **7-Day Forecast** | Extended weather predictions |
| **Hourly Forecast** | Hour-by-hour weather breakdown |
| **Weather Alerts** | Severe weather warnings and advisories |
| **UV Index** | Sun exposure recommendations |
| **Sunrise/Sunset** | Daylight timing information |

### 📍 Emergency Services Locator

| Feature | Description |
|---------|-------------|
| **Nearby Hospitals** | Find closest medical facilities |
| **Police Stations** | Locate law enforcement |
| **Fire Stations** | Emergency fire services |
| **Shelters** | Evacuation centers and relief camps |
| **Distance Calculation** | Haversine formula for accurate distances |
| **Navigation** | Turn-by-turn directions using Leaflet Routing |

### 📱 Progressive Web App (PWA)

| Feature | Description |
|---------|-------------|
| **Installable** | Add to home screen on any device |
| **Offline Support** | Full functionality without internet |
| **Push Notifications** | Real-time disaster alerts (planned) |
| **Fast Loading** | Service worker caching |
| **Responsive Design** | Works on mobile, tablet, and desktop |

---

## 🛠️ Technology Stack

### Frontend

┌─────────────────────────────────────────────────────────┐│                     FRONTEND                            │├─────────────────────────────────────────────────────────┤│  Framework        │  React 18.3.1 with TypeScript       ││  Build Tool       │  Vite 5.x                           ││  Styling          │  Tailwind CSS 3.4+ with shadcn/ui   ││  State Management │  TanStack Query (React Query)       ││  Routing          │  React Router DOM 6.x               ││  Maps             │  Leaflet + React-Leaflet            ││  Charts           │  Recharts + Chart.js                ││  Animations       │  Tailwind Animate                   ││  Forms            │  React Hook Form + Zod              ││  Icons            │  Lucide React                       │└─────────────────────────────────────────────────────────┘
### Backend (Supabase)

┌─────────────────────────────────────────────────────────┐│                      BACKEND                            │├─────────────────────────────────────────────────────────┤│  Platform         │  Supabase                           ││  Edge Functions   │  Deno Runtime                       ││  Database         │  PostgreSQL (if needed)             ││  Authentication   │  Supabase Auth (ready)              ││  Real-time        │  Supabase Realtime (ready)          │└─────────────────────────────────────────────────────────┘
### Offline Capabilities

┌─────────────────────────────────────────────────────────┐│                  OFFLINE STACK                          │├─────────────────────────────────────────────────────────┤│  Storage          │  IndexedDB (idb library)            ││  Map Caching      │  Custom tile caching system         ││  AI Translation   │  HuggingFace Transformers.js        ││  Service Worker   │  Vite PWA Plugin                    ││  Knowledge Base   │  Embedded medical/disaster guides   │└─────────────────────────────────────────────────────────┘
---

## 🏗️ Architecture

┌──────────────────────────────────────────────────────────────────┐│                          USER INTERFACE                          ││  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ││  │Dashboard │ │ Heatmap  │ │Emergency │ │  Weather │ │AI Chat  │ ││  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ ││       │            │            │            │            │      │├───────┴────────────┴────────────┴────────────┴────────────┴──────┤│                         CORE SERVICES                            ││  ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐    ││  │  API Service   │ │ Offline Sync   │ │  Location Service  │    ││  │  (api.ts)      │ │ (useOfflineSync)│ │  (Geolocation)     │    ││  └────────┬───────┘ └────────┬───────┘ └─────────┬──────────┘    │├───────────┴──────────────────┴───────────────────┴───────────────┤│                        DATA LAYER                                ││  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              ││  │   IndexedDB  │ │   Supabase   │ │  External    │              ││  │   (Offline)  │ │   (Backend)  │ │  APIs        │              ││  └──────────────┘ └──────────────┘ └──────────────┘              │└──────────────────────────────────────────────────────────────────┘
### Directory Structure

saarthi/├── 📁 public/│   ├── icon-192x192.png      # PWA icon (small)│   ├── icon-512x512.png      # PWA icon (large)│   └── robots.txt            # SEO configuration│├── 📁 src/│   ├── 📁 assets/│   │   └── hero-banner.jpg   # Landing page hero image│   ││   ├── 📁 components/│   │   ├── 📁 ui/            # shadcn/ui components (40+ components)│   │   ├── AIChat.tsx        # AI chat interface│   │   ├── AnimatedBackground.tsx│   │   ├── CopilotChat.tsx   # AI copilot assistant│   │   ├── DashboardNavbar.tsx│   │   ├── DashboardSidebar.tsx│   │   ├── DisasterGuidelines.tsx│   │   ├── DisasterList.tsx  # Disaster event cards│   │   ├── DynamicIsland.tsx # iOS-style status island│   │   ├── EmergencyContactsDialog.tsx│   │   ├── EmergencySOS.tsx  # SOS button & alerts│   │   ├── EmergencyServicesMap.tsx│   │   ├── HeatmapOverview.tsx  # Main disaster heatmap│   │   ├── OfflineIndicator.tsx # Connectivity status│   │   ├── OfflineMapManager.tsx # Map download manager│   │   ├── SimpleMap.tsx     # Basic map component│   │   └── WeatherWidget.tsx # Weather dashboard│   ││   ├── 📁 hooks/│   │   ├── use-mobile.tsx    # Mobile detection│   │   ├── use-toast.ts      # Toast notifications│   │   └── useOfflineSync.ts # Offline data sync│   ││   ├── 📁 integrations/│   │   └── 📁 supabase/│   │       ├── client.ts     # Supabase client config│   │       └── types.ts      # Type definitions│   ││   ├── 📁 pages/│   │   ├── Dashboard.tsx     # Main dashboard│   │   ├── Emergency.tsx     # Emergency page│   │   ├── Index.tsx         # Landing page│   │   ├── Install.tsx       # PWA install guide│   │   └── NotFound.tsx      # 404 page│   ││   ├── 📁 types/│   │   ├── emergency.ts      # Emergency types│   │   └── index.ts          # Core types│   ││   ├── 📁 utils/│   │   ├── api.ts            # API functions (disasters, weather, facilities)│   │   ├── mapTileCache.ts   # Offline map tile caching│   │   ├── offlineKnowledge.ts    # Offline medical/disaster guides│   │   ├── offlineStorage.ts      # IndexedDB operations│   │   ├── offlineTileLayer.ts    # Custom Leaflet tile layer│   │   └── offlineTranslation.ts  # AI-powered translations│   ││   ├── App.tsx               # Main app component│   ├── App.css               # Global styles│   ├── index.css             # Tailwind imports & design tokens│   └── main.tsx              # App entry point│├── 📁 supabase/│   ├── config.toml           # Supabase configuration│   └── 📁 functions/│       ├── 📁 copilot-chat/  # AI chat edge function│       ├── 📁 nearby/        # Nearby facilities finder│       ├── 📁 predict-disasters/  # AI disaster prediction│       ├── 📁 send-emergency-alert/ # Email alerts│       └── 📁 weather/       # Weather API proxy│├── index.html                # HTML template├── tailwind.config.ts        # Tailwind configuration├── vite.config.ts            # Vite configuration└── package.json              # Dependencies
---

## 💻 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- **Supabase** account (for backend features)

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd saarthi

# 2. Install dependencies
npm install
# or
bun install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
# or
bun dev

# 5. Open in browser
# Navigate to http://localhost:5173
Environment VariablesCode snippet# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Optional: OpenWeather API (for enhanced weather data)
OPENWEATHER_API_KEY=your_openweather_api_key
📖 Features in Detail🗺️ Interactive HeatmapThe heart of SAARTHI is its interactive disaster heatmap built on Leaflet.Capabilities:Real-time disaster event visualizationColor-coded severity levels (Low/Medium/High)Multiple map layers (Street, Satellite, Terrain, Dark)Disaster type filtering (Earthquake, Flood, Cyclone, Fire, Landslide)Cluster grouping for multiple eventsCustom markers with detailed popupsHeat layer overlay showing intensity distributionData Sources:USGS Earthquake API (magnitude 2.5+, last 30 days)GDACS (Global Disaster Alert Coordination System)Open-Meteo for weather overlays🌡️ Air Quality Index (AQI)Real-time air quality monitoring using the US EPA AQI Scale (0-500):AQI RangeCategoryHealth Implications0-50GoodAir quality is excellent51-100ModerateAcceptable for most people101-150Unhealthy for SensitiveSensitive groups should limit exposure151-200UnhealthyEveryone may experience health effects201-300Very UnhealthyHealth warnings of emergency conditions301-500HazardousHealth alert - stay indoorsPollutants Tracked:PM2.5 (Fine Particulate Matter) - μg/m³PM10 (Coarse Particulate Matter) - μg/m³NO₂ (Nitrogen Dioxide)O₃ (Ozone)🤖 AI Copilot FeaturesThe AI assistant provides intelligent support:Online Mode (Cloud AI):Powered by Google GeminiContext-aware disaster guidancePersonalized safety recommendationsMulti-turn conversationsStreaming responses for real-time interactionOffline Mode (Local AI):Comprehensive offline knowledge baseMedical emergency guides (10+ conditions)Disaster response protocols (7+ disaster types)Emergency kit checklistsKeyword-based intelligent search🌍 Multilingual SupportSAARTHI supports 10 Indian languages with offline translation:LanguageCodeScriptEnglishenLatinHindihiDevanagariTamiltaTamilBengalibnBengaliTeluguteTeluguMarathimrDevanagariGujaratiguGujaratiKannadaknKannadaMalayalammlMalayalamPunjabipaGurmukhiTranslation Engine: HuggingFace Transformers.js with NLLB-200 model📴 Offline CapabilitiesSAARTHI is built with an Offline-First philosophy.IndexedDB Data StoresTypeScriptinterface OfflineDB {
  disasters: DisasterEvent[];       // Cached disaster events
  weather: WeatherData[];           // Cached weather data
  facilities: EmergencyFacility[]; // Hospitals, police, fire stations
  mapTiles: Blob[];                 // Cached map tiles
  guidelines: string[];             // Disaster guidelines
  pendingAlerts: EmergencyAlert[]; // Queued SOS alerts
}
Offline Map CachingPre-downloadable Regions:RegionArea CoveredApproximate SizeDelhi NCRDelhi, Noida, Gurgaon, Faridabad~50 MBMumbaiMumbai Metropolitan Region~45 MBBangaloreBengaluru Urban & Rural~40 MBAll IndiaPan-India coverage (zoom 5-12)~500 MBFeatures:Progressive tile downloadingDownload progress indicatorCache size managementRegion deletion capabilityAutomatic tile serving when offlineOffline Knowledge BaseMedical Emergencies:Heart Attack responseCPR instructionsBleeding controlFracture managementBurn treatmentChoking (Heimlich maneuver)Stroke recognition (FAST)Seizure responsePoisoning protocolsHeatstroke treatmentDisaster Protocols:Earthquake (Drop, Cover, Hold)Flood safetyCyclone preparationFire escape plansTsunami warningsLandslide responseEmergency kit checklistGeneral Safety:All India emergency numbersEvacuation guidelinesShelter findingFirst aid kit contentsWater purification methods🔌 API IntegrationsExternal APIsAPIPurposeRate LimitUSGS EarthquakeReal-time earthquake dataUnlimitedGDACSMulti-hazard disaster alertsUnlimitedOpenWeatherWeather & air quality1000/day (free)Open-MeteoWeather forecastsUnlimitedOverpass (OSM)Emergency facility locationsFair useNominatimGeocoding & location search1 req/secAPI Response ExamplesDisaster Event:JSON{
  "id": "usgs_nc75106941",
  "type": "earthquake",
  "severity": "medium",
  "magnitude": 4.5,
  "location": {
    "lat": 26.85,
    "lng": 75.80,
    "name": "Rajasthan"
  },
  "time": "2024-01-15T10:30:00Z",
  "title": "Magnitude 4.5 Earthquake - Rajasthan",
  "description": "Detected in Rajasthan, India - Depth: 10.5 km"
}
Weather Data:JSON{
  "temperature": 32,
  "humidity": 65,
  "windSpeed": 12,
  "condition": "partly cloudy",
  "airQuality": {
    "aqi": 156,
    "quality": "Unhealthy for Sensitive",
    "pm25": 55.2,
    "pm10": 112.8
  },
  "forecast": [...]
}
⚡ Edge FunctionsSAARTHI uses Supabase Edge Functions for serverless backend logic:/weatherProxies OpenWeather API requests with:Current weather conditionsAir quality data with US EPA AQI calculation7-day forecastHourly breakdownWeather alerts/copilot-chatAI chat functionality:Streams responses via SSEIntegration with Google Gemini APISystem prompt for disaster contextConversation history support/predict-disastersAI-powered disaster prediction:Location-based risk assessmentWeather pattern analysisHistorical data consideration/send-emergency-alertEmergency notification system:Email alerts to emergency contactsLocation information includedNearby disaster contextTimestamp and status tracking/nearbyEmergency facility finder:Queries Overpass APIFinds hospitals, police, fire stationsDistance calculationsOpen 24/7 filtering🔒 SecurityBest Practices Implemented✅ No API keys in frontend - All sensitive keys stored in Supabase secrets✅ CORS configuration - Proper headers on all edge functions✅ Input validation - Zod schemas for form validation✅ Secure location handling - User permission required✅ Offline data encryption - IndexedDB with app isolationSecurity HeadersTypeScriptconst corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
🔮 Future Optimizations🎯 Planned FeaturesPhase 1: Enhanced Notifications[ ] Push Notifications - Real-time disaster alerts via Web Push API[ ] SMS Integration - Critical alerts via SMS for feature phones[ ] WhatsApp Alerts - Integration with WhatsApp Business API[ ] Voice Alerts - Audio notifications for visually impaired usersPhase 2: Advanced AI[ ] Image Analysis - Upload photos of damage for AI assessment[ ] Voice Commands - Hands-free emergency interactions[ ] Predictive Routing - AI-optimized evacuation paths[ ] Crowd Intelligence - Aggregated user reports for real-time situational awarenessPhase 3: Community Features[ ] Volunteer Network - Connect with local disaster response volunteers[ ] Resource Sharing - Community inventory of emergency supplies[ ] Check-in System - Mark yourself safe for friends/family[ ] Live Updates - Crowdsourced disaster reportingPhase 4: Government Integration[ ] NDMA Integration - Direct feeds from National Disaster Management Authority[ ] IMD Weather - India Meteorological Department data[ ] SDMA Connectivity - State-level disaster management coordination[ ] Emergency Services API - Direct 112 integration🚀 Performance OptimizationsOptimizationStatusImpactCode Splitting✅ Done-40% initial loadImage Lazy Loading✅ Done-60% image bandwidthService Worker Caching✅ DoneInstant repeat visitsVirtual Scrolling📋 PlannedHandle 1000+ eventsWebSocket for Real-time📋 PlannedReduce API pollingEdge Caching📋 PlannedFaster API responsesBundle Analysis📋 PlannedIdentify bloatTree Shaking✅ DoneMinimal bundle size📊 Analytics & Monitoring[ ] User Analytics - Track feature usage for improvements[ ] Error Tracking - Sentry integration for bug monitoring[ ] Performance Metrics - Core Web Vitals monitoring[ ] API Health - Uptime monitoring for external APIs🌐 Accessibility[ ] Screen Reader Support - Full ARIA implementation[ ] Keyboard Navigation - Complete keyboard accessibility[ ] High Contrast Mode - For users with visual impairments[ ] Reduced Motion - Respect user motion preferences[ ] Font Scaling - Support system font size preferences🔋 Battery & Data Optimization[ ] Low Power Mode - Reduced updates when battery is low[ ] Data Saver Mode - Minimal API calls on metered connections[ ] Background Sync - Smart data synchronization[ ] Compression - Brotli/gzip for all API responses🤝 ContributingWe welcome contributions! Here's how you can help:Development WorkflowFork the repositoryCreate a feature branch (git checkout -b feature/amazing-feature)Commit your changes (git commit -m 'Add amazing feature')Push to the branch (git push origin feature/amazing-feature)Open a Pull RequestCode StandardsTypeScript strict modeESLint configurationPrettier formattingComponent documentationUnit test coveragePriority Areas🔴 High Priority: Push notifications, SMS integration🟡 Medium Priority: Voice commands, image analysis🟢 Good First Issues: Documentation, accessibility improvements📄 LicenseThis project is licensed under the MIT License - see the LICENSE file for details.🙏 AcknowledgmentsUSGS - Earthquake dataGDACS - Global disaster coordinationOpenWeather - Weather and air quality dataOpenStreetMap - Map data and Overpass APIHuggingFace - Offline AI translation modelsSupabase - Backend infrastructureshadcn/ui - Beautiful UI componentsLucide - Icon library<p align="center"><strong>Made with ❤️ for India's Safety</strong></p><p align="center"><img src="https://img.shields.io/badge/🇮🇳_Jai_Hind-saffron?style=for-the-badge" alt="Jai Hind"/></p>
