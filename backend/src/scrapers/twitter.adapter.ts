import { Injectable, Logger } from '@nestjs/common';
import { ScraperAdapter, ScrapedPost } from './scrapers.interface';

@Injectable()
export class TwitterAdapter implements ScraperAdapter {
  private readonly logger = new Logger(TwitterAdapter.name);

  async scrape(keyword: string): Promise<ScrapedPost[]> {
    this.logger.log(`Scraping Twitter/X (Mock Adapter) for keyword: "${keyword}"`);
    
    // Simulate slight API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    const timeNow = new Date();
    
    // Comprehensive mock database of tweets in multiple languages
    const allMockTweets: ScrapedPost[] = [
      {
        platform: 'twitter',
        author: 'Rahul Sharma',
        handle: '@rahul_s90',
        content: `Applied for tatkal passport 10 days ago at PSK Ghaziabad. Still showing 'Under review at Regional Passport Office'. Need to travel for my MS in Germany next week. Help @PassportSeva @MEAIndia! #PassportSeva #Tatkal`,
        engagement_score: 88,
        created_at: new Date(timeNow.getTime() - 1 * 3600 * 1000), // 1 hour ago
        source_url: 'https://twitter.com/rahul_s90/status/1782361732',
        region: 'India'
      },
      {
        platform: 'twitter',
        author: 'Anjali Verma',
        handle: '@anjali_travels',
        content: `पासपोर्ट रिन्यूअल के लिए अपॉइंटमेंट स्लॉट मिलना नामुमकिन हो गया है। लखनऊ केंद्र पर अगले 2 महीने तक कोई स्लॉट खाली नहीं है! क्या कोई तत्काल सेवा में मदद कर सकता है? #PassportRenewal #Lucknow`,
        engagement_score: 204,
        created_at: new Date(timeNow.getTime() - 3 * 3600 * 1000), // 3 hours ago
        source_url: 'https://twitter.com/anjali_travels/status/1782361733',
        region: 'India',
        language: 'hi' // Hindi
      },
      {
        platform: 'twitter',
        author: 'Carlos Gomez',
        handle: '@carlos_g_travel',
        content: `Mi pasaporte vence en 3 meses y no encuentro citas de renovación en el consulado. ¡Tengo un viaje urgente programado para julio! ¿Alguien sabe cómo conseguir cita rápida? #pasaporte #visa`,
        engagement_score: 45,
        created_at: new Date(timeNow.getTime() - 5 * 3600 * 1000), // 5 hours ago
        source_url: 'https://twitter.com/carlos_g/status/1782361734',
        region: 'Mexico',
        language: 'es' // Spanish
      },
      {
        platform: 'twitter',
        author: 'Dmitry Volkov',
        handle: '@dmitry_v',
        content: `Проблемы с выдачей виз в консульстве. Очередь на запись растянулась на полгода вперед! Не могу улететь в командировку. Кто-нибудь сталкивался с этим недавно? #виза #паспорт`,
        engagement_score: 30,
        created_at: new Date(timeNow.getTime() - 8 * 3600 * 1000), // 8 hours ago
        source_url: 'https://twitter.com/dmitry_v/status/1782361735',
        region: 'Russia',
        language: 'ru' // Russian
      },
      {
        platform: 'twitter',
        author: 'Sarah Jenkins',
        handle: '@sarahj_tweets',
        content: `Huge shoutout to the staff at the London Passport Office. Had an emergency renewal for my damaged passport, got a 1-day appointment slot and walked out with a new passport in 4 hours. Incredible service! #PassportOffice #London`,
        engagement_score: 340,
        created_at: new Date(timeNow.getTime() - 10 * 3600 * 1000), // 10 hours ago
        source_url: 'https://twitter.com/sarahj_tweets/status/1782361736',
        region: 'United Kingdom'
      },
      {
        platform: 'twitter',
        author: 'Agent Alert',
        handle: '@scam_alert_india',
        content: `BEWARE: Fake website warning 'www.passport-seva-online.org' asking for 5000 INR for booking visa / passport appointments. This is a scam! The only official government website is 'passportindia.gov.in'. Repost to save others!`,
        engagement_score: 820,
        created_at: new Date(timeNow.getTime() - 14 * 3600 * 1000), // 14 hours ago
        source_url: 'https://twitter.com/scam_alert_india/status/1782361737',
        region: 'India'
      },
      {
        platform: 'twitter',
        author: 'Techie Travel',
        handle: '@techie_nomad',
        content: `My US visa issue stamp is delayed. Passport has been stuck at the consulate for 3 weeks under 'Administrative Processing' (Section 221g). Absolutely no updates. Missed my onboarding date.`,
        engagement_score: 95,
        created_at: new Date(timeNow.getTime() - 16 * 3600 * 1000), // 16 hours ago
        source_url: 'https://twitter.com/techie_nomad/status/1782361738',
        region: 'Global'
      },
      {
        platform: 'twitter',
        author: 'Passport Seva Help',
        handle: '@passport_seva_help',
        content: `IMPORTANT NOTICE: All Passport Seva Kendras (PSKs) in Maharashtra will remain open this Saturday, May 30, to clear the backlog of passport appointments. Bookings open on Wednesday at 4 PM.`,
        engagement_score: 1100,
        created_at: new Date(timeNow.getTime() - 22 * 3600 * 1000), // 22 hours ago
        source_url: 'https://twitter.com/passport_seva_help/status/1782361739',
        region: 'India'
      }
    ];

    // Filter posts by keywords to match the search request
    const lowerKeyword = keyword.toLowerCase();
    const filteredTweets = allMockTweets.filter(tweet => {
      return (
        tweet.content.toLowerCase().includes(lowerKeyword) ||
        (lowerKeyword.includes('passport') && tweet.content.toLowerCase().includes('passport')) ||
        (lowerKeyword.includes('visa') && tweet.content.toLowerCase().includes('visa')) ||
        (lowerKeyword.includes('tatkal') && tweet.content.toLowerCase().includes('tatkal'))
      );
    });

    this.logger.log(`Twitter/X (Mock) returned ${filteredTweets.length} filtered tweets for "${keyword}"`);
    return filteredTweets;
  }
}
