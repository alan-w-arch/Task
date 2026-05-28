import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly db: DbService) {}

  /**
   * Get aggregated analytics for dashboard charts
   */
  async getDashboardAnalytics() {
    this.logger.log('Calculating dashboard analytics snapshots...');

    // 1. Core KPIs
    const kpisQuery = `
      SELECT 
        COUNT(*) as total_posts,
        SUM(CASE WHEN is_gibberish = TRUE THEN 1 ELSE 0 END) as spam_posts,
        COALESCE(AVG(CASE WHEN is_gibberish = FALSE THEN engagement_score END), 0) as avg_engagement
      FROM posts
    `;
    const kpisRes = await this.db.query(kpisQuery);
    const totalPosts = parseInt(kpisRes.rows[0].total_posts, 10);
    const spamPosts = parseInt(kpisRes.rows[0].spam_posts || '0', 10);
    const avgEngagement = parseFloat(kpisRes.rows[0].avg_engagement || '0');

    // 2. Sentiment distribution (excluding spam)
    const sentimentQuery = `
      SELECT sentiment, COUNT(*) as count 
      FROM posts 
      WHERE is_gibberish = FALSE AND sentiment IS NOT NULL
      GROUP BY sentiment
    `;
    const sentimentRes = await this.db.query(sentimentQuery);
    const sentimentDistribution = sentimentRes.rows.reduce((acc, row) => {
      acc[row.sentiment] = parseInt(row.count, 10);
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    // 3. Category distribution (excluding spam)
    const categoryQuery = `
      SELECT category, COUNT(*) as count 
      FROM posts 
      WHERE is_gibberish = FALSE AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;
    const categoryRes = await this.db.query(categoryQuery);
    const categoryDistribution = categoryRes.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count, 10)
    }));

    // 4. Platform distribution (excluding spam)
    const platformQuery = `
      SELECT platform, COUNT(*) as count 
      FROM posts 
      WHERE is_gibberish = FALSE
      GROUP BY platform
    `;
    const platformRes = await this.db.query(platformQuery);
    const platformDistribution = platformRes.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count, 10);
      return acc;
    }, { reddit: 0, youtube: 0, twitter: 0 });

    // 5. Engagement and posts volume trends over time (past 7 days)
    const trendsQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
        COUNT(*) as posts_count, 
        COALESCE(AVG(engagement_score), 0)::int as avg_engagement
      FROM posts
      WHERE is_gibberish = FALSE AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
    const trendsRes = await this.db.query(trendsQuery);
    const trends = trendsRes.rows.map(row => ({
      date: row.date,
      posts: parseInt(row.posts_count, 10),
      engagement: row.avg_engagement
    }));

    // 6. Top Trending Topics / Clusters in past 24 hours
    const topClustersQuery = `
      SELECT 
        c.id, 
        c.name, 
        COUNT(p.id) as posts_count, 
        COALESCE(AVG(p.engagement_score), 0)::int as avg_engagement
      FROM clusters c
      JOIN posts p ON p.cluster_id = c.id
      WHERE p.is_gibberish = FALSE AND p.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY c.id, c.name
      ORDER BY posts_count DESC, avg_engagement DESC
      LIMIT 5
    `;
    const topClustersRes = await this.db.query(topClustersQuery);
    const trendingTopics = topClustersRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      posts: parseInt(row.posts_count, 10),
      engagement: row.avg_engagement
    }));

    return {
      kpis: {
        totalPosts,
        spamPosts,
        cleanPosts: totalPosts - spamPosts,
        avgEngagement: Math.round(avgEngagement * 10) / 10
      },
      sentiment: sentimentDistribution,
      categories: categoryDistribution,
      platforms: platformDistribution,
      trends,
      trendingTopics
    };
  }
}
