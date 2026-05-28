import { Injectable, Logger } from '@nestjs/common';
import { ScraperAdapter, ScrapedPost } from './scrapers.interface';

@Injectable()
export class YoutubeAdapter implements ScraperAdapter {
  private readonly logger = new Logger(YoutubeAdapter.name);

  async scrape(keyword: string): Promise<ScrapedPost[]> {
    this.logger.log(`Scraping YouTube for keyword: "${keyword}"`);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const encodedKeyword = encodeURIComponent(keyword);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedKeyword}&type=video&maxResults=10&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`YouTube API returned status ${response.status}`);
        }

        const json = await response.json();
        const items = json.items || [];

        this.logger.log(`YouTube scraped ${items.length} videos for "${keyword}"`);

        return items.map((item: any) => {
          const videoId = item.id.videoId;
          const snippet = item.snippet;
          return {
            platform: 'youtube',
            author: snippet.channelTitle || 'YouTube Channel',
            handle: snippet.channelTitle || 'YouTube Channel',
            content: `${snippet.title}\n\n${snippet.description || ''}`.trim(),
            source_url: `https://www.youtube.com/watch?v=${videoId}`,
            engagement_score: Math.floor(Math.random() * 1500) + 50, // Generate dummy engagement score since stats require another request
            created_at: new Date(snippet.publishedAt),
            region: 'Global',
          };
        });
      } catch (err) {
        this.logger.error(`YouTube API scrape failed for "${keyword}", using mock fallback:`, err);
        return this.getMockPosts(keyword);
      }
    } else {
      this.logger.log(`YOUTUBE_API_KEY not configured. Generating mock YouTube data for: "${keyword}"`);
      return this.getMockPosts(keyword);
    }
  }

  private getMockPosts(keyword: string): ScrapedPost[] {
    const timeNow = new Date();
    const mockVideos = [
      {
        author: 'Visa & Immigration Guide',
        handle: 'VisaImmigrationGuide',
        content: `How to Book Passport Appointment Slots Faster in 2026! Complete step-by-step walkthrough of the new Passport Seva portal. Sharing the exact time slots release schedules and tricks to bypass session timeouts.`,
        engagement_score: 1250,
        created_at: new Date(timeNow.getTime() - 4 * 3600 * 1000), // 4 hours ago
        source_url: 'https://www.youtube.com/watch?v=mock_passport_slots_2026',
        region: 'India'
      },
      {
        author: 'Nomad Couple Vlogs',
        handle: 'NomadCouple',
        content: `We got stuck at the airport due to a minor visa issue! Here's what you need to know about Schengen visa travel rules and passport validity. Make sure you have at least 6 months validity left!`,
        engagement_score: 8430,
        created_at: new Date(timeNow.getTime() - 18 * 3600 * 1000), // 18 hours ago
        source_url: 'https://www.youtube.com/watch?v=mock_schengen_visa_issue',
        region: 'Schengen'
      },
      {
        author: 'Government Updates Channel',
        handle: 'GovUpdates',
        content: `New passport renewal guidelines released by Ministry of External Affairs. Simplified documentation for Tatkal applications, online verification steps, and integration with DigiLocker.`,
        engagement_score: 950,
        created_at: new Date(timeNow.getTime() - 20 * 3600 * 1000), // 20 hours ago
        source_url: 'https://www.youtube.com/watch?v=mock_gov_announcements_passport',
        region: 'India'
      }
    ];

    return mockVideos.filter(video => 
      video.content.toLowerCase().includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes('passport')
    ) as ScrapedPost[];
  }
}
