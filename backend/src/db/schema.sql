-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: clusters
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  author VARCHAR(255) NOT NULL,
  handle VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  translated_content TEXT,
  summary TEXT,
  category VARCHAR(100),
  sentiment VARCHAR(20),
  language VARCHAR(10),
  engagement_score INT DEFAULT 0,
  cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL,
  source_url TEXT NOT NULL,
  region VARCHAR(100),
  is_gibberish BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure scraper deduplication is race-safe
CREATE UNIQUE INDEX IF NOT EXISTS posts_source_url_uidx ON posts(source_url);

-- Full-text search index on posts
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING gin(to_tsvector('english', content || ' ' || COALESCE(translated_content, '')));

-- Indexes for frequent queries (filtering, sorting)
CREATE INDEX IF NOT EXISTS posts_platform_idx ON posts(platform);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_sentiment_idx ON posts(sentiment);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_cluster_id_idx ON posts(cluster_id);

-- Table: translations
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_post_language UNIQUE (post_id, language)
);

-- Table: analytics_snapshots
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_posts INT NOT NULL,
  platform_counts JSONB NOT NULL,
  category_counts JSONB NOT NULL,
  sentiment_counts JSONB NOT NULL,
  average_engagement DOUBLE PRECISION NOT NULL
);
