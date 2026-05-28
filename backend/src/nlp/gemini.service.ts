import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Category, CATEGORIES, Sentiment } from 'shared';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private isKeyConfigured = false;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.isKeyConfigured = true;
        this.logger.log('Gemini AI Service initialized successfully.');
      } catch (err) {
        this.logger.error('Failed to initialize Gemini AI SDK:', err);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured. Running NLP pipeline with local heuristic fallbacks.');
    }
  }

  /**
   * Generates a ~30-word summary of the content using Gemini, with a local text-truncation fallback
   */
  async generateSummary(content: string): Promise<string> {
    if (!this.isKeyConfigured || !this.genAI) {
      return this.localSummaryFallback(content);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Summarize the following social media post about passport or visa issues in approximately 30 words. Keep it concise, informative, and objective:
      
      "${content}"`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0.3 }
      });
      
      const response = await result.response;
      const text = response.text().trim();
      return text || this.localSummaryFallback(content);
    } catch (error) {
      this.logger.error('Gemini generateSummary failed, using fallback:', error);
      return this.localSummaryFallback(content);
    }
  }

  /**
   * Translates content to the target language, with a local mock fallback
   */
  async translateContent(content: string, targetLanguage: string): Promise<string> {
    if (!this.isKeyConfigured || !this.genAI) {
      return this.localTranslationFallback(content, targetLanguage);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the translated text, with no additional commentary, labels, or formatting:
      
      "${content}"`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      });
      const response = await result.response;
      const text = response.text().trim();
      return text || this.localTranslationFallback(content, targetLanguage);
    } catch (error) {
      this.logger.error(`Gemini translation to ${targetLanguage} failed, using fallback:`, error);
      return this.localTranslationFallback(content, targetLanguage);
    }
  }

  /**
   * Classifies content into one of the 10 target categories
   */
  async classifyCategory(content: string): Promise<Category> {
    if (!this.isKeyConfigured || !this.genAI) {
      return this.localCategoryClassifier(content);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const categoriesList = CATEGORIES.join(', ');
      const prompt = `Classify this social media post into exactly ONE of the following categories:
      [${categoriesList}]
      
      Return ONLY the exact category name (case-sensitive) and nothing else.
      
      Post: "${content}"`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      });
      const response = await result.response;
      const categoryName = response.text().trim() as Category;
      
      if (CATEGORIES.includes(categoryName)) {
        return categoryName;
      }
      
      // Secondary check in case it returned some markdown or extra text
      for (const cat of CATEGORIES) {
        if (categoryName.toLowerCase().includes(cat.toLowerCase())) {
          return cat;
        }
      }

      return this.localCategoryClassifier(content);
    } catch (error) {
      this.logger.error('Gemini classifyCategory failed, using fallback:', error);
      return this.localCategoryClassifier(content);
    }
  }

  /**
   * Analyzes sentiment: returns 'positive', 'neutral', 'negative'
   */
  async analyzeSentiment(content: string): Promise<Sentiment> {
    if (!this.isKeyConfigured || !this.genAI) {
      return this.localSentimentAnalyzer(content);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze the sentiment of the following post. Return exactly one word, either 'positive', 'neutral', or 'negative' and nothing else:
      
      "${content}"`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      });
      const response = await result.response;
      const sentiment = response.text().trim().toLowerCase() as Sentiment;

      if (['positive', 'neutral', 'negative'].includes(sentiment)) {
        return sentiment;
      }
      return this.localSentimentAnalyzer(content);
    } catch (error) {
      this.logger.error('Gemini analyzeSentiment failed, using fallback:', error);
      return this.localSentimentAnalyzer(content);
    }
  }

  /**
   * Detects the language of the content, returning the 2-letter ISO code (e.g. 'en', 'hi', 'es')
   */
  async detectLanguage(content: string): Promise<string> {
    if (!this.isKeyConfigured || !this.genAI) {
      return this.localLanguageDetector(content);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Identify the primary language of the following text. Return ONLY the 2-letter ISO 639-1 language code (e.g., 'en' for English, 'hi' for Hindi, 'es' for Spanish, 'zh' for Chinese) and nothing else:
      
      "${content}"`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      });
      const response = await result.response;
      const lang = response.text().trim().toLowerCase();
      
      if (lang.length === 2) {
        return lang;
      }
      return this.localLanguageDetector(content);
    } catch (error) {
      this.logger.error('Gemini detectLanguage failed, using fallback:', error);
      return this.localLanguageDetector(content);
    }
  }

  // --- LOCAL FALLBACKS AND HEURISTICS ---

  private localSummaryFallback(content: string): string {
    const clean = content.replace(/\s+/g, ' ').trim();
    const words = clean.split(' ');
    if (words.length <= 30) {
      return clean;
    }
    // Take the first 27 words and add ellipsis
    return words.slice(0, 27).join(' ') + '...';
  }

  private localTranslationFallback(content: string, targetLanguage: string): string {
    return `[Translated to ${targetLanguage}]: ${content}`;
  }

  private localCategoryClassifier(content: string): Category {
    const text = content.toLowerCase();
    if (text.includes('tatkal') || text.includes('tatkaal')) return 'Tatkal';
    if (text.includes('appointment') || text.includes('slot') || text.includes('date') || text.includes('seva kendra') || text.includes('psk')) return 'Appointment';
    if (text.includes('renew') || text.includes('expiry') || text.includes('expired') || text.includes('reissue')) return 'Renewal';
    if (text.includes('visa') || text.includes('embassy') || text.includes('consulate') || text.includes('border') || text.includes('immigration')) return 'Visa';
    if (text.includes('scam') || text.includes('agent') || text.includes('fraud') || text.includes('fake') || text.includes('bribe') || text.includes('money lost')) return 'Scams/Fraud';
    if (text.includes('announces') || text.includes('ministry') || text.includes('mfa') || text.includes('mea') || text.includes('official release')) return 'Government Announcements';
    if (text.includes('delay') || text.includes('lost') || text.includes('damaged') || text.includes('stranded') || text.includes('flight') || text.includes('stuck')) return 'Travel Issues';
    if (text.includes('news') || text.includes('report') || text.includes('today') || text.includes('journalist')) return 'News';
    if (text.includes('my experience') || text.includes('story') || text.includes('finally got') || text.includes('went to') || text.includes('i had')) return 'Personal Experiences';
    
    // Default fallback
    return 'Application';
  }

  private localSentimentAnalyzer(content: string): Sentiment {
    const text = content.toLowerCase();
    
    const positiveWords = ['great', 'fast', 'quick', 'easy', 'finally', 'happy', 'solved', 'helpful', 'efficient', 'smooth', 'success', 'good'];
    const negativeWords = ['worst', 'delay', 'stuck', 'slow', 'frustrated', 'terrible', 'bad', 'lost', 'complaint', 'scam', 'fraud', 'bribe', 'error', 'failed', 'cannot', 'refund', 'angry', 'wait', 'horrible'];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) posCount++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negCount++;
    });

    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  private localLanguageDetector(content: string): string {
    const text = content.trim();
    // Very simple check for non-Latin characters (Devanagari script for Hindi, Cyrillic for Russian, Arabic script, etc.)
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(text)) return 'ja'; // Japanese
    
    // If it contains Spanish words like "pasaporte", "renovación", "cita"
    const esWords = [' el ', ' la ', ' los ', ' las ', ' y ', ' con ', ' para ', ' pasaporte ', ' cita '];
    if (esWords.some(w => text.toLowerCase().includes(w))) return 'es';

    // If it contains French words
    const frWords = [' le ', ' la ', ' les ', ' et ', ' pour ', ' avec ', ' passeport ', ' rendez-vous '];
    if (frWords.some(w => text.toLowerCase().includes(w))) return 'fr';

    // If it contains German words
    const deWords = [' der ', ' die ', ' das ', ' und ', ' mit ', ' für ', ' pass ', ' termin '];
    if (deWords.some(w => text.toLowerCase().includes(w))) return 'de';

    // Default to English
    return 'en';
  }
}
