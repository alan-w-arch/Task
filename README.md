# Social Media Scraper Dashboard (ZEBVO Full-Stack Assignment)

A production-ready, scalable, and recruiter-quality **Social Media Scraper Dashboard** built to fetch, process, analyze, and visualize social media discussions related to passport and visa issues from the past 24 hours.

The project follows a **Monorepo architecture** and combines a modern full-stack stack with queue-based NLP workers, optimized PostgreSQL raw SQL operations, and a responsive analytics dashboard built with Next.js.

---

# Live Demo

Frontend Deployment:
https://task-eight-opal.vercel.app/

Backend Swagger API Docs:
https://your-backend-url/swagger

GitHub Repository:
https://github.com/alan-w-arch/Task

---

# Features

* Multi-platform social media scraping
* AI-powered NLP processing pipeline
* Sentiment analysis
* Automatic language detection
* Translation support
* Duplicate thread clustering
* AI-generated summaries
* Full-text search and filtering
* Real-time analytics dashboard
* CSV & PDF export support
* Queue-based scalable backend architecture
* Offline fallback heuristics when Gemini API is unavailable

---

# Dashboard Preview

> Add screenshots here before submission.

```md
![Dashboard](./assets/dashboard.png)
```

---

# Tech Stack

## Frontend

* **Framework:** Next.js 16 (App Router & React 19)
* **Styling:** Tailwind CSS v4 & Glassmorphism UI
* **State Management:** Zustand
* **Server State Caching:** TanStack Query (React Query)
* **Charts & Analytics:** Recharts
* **Icons:** Lucide React

## Backend

* **Framework:** NestJS 10 & TypeScript
* **Database:** PostgreSQL / Supabase
* **Database Driver:** Raw SQL via `pg`
* **Queues & Workers:** BullMQ + Redis
* **Scheduling:** NestJS Schedule
* **API Documentation:** Swagger

## AI / NLP Pipeline

* Google Gemini API
* Language Detection
* Translation
* Sentiment Analysis
* Categorization
* Semantic Clustering
* AI Summarization
* Spam / Gibberish Detection

---

# Project Structure

```bash
Task/
├── shared/            # Shared TypeScript types and utilities
├── backend/           # NestJS backend service
│   └── src/
│       ├── db/        # PostgreSQL raw SQL setup & schema
│       ├── nlp/       # NLP processors and Gemini integration
│       ├── scrapers/  # Reddit, Twitter, YouTube scrapers
│       ├── posts/     # Posts API controllers/services
│       ├── analytics/ # Aggregation and metrics services
│       └── export/    # CSV and PDF export generators
├── frontend/          # Next.js frontend dashboard
│   └── app/           # App Router pages and layouts
```

---

# Architecture Overview

## High-Level Architecture

```text
Social Platforms
(Reddit / Twitter / YouTube)
            │
            ▼
      Scraper Services
            │
            ▼
      PostgreSQL Database
            │
            ▼
      BullMQ Queue System
            │
            ▼
       NLP Worker Pipeline
 ┌──────────┼──────────┐
 ▼          ▼          ▼
Translation Sentiment Clustering
            │
            ▼
     Analytics Aggregation
            │
            ▼
     Next.js Dashboard UI
```

---

# NLP Pipeline Architecture

When a post is scraped, it enters an asynchronous processing workflow:

```text
Scraper Ingests Post
        │
        ▼
Saves Raw Post to Database
        │
        ▼
Adds Job to BullMQ Queue
        │
        ▼
NLP Worker Processing
        │
 ┌──────┼──────────────┬─────────────┐
 ▼      ▼              ▼             ▼
Spam  Translation   Sentiment   Clustering
Check  & Language    Analysis
        │
        ▼
AI Summarization
        │
        ▼
Stores Final Processed Post
```

---

# Database Schema

## 1. `clusters`

Stores grouped duplicate or semantically related posts.

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | VARCHAR   |
| created_at | TIMESTAMP |

---

## 2. `posts`

Stores all scraped and NLP-processed posts.

| Column             | Type      |
| ------------------ | --------- |
| id                 | UUID      |
| platform           | VARCHAR   |
| author             | TEXT      |
| handle             | TEXT      |
| content            | TEXT      |
| translated_content | TEXT      |
| summary            | TEXT      |
| category           | VARCHAR   |
| sentiment          | VARCHAR   |
| language           | VARCHAR   |
| engagement_score   | INTEGER   |
| cluster_id         | UUID      |
| is_gibberish       | BOOLEAN   |
| created_at         | TIMESTAMP |
| scraped_at         | TIMESTAMP |

---

## 3. `translations`

Caches translated post content.

| Column          | Type    |
| --------------- | ------- |
| id              | UUID    |
| post_id         | UUID    |
| language        | VARCHAR |
| translated_text | TEXT    |

---

# Analytics Supported

The dashboard provides:

* Sentiment distribution
* Platform distribution
* Trending categories
* Post volume over time
* Top discussion clusters
* Engagement analytics

---

# Design Decisions

* Used **BullMQ** for scalable asynchronous processing.
* Chose **raw SQL** instead of ORM for optimized PostgreSQL performance.
* Implemented **offline NLP fallback heuristics** for resiliency without Gemini API access.
* Used **Zustand + TanStack Query** for lightweight and scalable frontend state management.
* Designed the project as a **monorepo** for maintainability and shared typing.

---

# Environment Variables

## Root `.env`

```env
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
GEMINI_API_KEY=
NEXT_PUBLIC_API_URL=
```

---

# Getting Started

## Prerequisites

* Node.js v18+
* PostgreSQL / Supabase
* Redis
* Gemini API Key (optional but recommended)

---

## 1. Clone Repository

```bash
git clone https://github.com/alan-w-arch/Task.git
cd Task
```

---

## 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

---

## 3. Configure Environment

```bash
cp .env.example .env
```

Update environment variables accordingly.

---

## 4. Start Local Services (Optional)

```bash
docker compose up -d
```

---

## 5. Run Development Servers

```bash
npm run dev
```

### Frontend

http://localhost:3000

### Backend

http://localhost:3001

### Swagger Docs

http://localhost:3001/swagger

---

# 📡 REST API Documentation

## Posts APIs

### Get Posts

```http
GET /api/posts
```

Supports:

* platform
* category
* sentiment
* language
* search
* pagination
* sorting

---

### Get Single Post

```http
GET /api/posts/:id
```

---

### Trigger Scraping

```http
POST /api/posts/scrape
```

---

## Translation APIs

### Translate Post

```http
POST /api/translate
```

Request:

```json
{
  "postId": "uuid",
  "language": "hi"
}
```

---

## Export APIs

### CSV Export

```http
GET /api/export/csv
```

### PDF Export

```http
GET /api/export/pdf
```

---

## Analytics APIs

### Dashboard Metrics

```http
GET /api/analytics
```

---

# Deployment

## Frontend Deployment (Vercel)

```bash
cd frontend
npm install
npm run build
npm run start
```

Environment Variables:

```env
NEXT_PUBLIC_API_URL=
```

---

## Backend Deployment (Railway / Render)

```bash
cd backend
npm install
npm run build
npm run start:prod
```

Required Variables:

```env
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
GEMINI_API_KEY=
```

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Alan

GitHub:
https://github.com/alan-w-arch
