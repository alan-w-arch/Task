import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GeminiService } from './gemini.service';
import { Category, Post, Sentiment } from 'shared';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);

  // Stop words for text tokenization (Jaccard similarity)
  private readonly stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
    'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
    'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn'
  ]);

  constructor(
    private readonly db: DbService,
    private readonly gemini: GeminiService
  ) {}

  /**
   * Evaluates if a post is spam or gibberish
   */
  isGibberishOrSpam(content: string): boolean {
    if (!content || content.trim().length < 15) {
      return true;
    }

    const text = content.trim();

    // 1. Link density (spam)
    const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
    if (urls.length > 3 || (urls.length > 0 && text.length / urls.length < 50)) {
      return true; // Mostly URLs
    }

    // 2. Special character density
    const specialChars = text.replace(/[a-zA-Z0-9\s\u0900-\u097F]/g, ''); // Exclude letters, numbers, spaces, and Hindi Devanagari characters
    if (specialChars.length / text.length > 0.35) {
      return true; // Too many symbols
    }

    // 3. Repeated character sequences (e.g. "aaaaa", "!!!!!")
    if (/(.)\1{4,}/.test(text)) {
      return true;
    }

    // 4. Repeated word sequences (e.g. "spam spam spam")
    const words = text.toLowerCase().split(/\s+/);
    if (words.length > 5) {
      let repeatedCount = 0;
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i] === words[i + 1]) {
          repeatedCount++;
        }
      }
      if (repeatedCount / words.length > 0.4) {
        return true;
      }
    }

    // 5. Letter/vowel distribution (for English/Latin gibberish)
    // If text is mostly latin and has no vowels in large words
    const latinWords = words.filter(w => /^[a-z]+$/.test(w));
    if (latinWords.length > 3) {
      const longLatinWords = latinWords.filter(w => w.length > 4);
      if (longLatinWords.length > 0) {
        const wordsWithoutVowels = longLatinWords.filter(w => !/[aeiouy]/.test(w));
        if (wordsWithoutVowels.length / longLatinWords.length > 0.5) {
          return true; // Gibberish like "sdfgh"
        }
      }
    }

    return false;
  }

  /**
   * Tokenize content into a set of unique words, stripping stop words and punctuation
   */
  private getTokens(text: string): Set<string> {
    const clean = text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, '') // remove punctuation (support latin and devanagari)
      .split(/\s+/);
    
    const tokens = new Set<string>();
    for (const word of clean) {
      if (word.length > 1 && !this.stopWords.has(word)) {
        tokens.add(word);
      }
    }
    return tokens;
  }

  /**
   * Calculate Jaccard similarity coefficient between two sets
   */
  private calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0;
    
    let intersectionSize = 0;
    for (const item of setA) {
      if (setB.has(item)) {
        intersectionSize++;
      }
    }
    
    const unionSize = setA.size + setB.size - intersectionSize;
    return intersectionSize / unionSize;
  }

  /**
   * Matches a post to an existing cluster or creates a new cluster.
   * Looks at clusters created in the last 24 hours.
   */
  async findOrCreateCluster(postId: string, content: string): Promise<string> {
    const postTokens = this.getTokens(content);

    // Fetch posts and their cluster details from the last 24 hours
    const query = `
      SELECT p.id, p.content, p.cluster_id, c.name as cluster_name 
      FROM posts p
      JOIN clusters c ON p.cluster_id = c.id
      WHERE p.created_at >= NOW() - INTERVAL '24 hours'
        AND p.cluster_id IS NOT NULL
    `;
    const res = await this.db.query(query);
    const existingPosts = res.rows;

    let bestMatchClusterId: string | null = null;
    let highestSimilarity = 0;

    for (const post of existingPosts) {
      const existingTokens = this.getTokens(post.content);
      const similarity = this.calculateJaccardSimilarity(postTokens, existingTokens);
      
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatchClusterId = post.cluster_id;
      }
    }

    // Similarity threshold (e.g., 0.35 or 35% word overlap of unique words)
    const SIMILARITY_THRESHOLD = 0.35;

    if (bestMatchClusterId && highestSimilarity >= SIMILARITY_THRESHOLD) {
      this.logger.log(`Post [${postId}] matched existing cluster [${bestMatchClusterId}] with similarity ${highestSimilarity.toFixed(2)}`);
      return bestMatchClusterId;
    }

    // Create a new cluster
    // Name the cluster using the 3-4 most unique/frequent keywords in the post
    const sortedTokens = Array.from(postTokens).slice(0, 4);
    const clusterName = sortedTokens.length > 0 
      ? `Issue regarding: ${sortedTokens.join(', ')}`
      : 'General Passport Discussion';

    this.logger.log(`No matching cluster found. Creating a new cluster: "${clusterName}"`);
    
    const clusterInsertQuery = `
      INSERT INTO clusters (name) 
      VALUES ($1) 
      RETURNING id
    `;
    const clusterRes = await this.db.query(clusterInsertQuery, [clusterName]);
    return clusterRes.rows[0].id;
  }

  /**
   * Main pipeline runner that takes a raw post from database, processes it, and saves the updates.
   */
  async processPost(postId: string): Promise<void> {
    this.logger.log(`Starting NLP pipeline processing for post ID: ${postId}`);

    // Fetch the raw post
    const fetchRes = await this.db.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (fetchRes.rows.length === 0) {
      this.logger.error(`Post not found in database: ${postId}`);
      return;
    }

    const rawPost = fetchRes.rows[0];
    const content = rawPost.content;

    // 1. Gibberish check
    const isGibberish = this.isGibberishOrSpam(content);
    if (isGibberish) {
      this.logger.warn(`Post [${postId}] classified as gibberish/spam. Marking and skipping deep processing.`);
      await this.db.query(
        `UPDATE posts 
         SET is_gibberish = TRUE, category = 'Spam/Gibberish', sentiment = 'neutral' 
         WHERE id = $1`,
        [postId]
      );
      return;
    }

    // 2. Language Detection
    const detectedLanguage = await this.gemini.detectLanguage(content);
    this.logger.log(`Post [${postId}] detected language: ${detectedLanguage}`);

    // 3. Translation (Translate to English if it's not English)
    let translatedContent = null;
    let textToAnalyze = content;

    if (detectedLanguage !== 'en') {
      this.logger.log(`Translating post [${postId}] from [${detectedLanguage}] to English`);
      translatedContent = await this.gemini.translateContent(content, 'English');
      textToAnalyze = translatedContent;
    }

    // 4. Summarization
    const summary = await this.gemini.generateSummary(textToAnalyze);

    // 5. Sentiment Analysis
    const sentiment = await this.gemini.analyzeSentiment(textToAnalyze);

    // 6. Auto-categorization
    const category = await this.gemini.classifyCategory(textToAnalyze);

    // 7. Clustering
    const clusterId = await this.findOrCreateCluster(postId, textToAnalyze);

    // Update the database record with the results
    const updateQuery = `
      UPDATE posts
      SET 
        language = $1,
        translated_content = $2,
        summary = $3,
        sentiment = $4,
        category = $5,
        cluster_id = $6,
        is_gibberish = FALSE
      WHERE id = $7
    `;

    await this.db.query(updateQuery, [
      detectedLanguage,
      translatedContent,
      summary,
      sentiment,
      category,
      clusterId,
      postId
    ]);

    this.logger.log(`Finished processing post ID: ${postId}. Category: ${category}, Sentiment: ${sentiment}`);
  }
}
