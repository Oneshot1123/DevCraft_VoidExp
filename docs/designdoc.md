# CivicSense Dashboard Design Document

## Purpose

The dashboard is designed for municipal authorities to:

1. Identify urgent issues
2. Allocate resources effectively
3. Monitor department workload

This is an operational decision dashboard.

---

## Dashboard Access

### Citizen
No dashboard access.

### Department Officer
- department-specific complaints
- status updates

### City Admin
- full system dashboard
- cross-department oversight

---

## Layout Structure

### Header
- city name
- date/time
- user role
- alerts indicator

---

### Sidebar Navigation

- Overview
- Complaints
- Departments
- Urgent Alerts
- Duplicate Clusters

---

## Main Panels

### 1) City Overview Cards

Displays:
- total complaints today
- urgent complaints
- resolved vs pending
- department load

---

### 2) Priority Queue

Table showing:
- complaint text
- department
- urgency
- location
- submission time
- status

Sorted by urgency.

---

### 3) Department Workload

Cards per department:

- Sanitation
- Roads
- Water
- Electricity
- Safety
- Traffic

Each shows:
- open complaints
- urgent cases
- resolved today

---

### 4) Duplicate Complaint Clusters

Displays:
- issue summary
- number of similar reports
- area
- first reported time

---

### 5) Urgent Alerts Panel

Highlights:
- fire hazards
- exposed electrical wires
- flooding
- accident risks

---

### 6) Complaint Detail View

Shows:
- full complaint
- AI classification
- urgency reasoning
- department assigned
- duplicate cluster
- status update option

---

## Visual Principles

- urgency color coding
- card-based UI
- operational clarity
- minimal analytics charts