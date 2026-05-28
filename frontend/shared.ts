export type Platform = 'reddit' | 'youtube' | 'twitter';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export const CATEGORIES = [
  'Application',
  'Renewal',
  'Appointment',
  'Tatkal',
  'Visa',
  'Travel Issues',
  'Government Announcements',
  'Scams/Fraud',
  'News',
  'Personal Experiences'
] as const;

export type Category = typeof CATEGORIES[number];

export const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  ru: 'Russian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese'
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export interface Post {
  id: string;
  platform: Platform;
  author: string;
  handle: string;
  content: string;
  translated_content?: string;
  summary?: string;
  category?: Category;
  sentiment?: Sentiment;
  language?: string;
  engagement_score: number;
  cluster_name?: string;
  cluster_id?: string;
  source_url: string;
  region?: string;
  is_gibberish: boolean;
  created_at: Date;
  scraped_at: Date;
}

export interface Cluster {
  id: string;
  name: string;
  created_at: Date;
  posts?: Post[];
}

export interface Translation {
  id: string;
  post_id: string;
  language: string;
  translated_text: string;
  created_at: Date;
}

export interface AnalyticsSnapshot {
  id: string;
  timestamp: Date;
  total_posts: number;
  platform_counts: Record<Platform, number>;
  category_counts: Record<Category, number>;
  sentiment_counts: Record<Sentiment, number>;
  average_engagement: number;
}
