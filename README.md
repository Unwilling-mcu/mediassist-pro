# 🏥 MediAssist Pro

**AI-powered medical companion app** — Symptom checker, real nearby hospitals, doctor booking, live chat, prescriptions, health analytics, and wearables integration.

[![Live Demo](https://img.shields.io/badge/Live-mediassist--pro.vercel.app-00D4A8?style=flat-square)](https://mediassist-pro.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Unwilling--mcu/mediassist--pro-181717?style=flat-square&logo=github)](https://github.com/Unwilling-mcu/mediassist-pro)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🩺 **AI Symptom Checker** | Describe symptoms → Claude/Llama AI gives possible conditions, severity, specialist recommendation |
| 📍 **Real Nearby Care** | GPS-based real hospitals & clinics anywhere in India via OpenStreetMap |
| 📅 **Doctor Booking** | Book appointments with real Asansol doctors, time slots, confirmation |
| 💬 **Doctor Live Chat** | Real-time Socket.io messaging with doctors |
| 🤖 **AI Medical Assistant** | Claude-powered chat with full patient context |
| 💊 **Prescriptions** | Save, track, refill medications — export as PDF |
| 📊 **Health Analytics** | Weekly/monthly charts — heart rate, BP, steps, sleep, glucose |
| ⌚ **Wearables** | Web Bluetooth pairing — Samsung, Apple Watch, Fitbit, Garmin |
| 🔔 **Reminders** | Browser push notifications for medication times |
| 👤 **Patient Profile** | BMI auto-calc, blood group, allergies, emergency contacts |
| 📱 **PWA** | Install as mobile/desktop app — works offline |
| 🎨 **Themes** | Dark / Light / System auto-detect |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS Variables (Dark/Light themes) |
| State | Zustand |
| Charts | Recharts |
| Maps | Leaflet + OpenStreetMap (free) |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| AI | Groq (Llama 3.1 — free) |
| Hospital Data | OpenStreetMap Overpass API (free, real GPS) |
| PDF Export | jsPDF |
| PWA | Service Worker + Web App Manifest |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Groq API key (free — https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/Unwilling-mcu/mediassist-pro.git
cd mediassist-pro
```

### 2. Setup Server
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGODB_URI  = mongodb+srv://user:pass@cluster0.xxx.mongodb.net/mediassist
JWT_SECRET   = your_secret_key_here
GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxx
PORT         = 5000
CLIENT_URL   = http://localhost:5173
NODE_ENV     = development
```

```bash
npm run dev
```

### 3. Setup Client
```bash
cd ../client
npm install
npm run dev
```

Open **http://localhost:5173** → Register → You're in! ✅

---

## 🌍 Deploy (Free)

### Backend → Railway
1. https://railway.app → New Project → Deploy from GitHub
2. Root directory: `server`
3. Add environment variables (same as .env above + `NODE_ENV=production`)
4. Generate domain → copy URL

### Frontend → Vercel
1. https://vercel.com → New Project → Import repo
2. Root directory: `client`
3. Add env variable: `VITE_API_URL = https://your-app.up.railway.app`
4. Deploy → Live! 🎉

---

## 📱 Install as App

**Android (Chrome):** Open app URL → 3 dots → Add to Home Screen

**iPhone (Safari):** Open URL → Share → Add to Home Screen

**Desktop:** Open URL → Install icon in address bar

---

## 📁 Project Structure

```
mediassist-pro/
├── client/                    # React + Vite frontend
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── sw.js              # Service worker
│   │   └── icons/             # PWA icons (72–512px)
│   └── src/
│       ├── api/               # Axios API layer
│       ├── components/        # All page components
│       │   ├── Analytics/     # Health charts (Recharts)
│       │   ├── Appointments/  # Appointment management
│       │   ├── Auth/          # Login / Register
│       │   ├── Booking/       # Doctor booking
│       │   ├── Chat/          # AI Assistant
│       │   ├── Dashboard/     # Home with mini charts
│       │   ├── DoctorChat/    # Live Socket.io chat
│       │   ├── Layout/        # Sidebar, Topbar
│       │   ├── Nearby/        # GPS-based map
│       │   ├── Prescriptions/ # Medication tracker
│       │   ├── Profile/       # Patient profile + BMI
│       │   ├── Reminders/     # Push notifications
│       │   ├── Settings/      # Theme + preferences
│       │   ├── Symptom/       # AI symptom checker
│       │   └── Wearables/     # Bluetooth devices
│       ├── hooks/             # useLiveVitals, usePWA, useSocket, useReminders
│       ├── services/          # pdfService, notificationService
│       └── store/             # Zustand global state
└── server/                    # Node.js + Express backend
    ├── config/                # MongoDB connection
    ├── controllers/           # Auth, patient logic
    ├── middleware/            # JWT auth
    ├── models/                # User, Patient, Prescription, Vital, Appointment, Message
    ├── routes/                # All API routes
    └── socket/                # Socket.io chat handler
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login |
| GET/PUT | `/api/patients/me` | Get/update profile |
| POST | `/api/symptoms/analyze` | AI symptom analysis |
| GET/POST | `/api/prescriptions` | Manage prescriptions |
| GET/POST | `/api/vitals` | Health readings |
| POST | `/api/ai/chat` | AI medical chat |
| GET | `/api/hospitals?lat=&lng=` | Real nearby hospitals (GPS) |
| GET/POST | `/api/appointments` | Appointment management |
| GET/POST | `/api/messages/:roomId` | Chat messages |

---

## 🌐 Free Services Used

| Service | Usage | Cost |
|---------|-------|------|
| Groq | AI chat + symptom analysis | Free (14,400 req/day) |
| OpenStreetMap | Real hospital data (GPS) | Free (unlimited) |
| MongoDB Atlas | Database | Free (512MB) |
| Vercel | Frontend hosting | Free |
| Railway | Backend hosting | Free ($5/month credit) |

---

## 📸 Screenshots

> Dashboard · Symptom Checker · Nearby Map · Doctor Chat · Analytics

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

Made with ❤️ for patients across India 🇮🇳