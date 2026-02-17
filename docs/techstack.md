# CivicSense Technical Architecture & Stack

## Frontend

Framework:
- React

UI:
- shadcn components

Styling:
- Tailwind CSS

Components:
- forms
- cards
- tables
- modals
- alerts

Deployment:
- Vercel

---

## Backend

Framework:
- FastAPI (Python)

Responsibilities:
- APIs
- routing engine
- ML pipeline integration
- authentication

Deployment:
- Render / Railway

---

## AI / ML Layer

### NLP Classification
- HuggingFace transformers
- Zero-shot model (BART-MNLI)

### Urgency Detection
- keyword severity scoring
- sentiment analysis

### Duplicate Detection
- SentenceTransformers
- cosine similarity

---

## Voice Processing

- Whisper API (optional)

---

## Image Processing (Optional)

- YOLOv8 pretrained model

---

## Database

Primary:
- Supabase PostgreSQL

---

### complaints table

id
text
category
urgency
department
timestamp
location
status
embedding
duplicate_group_id


---

### users table

id
role
department
email
password


---

## Authentication

- Supabase Auth
OR
- JWT via FastAPI

Roles:
- citizen
- officer
- city_admin

---

## API Contracts

### POST /submit-complaint

Input:
text
image(optional)
voice(optional)
location(optional)


Output:
category
urgency
department
ticket_id


---

### GET /complaints

Filters:
department
urgency
status


---

### PATCH /status/{id}

Updates complaint progress.

---

### GET /duplicate-groups

Returns clustered complaints.

---


## Deployment Architecture

React Frontend (Vercel)
↓
FastAPI Backend (Render)
↓
Supabase PostgreSQL
↓
ML Models inside backend




---

## Deployment Architecture

React Frontend (Vercel)
↓
FastAPI Backend (Render)
↓
Supabase PostgreSQL
↓
ML Models inside backend


---

## Risk Mitigation

| Risk | Strategy |
|------|---------|
Model latency | use pretrained models |
Voice errors | fallback to text |
Deployment failure | maintain local backup |
Data scarcity | synthetic training samples |