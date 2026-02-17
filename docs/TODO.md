# CivicSense — Development TODO (Phased)

> Organized into sequential phases. Complete each phase fully before moving to the next.

---

## Phase 1 — Project Setup & Database

> **Goal:** Get the skeleton of both frontend and backend running with the database ready.

- [ ] Set up FastAPI project structure and folder layout
- [ ] Set up React project with Tailwind CSS and shadcn components
- [ ] Set up Supabase PostgreSQL database
  - [ ] Create `complaints` table (id, text, category, urgency, department, timestamp, location, status, embedding, duplicate_group_id)
  - [ ] Create `users` table (id, role, department, email, password)
- [ ] Implement authentication (Supabase Auth or JWT via FastAPI)
  - [ ] Role-based access: citizen, officer, city_admin

---

## Phase 2 — AI/ML Pipeline (Core Engine)

> **Goal:** Build the intelligence layer — this is the project's main differentiator.

- [ ] **NLP Classification**
  - [ ] Integrate HuggingFace zero-shot model (BART-MNLI)
  - [ ] Classify into 7 labels: sanitation, roads_infra, water, electricity, safety, traffic, other
- [ ] **Urgency Scoring**
  - [ ] Keyword severity scoring
  - [ ] Sentiment analysis integration
  - [ ] Hybrid urgency model (severity-based, not FIFO)
- [ ] **Routing Automation**
  - [ ] Rule-based department dispatch from classification + urgency
  - [ ] Map to 6 departments: Sanitation, Roads, Water, Electricity, Safety, Traffic

---

## Phase 3 — Backend API Endpoints

> **Goal:** Expose the AI engine through clean, working API routes.

- [ ] `POST /submit-complaint` — accepts text, optional image/voice/location; returns category, urgency, department, ticket_id
- [ ] `GET /complaints` — filterable by department, urgency, status
- [ ] `PATCH /status/{id}` — update complaint progress
- [ ] `GET /duplicate-groups` — return clustered complaints
- [ ] Test all endpoints end-to-end with sample complaints

---

## Phase 4 — Citizen Portal (Frontend)

> **Goal:** Build the public-facing complaint submission experience.

- [ ] Complaint submission form (text input, optional voice/image upload, location)
- [ ] Show AI results after submission (category, urgency, department, ticket ID)
- [ ] Complaint status tracking view

---

## Phase 5 — Admin Dashboard (Frontend)

> **Goal:** Build the operational dashboard for city admins and department officers.

- [ ] Header: city name, date/time, user role, alerts indicator
- [ ] Sidebar navigation: Overview, Complaints, Departments, Urgent Alerts, Duplicate Clusters
- [ ] City Overview Cards: total complaints today, urgent count, resolved vs pending, department load
- [ ] Priority Queue table: complaint text, department, urgency, location, time, status (sorted by urgency)
- [ ] Department Workload cards (per department: open, urgent, resolved today)
- [ ] Urgent Alerts panel: fire hazards, exposed wires, flooding, accident risks
- [ ] Complaint Detail View: full complaint, AI classification, urgency reasoning, department, duplicate cluster, status update
- [ ] Department Officer view: department-specific list + status updates
- [ ] Apply visual principles: urgency color coding, card-based UI, operational clarity

---

## Phase 6 — Duplicate Clustering (Tier 2)

> **Goal:** Add semantic duplicate detection to reduce noise.

- [ ] Integrate SentenceTransformers for embeddings
- [ ] Cosine similarity comparison logic
- [ ] Cluster similar complaints and expose via `/duplicate-groups`
- [ ] Duplicate Clusters panel on dashboard (issue summary, count, area, first reported time)

---

## Phase 7 — Voice Input (Tier 2)

> **Goal:** Allow citizens to submit complaints via voice.

- [ ] Integrate Whisper API for speech-to-text
- [ ] Pipe transcribed text into the existing AI pipeline
- [ ] Fallback to text input on voice errors

---

## Phase 8 — Deployment & Polish

> **Goal:** Ship it live and make sure everything works in production.

- [ ] Deploy frontend to **Vercel**
- [ ] Deploy backend to **Render / Railway**
- [ ] Ensure ML models run inside backend (not separate service)
- [ ] Maintain local backup for deployment failure
- [ ] Prepare synthetic training samples if data is scarce
- [ ] End-to-end testing on live deployment

---

## Phase 9 — Demo & Presentation Prep

> **Goal:** Nail the demo and maximize judging scores.

- [ ] Prepare live demo flow:
  1. Citizen submits: *"There is an exposed electric wire near school"*
  2. System classifies → **Electricity**, urgency → **HIGH**, routes → **Electricity Dept**
  3. Duplicate detection → shows similar reports
  4. Dashboard → complaint surfaces as top alert
- [ ] Prepare judge Q&A answers:
  - Why better than existing portals? → Prioritization + automation
  - Where is the AI? → Classification, urgency, duplicates
  - Can cities use this? → Department mapping + scalable API
  - What if scaled? → Resource allocation improvement
- [ ] Position as: *"AI-powered municipal decision support engine"*

---

## Phase 10 — Stretch Goals (Optional)

> **Goal:** Only if time permits after all above phases are solid.

- [ ] Image processing with YOLOv8 pretrained model
- [ ] Analytics trends on dashboard

---

## Success Metrics to Validate

- [ ] Classification accuracy
- [ ] Routing accuracy
- [ ] Triage time reduction
- [ ] Duplicate detection rate
- [ ] Dashboard usability
