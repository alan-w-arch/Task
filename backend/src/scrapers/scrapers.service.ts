import { Injectable, Logger } from '@nestjs/common';
import { RedditAdapter } from './reddit.adapter';
import { YoutubeAdapter } from './youtube.adapter';
import { TwitterAdapter } from './twitter.adapter';
import { DbService } from '../db/db.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ScrapedPost } from './scrapers.interface';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);
  
  private readonly keywords = [
    'passport',
    'passport renewal',
    'tatkal passport',
    'passport seva',
    'visa issue',
    'passport appointment'
  ];

  constructor(
    private readonly db: DbService,
    private readonly reddit: RedditAdapter,
    private readonly youtube: YoutubeAdapter,
    private readonly twitter: TwitterAdapter,
    @InjectQueue('nlp-queue') private readonly nlpQueue: Queue
  ) {}

  /**
   * Scrapes all platforms for all configured keywords
   */
  async scrapeAll(): Promise<{ scraped: number; new: number }> {
    this.logger.log('Starting scheduled scraper job across all platforms and keywords...');
    
    let totalScraped = 0;
    let totalNew = 0;

    const adapters = [this.reddit, this.youtube, this.twitter];

    for (const keyword of this.keywords) {
      for (const adapter of adapters) {
        try {
          const posts = await adapter.scrape(keyword);
          totalScraped += posts.length;

          for (const post of posts) {
            const isNew = await this.saveAndQueuePost(post);
            if (isNew) {
              totalNew++;
            }
          }
        } catch (error) {
          this.logger.error(`Error scraping platform with keyword "${keyword}":`, error);
        }
      }
    }

    this.logger.log(`Scrape finished. Scraped: ${totalScraped}, New added: ${totalNew}`);
    return { scraped: totalScraped, new: totalNew };
  }

  /**
   * Check if post exists, if not inserts it and adds it to the NLP queue
   * Returns true if post was newly inserted
   */
  private async saveAndQueuePost(post: ScrapedPost): Promise<boolean> {
    try {
      // Insert new post
      const insertQuery = `
        INSERT INTO posts (
          platform, author, handle, content, source_url, 
          engagement_score, created_at, region, language, is_gibberish
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)
        ON CONFLICT (source_url) DO NOTHING
        RETURNING id
      `;

      const insertRes = await this.db.query(insertQuery, [
        post.platform,
        post.author,
        post.handle,
        post.content,
        post.source_url,
        post.engagement_score,
        post.created_at,
        post.region || null,
        post.language || null
      ]);

      if (insertRes.rows.length === 0) {
        return false;
      }

      const newPostId = insertRes.rows[0].id;
      this.logger.log(`Inserted new post [${newPostId}] from platform [${post.platform}]. Queueing for NLP processing.`);

      // Push to BullMQ nlp-queue
      await this.nlpQueue.add('process-post', { postId: newPostId }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        }
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to save or queue post: ${post.source_url}`, error);
      return false;
    }
  }
}
