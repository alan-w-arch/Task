import { Platform } from 'shared';

export interface ScrapedPost {
  platform: Platform;
  author: string;
  handle: string;
  content: string;
  source_url: string;
  engagement_score: number;
  created_at: Date;
  region?: string;
  language?: string;
}

export interface ScraperAdapter {
  scrape(keyword: string): Promise<ScrapedPost[]>;
}
