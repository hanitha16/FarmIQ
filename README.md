# FarmIQ — Smart Farming. Smarter Decisions.

FarmIQ is an AI-powered agriculture assistant for farmers. It converts crop photos, hyper-local weather metrics, climate risk, and location data into a dynamic **Act Now Score**, enabling farmers to transition from diagnosis to actionable decisions.

---

## 🌟 Key Features
- **Welcome & Auth**: Glassmorphism visual design matching reference layout, password validation, bcrypt password hashing, and SQLite database storage.
- **Header Profile**: Displays the authenticated user's real full name in the dashboard header.
- **Home Guidance Carousel**: 5 auto-sliding banners with touch-swipe support and CTAs.
- **Act Now Score Engine**: Dynamic formula calculating optimal field work windows (`🟢 GOOD TIME TO ACT`, `🟡 CHECK CONDITIONS`, `🔴 WAIT`).
- **AI Crop Health Scanner**: Crop disease diagnosis (Rice, Tomato, Chilli, Maize, Cotton, Groundnut) with step-by-step progress animation and SQLite history persistence.
- **Weather Intelligence**: 7-day forecast, village search, and demo mode fallback (`🟠 Limited Connectivity`).
- **Ask FarmIQ AI Advisor**: Conversational advisor, speech-to-text voice input 🎤, Text-to-Speech playback, and multi-language support (**English**, **Telugu**, **Hindi**).
- **Seed Hub & Stores**: Nearby seed dealer list & certified high-yield seed variety catalog.
- **Farmer Loans & Knowledge**: KCC crop loan eligibility, document checklists, and diagnostic articles.

---

## 🛠️ Technology Stack
- **Frontend**: React + Vite + Lucide Icons + Custom Glassmorphism CSS.
- **Backend**: Python 3.12 + FastAPI + SQLite3 + PyJWT + Passlib (Bcrypt).
- **Dev Servers**:
  - Backend API: `http://127.0.0.1:8001`
  - Frontend SPA: `http://localhost:5173` (or `http://localhost:5174`)

---

## 🚀 Running the Project

### 1. Backend Setup & Startup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Environment Variables
- Plain-text passwords are **NEVER** stored. All user passwords are securely hashed using `bcrypt`.
- Environment variables template available in `.env.example`:
  ```env
  WEATHER_API_KEY=
  AI_API_KEY=
  MAPS_API_KEY=
  SECRET_KEY=farmiq_secret_key
  ```
- Reliable **Demo Mode** fallback operates automatically whenever external API keys are omitted.
