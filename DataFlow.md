# Data Flow Architecture

The system processes data through five major stages:

1. Ingestion
2. Persistence
3. Async NLP Processing
4. API Serving
5. Frontend Rendering

---

## 1️ Ingestion Layer (Scrapers)

### Trigger Mechanisms

Scraping can be initiated in two ways:

* Automatically using a NestJS cron scheduler
* Manually through:

```http
POST /api/posts/scrape
```

### Scraper Adapters

The system uses dedicated scraper adapters for each platform:

* **RedditAdapter** — Fetches posts from Reddit public search APIs
* **YoutubeAdapter** — Integrates with YouTube Data API v3
* **TwitterAdapter** — Handles multilingual Twitter/X scraping

### Output Structure

Each scraper returns normalized `ScrapedPost` objects containing:

```ts
{
  platform,
  author,
  handle,
  content,
  source_url,
  engagement_score,
  created_at,
  region,
  language
}
```

---

## 2️ Persistence Layer (Database Storage)

### PostgreSQL Storage

New posts are inserted into PostgreSQL using:

```sql
INSERT INTO posts ... ON CONFLICT (source_url) DO NOTHING
```

This guarantees deduplication through a unique index on `source_url`.

### Initial Stored State

New posts are stored with:

* `is_gibberish = FALSE`
* NLP fields initially set to `NULL`
* Cluster references assigned later during processing

### Cluster Storage

Semantic discussion groups are stored in the `clusters` table and linked via `cluster_id`.

---

## 3️ Async NLP Processing Pipeline

### Queue System

After insertion, posts are added to the BullMQ queue:

```text
nlp-queue
```

Redis is used as the queue backend.

### NLP Worker Processing

Dedicated NLP workers process queued jobs asynchronously.

### NLP Pipeline Steps

#### 1. Spam / Gibberish Detection

Checks:

* URL density
* Repeated characters
* Excessive symbols
* Short meaningless content

#### 2. Language Detection

Uses Gemini AI or heuristic fallbacks to identify ISO language codes.

#### 3. Translation

Non-English posts are translated into English.

#### 4. AI Summarization

Generates concise summaries (~30 words).

#### 5. Sentiment Analysis

Classifies posts as:

* Positive
* Neutral
* Negative

#### 6. Category Classification

Posts are mapped into categories such as:

* Visa
* Tatkal
* Renewal
* Appointment
* Travel Issues
* Government Announcements

#### 7. Semantic Clustering

Posts are grouped using Jaccard similarity-based clustering.

#### 8. Database Update

Processed NLP fields are written back into PostgreSQL.

---

## 4️ API Serving Layer (NestJS REST APIs)

### Posts APIs

```http
GET /api/posts
GET /api/posts/:id
```

Supports:

* Pagination
* Search
* Filtering
* Sorting
* Full-text PostgreSQL search

### Translation API

```http
POST /api/translate
```

Uses translation caching through the `translations` table.

### Analytics API

```http
GET /api/analytics
```

Provides:

* Sentiment distribution
* Platform distribution
* Engagement trends
* Trending clusters
* KPI metrics

### Export APIs

```http
GET /api/export/csv
GET /api/export/pdf
```

Exports filtered dashboard data.

---

## 5️ Frontend Rendering Layer (Next.js)

### State Management

The dashboard uses:

* Zustand for UI/filter state
* TanStack Query for server-state caching

### Dashboard Views

#### Feed View

Displays processed posts with:

* Sentiment badges
* Categories
* AI summaries
* Engagement metrics

#### Clusters View

Groups semantically related posts into discussion clusters.

#### Analytics View

Renders:

* Pie charts
* Trend graphs
* KPI cards
* Engagement analytics

#### Post Details Modal

Displays:

* Full translated content
* AI summary
* Related clustered posts
* On-demand translation support

---

# Cross-Cutting System Features

## Deduplication

Implemented using PostgreSQL unique indexes on `source_url`.

---

## Translation Caching

Translations are cached in the `translations` table to reduce repeated AI calls.

---

## Offline NLP Fallbacks

If Gemini API becomes unavailable, local heuristic-based NLP fallbacks automatically activate.

---

## CORS Support

The backend enables global CORS support for seamless frontend deployment.

---

## Automatic Schema Initialization

Database schema and indexes are automatically initialized during backend startup using idempotent SQL migrations.
