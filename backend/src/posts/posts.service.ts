import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GeminiService } from '../nlp/gemini.service';
import { Platform, Sentiment, Category, LANGUAGES, LanguageCode } from 'shared';

export interface GetPostsFilters {
  platform?: Platform;
  category?: Category;
  language?: string;
  sentiment?: Sentiment;
  region?: string;
  minEngagement?: number;
  timeRangeHours?: number;
  isGibberish?: boolean;
  search?: string;
  clusterId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'engagement_score';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly db: DbService,
    private readonly gemini: GeminiService
  ) {}

  /**
   * Fetch paginated and filtered posts
   */
  async getPosts(filters: GetPostsFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Default: only show non-gibberish posts unless specified otherwise
    const showGibberish = filters.isGibberish !== undefined ? filters.isGibberish : false;
    conditions.push(`is_gibberish = $${paramIndex++}`);
    params.push(showGibberish);

    if (filters.platform) {
      conditions.push(`platform = $${paramIndex++}`);
      params.push(filters.platform);
    }

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }

    if (filters.language) {
      conditions.push(`language = $${paramIndex++}`);
      params.push(filters.language);
    }

    if (filters.sentiment) {
      conditions.push(`sentiment = $${paramIndex++}`);
      params.push(filters.sentiment);
    }

    if (filters.region) {
      conditions.push(`region = $${paramIndex++}`);
      params.push(filters.region);
    }

    if (filters.clusterId) {
      conditions.push(`cluster_id = $${paramIndex++}`);
      params.push(filters.clusterId);
    }

    if (filters.minEngagement !== undefined) {
      conditions.push(`engagement_score >= $${paramIndex++}`);
      params.push(filters.minEngagement);
    }

    if (filters.timeRangeHours !== undefined) {
      const hours = Number(filters.timeRangeHours);
      if (Number.isFinite(hours) && hours > 0) {
        conditions.push(`created_at >= NOW() - ($${paramIndex++}::int * INTERVAL '1 hour')`);
        params.push(Math.floor(hours));
      }
    }

    if (filters.search && filters.search.trim() !== '') {
      // PostgreSQL full-text search using GIN index & websearch_to_tsquery
      conditions.push(
        `to_tsvector('english', content || ' ' || COALESCE(translated_content, '')) @@ websearch_to_tsquery('english', $${paramIndex++})`
      );
      params.push(filters.search.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Order by clause injection (sanitized inputs)
    const validSortFields = ['created_at', 'engagement_score'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Query to get paginated posts
    const query = `
      SELECT p.*, c.name as cluster_name
      FROM posts p
      LEFT JOIN clusters c ON p.cluster_id = c.id
      ${whereClause}
      ORDER BY ${finalSortBy} ${finalSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Query to get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM posts
      ${whereClause}
    `;

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, [...params, limit, offset]),
      this.db.query(countQuery, params)
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    const pages = Math.ceil(total / limit);

    return {
      data: dataRes.rows,
      meta: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  /**
   * Get detail of a single post and its translations/cluster siblings
   */
  async getPostById(id: string) {
    const postQuery = `
      SELECT p.*, c.name as cluster_name 
      FROM posts p
      LEFT JOIN clusters c ON p.cluster_id = c.id
      WHERE p.id = $1
    `;
    const postRes = await this.db.query(postQuery, [id]);

    if (postRes.rows.length === 0) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }

    const post = postRes.rows[0];

    // Fetch translation cache
    const translationsQuery = `
      SELECT language, translated_text, created_at 
      FROM translations 
      WHERE post_id = $1
    `;
    const translationsRes = await this.db.query(translationsQuery, [id]);
    
    // Fetch cluster siblings (other posts in the same cluster)
    let clusterSiblings = [];
    if (post.cluster_id) {
      const siblingsQuery = `
        SELECT id, platform, author, handle, content, sentiment, engagement_score, created_at 
        FROM posts 
        WHERE cluster_id = $1 AND id != $2
        ORDER BY created_at DESC
        LIMIT 5
      `;
      const siblingsRes = await this.db.query(siblingsQuery, [post.cluster_id, id]);
      clusterSiblings = siblingsRes.rows;
    }

    return {
      post,
      translations: translationsRes.rows,
      clusterSiblings
    };
  }

  /**
   * Translate a post to a specific target language (utilizes cache first)
   */
  async translatePost(postId: string, targetLanguageCode: LanguageCode): Promise<string> {
    const targetLanguageName = LANGUAGES[targetLanguageCode];
    if (!targetLanguageName) {
      throw new BadRequestException(`Unsupported language code: ${targetLanguageCode}`);
    }

    // 1. Check if translation is cached
    const checkQuery = `
      SELECT translated_text 
      FROM translations 
      WHERE post_id = $1 AND language = $2
    `;
    const checkRes = await this.db.query(checkQuery, [postId, targetLanguageCode]);

    if (checkRes.rows.length > 0) {
      return checkRes.rows[0].translated_text;
    }

    // 2. Fetch the post text
    const postRes = await this.db.query('SELECT content, translated_content FROM posts WHERE id = $1', [postId]);
    if (postRes.rows.length === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const post = postRes.rows[0];
    const textToTranslate = post.translated_content || post.content;

    // 3. Call translation service
    this.logger.log(`Translating post [${postId}] to [${targetLanguageName}]`);
    const translatedText = await this.gemini.translateContent(textToTranslate, targetLanguageName);

    // 4. Save to translation cache
    const insertQuery = `
      INSERT INTO translations (post_id, language, translated_text)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, language) 
      DO UPDATE SET translated_text = EXCLUDED.translated_text
    `;
    await this.db.query(insertQuery, [postId, targetLanguageCode, translatedText]);

    return translatedText;
  }
}
