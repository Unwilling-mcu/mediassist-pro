# MediAssist Pro 🏥

A full-stack AI-powered medical companion app — symptom analysis, nearby hospital map, AI chat, patient profile, prescriptions, and wearable device integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + CSS Variables |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| AI | Anthropic Claude (symptom checker + chat) |
| Maps | Leaflet.js + OpenStreetMap |
| State | Zustand |
| HTTP | Axios |

## Features

- 🩺 **AI Symptom Checker** — Describe symptoms, get AI-powered analysis with possible conditions, severity, and specialist recommendations
- 🗺️ **Nearby Care Map** — Real hospitals and clinics with live map, directions, phone, hours, fees
- 💬 **AI Medical Assistant** — Claude-powered chat with full patient context
- 👤 **Patient Profile** — Age, weight, height, BMI calculator, blood group, allergies, medical history
- 💊 **Prescriptions** — Save, track, refill medications with dosage schedule
- ⌚ **Wearables** — Simulated smart watch vitals (heart rate, SpO2, steps, sleep)
- 🔐 **Auth** — Register / Login with JWT

## Project Structure

```
mediassist-pro/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # All page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # Zustand global state
│   │   ├── api/          # Axios API layer
│   │   └── styles/       # Global CSS
├── server/          # Node.js + Express backend
│   ├── config/      # DB connection
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API route definitions
│   ├── controllers/ # Business logic
│   └── middleware/  # Auth middleware
```

## Setup

### 1. Clone & Install

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:
```
MONGODB_URI=mongodb://localhost:27017/mediassist
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

App runs at **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new patient |
| POST | /api/auth/login | Login |
| GET | /api/patients/me | Get patient profile |
| PUT | /api/patients/me | Update profile |
| POST | /api/symptoms/analyze | AI symptom analysis |
| GET | /api/prescriptions | Get all prescriptions |
| POST | /api/prescriptions | Add prescription |
| POST | /api/ai/chat | AI medical chat |
| GET | /api/vitals | Get vital logs |
| POST | /api/vitals | Save vital reading |
