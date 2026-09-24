# 🎓 Smart Campus Lost & Found System
### Powered by Google Gemini 2.5 Flash (`@google/genai` SDK), React, Node.js & PostgreSQL

An autonomous, multimodal Lost & Found platform designed for university campuses. The system automates the reconnecting of students with their belongings by analyzing both visual data (photographs, wear and tear, color nuances, logos/stickers) and contextual data (locations, timestamps, textual descriptions) with LLM reasoning.

---

## 🌟 Key Features

1. **Multimodal Reporting:** Submit lost or found items with photos (upload from device or paste direct image URL), campus locations, timestamps, and detailed descriptions.
2. **Automated AI Matching Engine:** Powered by `@google/genai` and `gemini-2.5-flash`, the engine automatically scans candidate counterpart items upon report submission.
3. **Structured Confidence Scoring & Explanation:** Assigns a strict 0-100% confidence score and generates an objective 2-3 sentence explanation referencing specific visual or textual details.
4. **Side-by-Side Comparison:** Direct modal comparison allowing students and administrators to inspect lost vs found items side-by-side.
5. **Search & Discovery Feed:** Full-text keyword search with category filtering across 7 target domains and status toggling (Active vs Resolved).

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18 with Vite, Tailwind CSS, TypeScript (Strict Mode), React Hook Form, Zod Resolver, Lucide Icons.
- **Backend:** Node.js with Express.js, TypeScript (Strict Mode), CORS, 5MB body limits.
- **Database:** PostgreSQL with `uuid-ossp` and parameterized SQL queries (`$1, $2`).
- **AI Integration:** `@google/genai` SDK using `gemini-2.5-flash` with JSON `responseSchema` enforcing `{ confidence_score: INTEGER, explanation: STRING }`.
- **Validation:** Runtime Zod validation on both client forms and server endpoints.

---

## 📂 Project Structure

```text
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx             # Campus navigation and header wrapper
│   │   │   ├── ItemCard.tsx           # Item card with badges and actions
│   │   │   ├── MatchScoreBadge.tsx    # Tiered visual indicator (Red/Yellow/Green)
│   │   │   ├── ReportForm.tsx         # React Hook Form + Zod submit form
│   │   │   ├── MatchList.tsx          # AI match cards and side-by-side modal
│   │   │   └── SearchBar.tsx          # Filter controls and search input
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Dashboard with stats and recent reports
│   │   │   ├── ReportLostPage.tsx     # Lost item reporting flow
│   │   │   ├── ReportFoundPage.tsx    # Found item reporting flow
│   │   │   ├── SearchPage.tsx         # Search and discovery feed
│   │   │   └── ItemDetailPage.tsx     # Detailed view & Top AI Matches
│   │   ├── lib/
│   │   │   ├── api.ts                 # Typed API client
│   │   │   └── types.ts               # Shared TypeScript schemas
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── items.controller.ts    # REST route handlers
│   │   ├── routes/
│   │   │   └── items.routes.ts        # Express router
│   │   ├── services/
│   │   │   ├── ai.service.ts          # Gemini 2.5 Flash SDK matching engine
│   │   │   └── db.service.ts          # Parameterized PostgreSQL client
│   │   ├── schemas/
│   │   │   └── item.schema.ts         # Zod schemas & models
│   │   └── server.ts                  # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.sql                     # Production PostgreSQL DDL
│   └── seed.sql                       # Campus sample items & matches
├── .env.example
└── .env
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v26)
- **PostgreSQL**: PostgreSQL 14+ running locally or on a cloud instance

### 2. Configure Environment Variables
Create or verify `.env` in the root and in `backend/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://kuchireddynikhilreddy@localhost:5432/campus_lost_found
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database
Initialize the schema and seed sample data:
```bash
# Apply schema:
psql $DATABASE_URL -f database/schema.sql

# Seed campus items:
psql $DATABASE_URL -f database/seed.sql
```

### 4. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 5. Run the Application
In separate terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Web application opens on http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Query items with `?type=lost&category=Electronics&search=...` |
| `GET` | `/api/items/:id` | Fetch single item by UUID |
| `POST` | `/api/items` | Create new item; triggers AI matching engine |
| `GET` | `/api/items/:id/matches` | Fetch AI matches sorted by `confidence_score DESC` |
| `POST` | `/api/trigger-match/:id` | Manually re-trigger AI matching against database |
| `PATCH` | `/api/items/:id/status` | Update status (`active` / `resolved`) |
| `GET` | `/api/stats` | Dashboard statistics & metrics |
| `GET` | `/health` | Healthcheck and database status |

---

## 🤖 AI Matching Details

When comparing candidates, Gemini 2.5 Flash enforces:
1. **Multimodal Analysis:** Analyzes visual photos for wear marks, specific stickers, color tone, and physical identifiers.
2. **Timeline Consistency:** Validates that an item was not found before it was lost.
3. **Structured Response Schema:** Enforces standard JSON output:
```json
{
  "confidence_score": 94,
  "explanation": "Both items are 32oz blue Hydro Flasks with silver caps, identical Yosemite national park vinyl stickers, and a specific dent on the bottom rim. Locations (Library 2nd floor and adjacent Quad benches) and timeline are directly consistent."
}
```
