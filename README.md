# 🏛️ CivicSense — AI-Driven Municipal Complaint System

An intelligent civic platform that uses **NLP, Computer Vision, and Geospatial Analytics** to automatically classify, prioritize, and route citizen complaints to the right municipal department — modeled after **Mumbai's BMC Ward system**.

---

## 📌 Project Overview

Citizens submit complaints (text, voice, or image). The AI engine instantly:
1. **Classifies** the issue (Roads, Water, Sanitation, etc.) using `BART-MNLI`
2. **Scores urgency** (critical/high/medium/low) using `DistilBERT` + keyword analysis
3. **Routes** to the correct department automatically
4. **Detects duplicates** using semantic embeddings (`MiniLM-L6-v2` + pgvector)
5. **Analyzes images** with `YOLOv8` for visual triage
6. **Transcribes voice** complaints via `Whisper`
7. **Maps to BMC wards** using Shapely point-in-polygon

Officers resolve complaints with **mandatory proof-of-work notes**, and citizens can **verify resolutions** in real-time.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind + Shadcn/UI |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL + pgvector) |
| AI/ML | HuggingFace Transformers, YOLOv8, Whisper, SentenceTransformers |
| Maps | React Leaflet + Shapely + Geopy |
| Real-time | WebSockets |

---

## 🚀 Deployment Strategy

CivicSense is optimized for cost-effective, high-performance cloud deployment:

### 1. Backend (Hugging Face Spaces)
The backend is containerized via `Dockerfile` and hosted on **Hugging Face Spaces**.
- **Hardware:** 16GB RAM (Free Tier) to accommodate BART, YOLOv8, and Whisper models.
- **Port:** 7860 (Internal HF requirement).
- **Environment Variables Required:**
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `JWT_SECRET`
  - `JWT_ALGORITHM`

### 2. Frontend (Vercel)
The React/Vite frontend is deployed on **Vercel**.
- **Dynamic Configuration:** Uses `VITE_API_URL` and `VITE_WS_URL` to connect to the Hugging Face backend.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Docker (optional, for local container testing)
- A free [Supabase](https://supabase.com) account

### 1. Clone & Install Backend

```bash
git clone https://github.com/<your-username>/DevCraft.git
cd DevCraft/backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

### 2. Setup Database

Open the **Supabase SQL Editor** and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'city_admin')),
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    category TEXT,
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    department TEXT,
    status TEXT DEFAULT 'submitted',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT, image_url TEXT, audio_url TEXT,
    latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
    ward TEXT, area TEXT,
    embedding VECTOR(384),
    duplicate_group_id UUID, sla_eta TEXT, duplicate_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id),
    resolution_note TEXT, resolution_image_url TEXT
);
```

### 3. Configure Environment

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
```

> Get these from Supabase → Project Settings → API.

### 4. Seed Demo Users

```bash
python seed.py
```

### 5. Install Frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the App

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📖 Usage Instructions

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@example.com` | `password123` |
| Admin | `admin@city.gov` | `adminpassword` |
| Officer (Roads) | `roads@city.gov` | `password123` |
| Officer (Water) | `water@city.gov` | `password123` |
| Officer (Sanitation) | `sanitation@city.gov` | `password123` |

> All 7 department officers follow the pattern `<dept>@city.gov` / `password123`.

### Citizen Flow
1. **Register/Login** as a citizen
2. Click **"Report Issue"** on the landing page
3. **Describe** the problem (text or voice)
4. **Mark location** on the interactive map (GPS auto-captures)
5. **Attach a photo** (optional — analyzed by YOLOv8)
6. **Submit** — the AI classifies, scores, and routes it instantly
7. Check **"Track Complaint"** to see live status and resolution proof

### Officer/Admin Flow
1. **Login** as admin or an officer
2. View the **Dashboard** with live metrics, heatmap, and charts
3. **Filter** complaints by status, urgency, or department
4. **Update status**: Start Phase → Resolve (with mandatory note) or Reject (with reason)
5. Citizens can then **verify the resolution proof**

---

## 📸 Screenshots

> Replace these placeholders with actual screenshots. Save images in `docs/screenshots/` and update paths below.

### Landing Page
<!-- ![Landing Page](docs/screenshots/landing_page.png) -->
`📸 Screenshot: Landing page hero section`

### Complaint Form
<!-- ![Complaint Form](docs/screenshots/complaint_form.png) -->
`📸 Screenshot: Multi-step form with map`

### Admin Dashboard
<!-- ![Admin Dashboard](docs/screenshots/admin_dashboard.png) -->
`📸 Screenshot: Dashboard with heatmap and service log`

### Resolution Proof
<!-- ![Resolution Dialog](docs/screenshots/resolution_dialog.png) -->
`📸 Screenshot: Officer entering resolution note`

### Citizen Status Tracker
<!-- ![Status Tracker](docs/screenshots/status_tracker.png) -->
`📸 Screenshot: Complaint status with "View Proof" button`

---

## 👥 Team — DevCraft

> Add team member names here.

---

<p align="center"><b>Built with ❤️ for Smart Governance</b></p>